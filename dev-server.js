const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8081);
const DATA_FILE = path.join(ROOT, 'editor-data.json');
const ASSETS_UPLOAD_DIR = path.join(ROOT, 'assets', 'uploads');
const TRANSLATION_CACHE_FILE = path.join(ROOT, 'translations-cache.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function readEditorData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    // fall through
  }
  return { state: {} };
}

function writeEditorData(data) {
  const next = data && typeof data === 'object' ? data : { state: {} };
  fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2), 'utf8');
}

function readTranslationCache() {
  try {
    const raw = fs.readFileSync(TRANSLATION_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (error) {
    // fall through
  }
  return {};
}

function writeTranslationCache(cache) {
  const next = cache && typeof cache === 'object' ? cache : {};
  fs.writeFileSync(TRANSLATION_CACHE_FILE, JSON.stringify(next, null, 2), 'utf8');
}

function readJsonBody(req, maxBytes, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > maxBytes) {
      req.destroy();
    }
  });
  req.on('end', () => {
    try {
      const parsedBody = body ? JSON.parse(body) : {};
      callback(null, parsedBody);
    } catch (error) {
      callback(error);
    }
  });
}

function ensureUploadDir() {
  fs.mkdirSync(ASSETS_UPLOAD_DIR, { recursive: true });
}

function safeUploadFileName(inputName) {
  const base = String(inputName || 'image').replace(/[^a-zA-Z0-9._-]/g, '-');
  const ext = path.extname(base).toLowerCase();
  const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
  const finalExt = allowed.has(ext) ? ext : '.png';
  const stem = path.basename(base, ext).slice(0, 60) || 'image';
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stem}-${stamp}-${rand}${finalExt}`;
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const base64 = match[2];
  return { mime, base64 };
}

function httpGetJson(targetUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(targetUrl, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(`translate_status_${response.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error('translate_invalid_json'));
          }
        });
      })
      .on('error', reject);
  });
}

function extractGoogleTranslation(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return '';
  return payload[0].map((segment) => (Array.isArray(segment) ? String(segment[0] || '') : '')).join('');
}

async function translateTextGoogle(text, sourceLang, targetLang) {
  const query = new url.URLSearchParams({
    client: 'gtx',
    sl: sourceLang || 'en',
    tl: targetLang || 'en',
    dt: 't',
    q: text,
  });
  const endpoint = `https://translate.googleapis.com/translate_a/single?${query.toString()}`;
  const payload = await httpGetJson(endpoint);
  const translated = extractGoogleTranslation(payload);
  return translated || text;
}

async function translateBatchCached(texts, sourceLang, targetLang) {
  const cleanTexts = Array.isArray(texts)
    ? texts.map((item) => String(item || '')).map((t) => t.trim())
    : [];
  if (!cleanTexts.length || targetLang === sourceLang) return cleanTexts;

  const cache = readTranslationCache();
  if (!cache[targetLang]) cache[targetLang] = {};
  const langCache = cache[targetLang];
  const results = [];
  let changed = false;

  for (const text of cleanTexts) {
    if (!text) {
      results.push('');
      continue;
    }
    const hasCached = Object.prototype.hasOwnProperty.call(langCache, text);
    if (hasCached) {
      const cachedValue = String(langCache[text] || text);
      // If a previous transient failure stored the source text as target translation,
      // retry once to recover real translation when the provider becomes available.
      if (!(cachedValue === text && targetLang !== sourceLang)) {
        results.push(cachedValue);
        continue;
      }
    }
    try {
      const translated = await translateTextGoogle(text, sourceLang, targetLang);
      const value = String(translated || text);
      langCache[text] = value;
      results.push(value);
      changed = true;
      continue;
    } catch (error) {
      // Do not cache fallback source text on translation errors,
      // otherwise entries get permanently stuck in EN.
      results.push(text);
    }
  }

  if (changed) {
    writeTranslationCache(cache);
  }
  return results;
}

function safePathname(pathname) {
  const decoded = decodeURIComponent(pathname || '/');
  const clean = decoded === '/' ? '/index.html' : decoded;
  const normalized = path.normalize(clean).replace(/^\.\.(\/|\\|$)+/, '');
  return normalized.startsWith(path.sep) ? normalized.slice(1) : normalized;
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';

  if (pathname === '/api/editor-data') {
    if (req.method === 'GET') {
      return sendJson(res, 200, readEditorData());
    }

    if (req.method === 'POST') {
      readJsonBody(req, 2 * 1024 * 1024, (error, parsedBody) => {
        if (error) {
          return sendJson(res, 400, { ok: false, error: 'invalid_json' });
        }
        const state = parsedBody && parsedBody.state && typeof parsedBody.state === 'object'
          ? parsedBody.state
          : {};
        const payload = { state, updatedAt: new Date().toISOString() };
        writeEditorData(payload);
        return sendJson(res, 200, { ok: true, updatedAt: payload.updatedAt });
      });
      return;
    }

    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  if (pathname === '/api/upload-image') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    }
    readJsonBody(req, 15 * 1024 * 1024, (error, parsedBody) => {
      if (error) {
        return sendJson(res, 400, { ok: false, error: 'invalid_json' });
      }
      const filename = safeUploadFileName(parsedBody && parsedBody.filename);
      const parsed = parseDataUrl(parsedBody && parsedBody.dataUrl);
      if (!parsed) {
        return sendJson(res, 400, { ok: false, error: 'invalid_data_url' });
      }
      try {
        ensureUploadDir();
        const outPath = path.join(ASSETS_UPLOAD_DIR, filename);
        const bytes = Buffer.from(parsed.base64, 'base64');
        fs.writeFileSync(outPath, bytes);
        return sendJson(res, 200, {
          ok: true,
          path: `/assets/uploads/${filename}`,
        });
      } catch (writeError) {
        return sendJson(res, 500, { ok: false, error: 'write_failed' });
      }
    });
    return;
  }

  if (pathname === '/api/translate-batch') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    }
    readJsonBody(req, 3 * 1024 * 1024, async (error, parsedBody) => {
      if (error) {
        return sendJson(res, 400, { ok: false, error: 'invalid_json' });
      }
      const targetLang = String((parsedBody && parsedBody.targetLang) || 'en').trim().toLowerCase();
      const sourceLang = String((parsedBody && parsedBody.sourceLang) || 'en').trim().toLowerCase();
      const texts = Array.isArray(parsedBody && parsedBody.texts) ? parsedBody.texts : [];
      try {
        const translated = await translateBatchCached(texts, sourceLang, targetLang);
        return sendJson(res, 200, { ok: true, translated });
      } catch (translationError) {
        return sendJson(res, 200, {
          ok: true,
          translated: texts.map((item) => String(item || '')),
          fallback: true,
        });
      }
    });
    return;
  }

  const rel = safePathname(pathname);
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ECVA server running at http://localhost:${PORT}`);
});
