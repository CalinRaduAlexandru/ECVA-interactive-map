const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const crypto = require('crypto');

let Pool = null;
try {
  ({ Pool } = require('pg'));
} catch (error) {
  Pool = null;
}

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8081);
const DATA_FILE = path.join(ROOT, 'editor-data.json');
const ASSETS_UPLOAD_DIR = path.join(ROOT, 'assets', 'uploads');
const TRANSLATION_CACHE_FILE = path.join(ROOT, 'translations-cache.json');
const EDITOR_STATE_KEY = 'global';

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

function readEditorDataFromFile() {
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

function writeEditorDataToFile(data) {
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

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function buildCloudinaryPublicId(inputName) {
  const safeName = safeUploadFileName(inputName);
  const ext = path.extname(safeName).toLowerCase();
  return path.basename(safeName, ext);
}

async function uploadImageToCloudinary(dataUrl, inputName) {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim();
  const folder = String(process.env.CLOUDINARY_FOLDER || 'ecva-map').trim();
  const publicId = buildCloudinaryPublicId(inputName);
  const timestamp = Math.floor(Date.now() / 1000);

  const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

  const form = new FormData();
  form.append('file', String(dataUrl || ''));
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('public_id', publicId);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
  const response = await fetch(endpoint, { method: 'POST', body: form });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`cloudinary_upload_failed:${response.status}:${details}`);
  }
  const payload = await response.json();
  const imageUrl = String(payload && payload.secure_url ? payload.secure_url : '').trim();
  if (!imageUrl) {
    throw new Error('cloudinary_upload_missing_url');
  }
  return imageUrl;
}

function createPostgresClient() {
  if (!Pool || !process.env.DATABASE_URL) return null;
  const sslEnabled = String(process.env.PGSSL || 'require').toLowerCase() !== 'disable';
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });
}

const pgPool = createPostgresClient();
let pgReadyPromise = null;

async function ensurePostgresReady() {
  if (!pgPool) return false;
  if (!pgReadyPromise) {
    pgReadyPromise = pgPool
      .query(`
        CREATE TABLE IF NOT EXISTS ecva_app_state (
          id TEXT PRIMARY KEY,
          state JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      .then(() => true)
      .catch(() => false);
  }
  return pgReadyPromise;
}

async function readEditorDataFromPostgres() {
  const ready = await ensurePostgresReady();
  if (!ready || !pgPool) return null;
  const result = await pgPool.query(
    'SELECT state, updated_at FROM ecva_app_state WHERE id = $1 LIMIT 1',
    [EDITOR_STATE_KEY],
  );
  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    state: row && row.state && typeof row.state === 'object' ? row.state : {},
    updatedAt: row && row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

async function writeEditorDataToPostgres(data) {
  const ready = await ensurePostgresReady();
  if (!ready || !pgPool) return false;
  const state = data && data.state && typeof data.state === 'object' ? data.state : {};
  const updatedAt = data && data.updatedAt ? String(data.updatedAt) : new Date().toISOString();
  await pgPool.query(
    `
      INSERT INTO ecva_app_state (id, state, updated_at)
      VALUES ($1, $2::jsonb, $3::timestamptz)
      ON CONFLICT (id)
      DO UPDATE SET state = EXCLUDED.state, updated_at = EXCLUDED.updated_at
    `,
    [EDITOR_STATE_KEY, JSON.stringify(state), updatedAt],
  );
  return true;
}

async function readEditorData() {
  try {
    const fromDb = await readEditorDataFromPostgres();
    if (fromDb) return fromDb;
  } catch (error) {
    // Fall back to file store.
  }
  return readEditorDataFromFile();
}

async function writeEditorData(data) {
  const payload = data && typeof data === 'object' ? data : { state: {} };
  let persistedToDb = false;
  try {
    persistedToDb = await writeEditorDataToPostgres(payload);
  } catch (error) {
    persistedToDb = false;
  }
  // Keep local backup for development and recovery even when DB is enabled.
  writeEditorDataToFile(payload);
  return persistedToDb;
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

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';

  if (pathname === '/api/editor-data') {
    if (req.method === 'GET') {
      try {
        const data = await readEditorData();
        return sendJson(res, 200, data);
      } catch (error) {
        return sendJson(res, 500, { ok: false, error: 'state_read_failed' });
      }
    }

    if (req.method === 'POST') {
      readJsonBody(req, 2 * 1024 * 1024, async (error, parsedBody) => {
        if (error) {
          return sendJson(res, 400, { ok: false, error: 'invalid_json' });
        }
        const state = parsedBody && parsedBody.state && typeof parsedBody.state === 'object'
          ? parsedBody.state
          : {};
        const payload = { state, updatedAt: new Date().toISOString() };
        try {
          const persistedToDb = await writeEditorData(payload);
          return sendJson(res, 200, {
            ok: true,
            updatedAt: payload.updatedAt,
            store: persistedToDb ? 'postgres' : 'file',
          });
        } catch (writeError) {
          return sendJson(res, 500, { ok: false, error: 'state_write_failed' });
        }
      });
      return;
    }

    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  if (pathname === '/api/upload-image') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    }
    readJsonBody(req, 15 * 1024 * 1024, async (error, parsedBody) => {
      if (error) {
        return sendJson(res, 400, { ok: false, error: 'invalid_json' });
      }
      const filename = safeUploadFileName(parsedBody && parsedBody.filename);
      const dataUrl = String(parsedBody && parsedBody.dataUrl ? parsedBody.dataUrl : '');
      const parsedDataUrl = parseDataUrl(dataUrl);
      if (!parsedDataUrl) {
        return sendJson(res, 400, { ok: false, error: 'invalid_data_url' });
      }
      try {
        if (isCloudinaryConfigured()) {
          const imageUrl = await uploadImageToCloudinary(dataUrl, filename);
          return sendJson(res, 200, {
            ok: true,
            path: imageUrl,
            provider: 'cloudinary',
          });
        }
        ensureUploadDir();
        const outPath = path.join(ASSETS_UPLOAD_DIR, filename);
        const bytes = Buffer.from(parsedDataUrl.base64, 'base64');
        fs.writeFileSync(outPath, bytes);
        return sendJson(res, 200, {
          ok: true,
          path: `/assets/uploads/${filename}`,
          provider: 'local',
        });
      } catch (writeError) {
        return sendJson(res, 500, {
          ok: false,
          error: 'write_failed',
          details: String(writeError && writeError.message ? writeError.message : ''),
        });
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
  // eslint-disable-next-line no-console
  console.log(
    `State store: ${pgPool ? 'postgres' : 'file'} | Image store: ${isCloudinaryConfigured() ? 'cloudinary' : 'local'}`,
  );
});
