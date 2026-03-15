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
const ASSETS_ATTACHMENTS_DIR = path.join(ASSETS_UPLOAD_DIR, 'attachments');
const TRANSLATION_CACHE_FILE = path.join(ROOT, 'translations-cache.json');
const EDITOR_STATE_KEY = 'global';
const GLOBAL_SCOPE_KEY = 'global';
const VERSION_LIMIT_DEFAULT = 25;
const VERSION_LIMIT_MAX = 80;

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

function parseLimit(value, fallback = VERSION_LIMIT_DEFAULT) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(1, Math.min(VERSION_LIMIT_MAX, Math.trunc(num)));
}

function hashState(state) {
  return crypto
    .createHash('sha1')
    .update(JSON.stringify(state || {}))
    .digest('hex');
}

function normalizeScopeKey(rawScope) {
  const value = String(rawScope || '').trim().toLowerCase();
  if (!value || value === GLOBAL_SCOPE_KEY) return GLOBAL_SCOPE_KEY;
  if (value.startsWith('country:')) {
    const code = value.slice('country:'.length).trim().toUpperCase();
    return code ? `country:${code}` : GLOBAL_SCOPE_KEY;
  }
  if (/^[a-z]{2,3}$/i.test(value)) {
    return `country:${value.toUpperCase()}`;
  }
  return GLOBAL_SCOPE_KEY;
}

function extractScopeCountry(scopeKey) {
  const normalized = normalizeScopeKey(scopeKey);
  if (!normalized.startsWith('country:')) return '';
  return normalized.slice('country:'.length).trim().toUpperCase();
}

function cloneJson(value) {
  return value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : {};
}

function buildScopedVersionState(state, scopeKey) {
  const normalizedScope = normalizeScopeKey(scopeKey);
  const source = state && typeof state === 'object' ? state : {};
  if (normalizedScope === GLOBAL_SCOPE_KEY) {
    return cloneJson(source);
  }
  const countryId = extractScopeCountry(normalizedScope);
  if (!countryId) return cloneJson(source);

  const scoped = {};
  if (Object.prototype.hasOwnProperty.call(source, countryId)) {
    scoped[countryId] = cloneJson(source[countryId]);
  } else {
    scoped[countryId] = {};
  }
  if (source.__countryStatus && typeof source.__countryStatus === 'object') {
    scoped.__countryStatus = {
      [countryId]: source.__countryStatus[countryId],
    };
  }
  if (source.__representatives && typeof source.__representatives === 'object') {
    scoped.__representatives = {
      [countryId]: cloneJson(source.__representatives[countryId] || []),
    };
  }
  return scoped;
}

function applyScopedVersionState(currentState, versionState, scopeKey) {
  const normalizedScope = normalizeScopeKey(scopeKey);
  const current = currentState && typeof currentState === 'object' ? cloneJson(currentState) : {};
  const scoped = versionState && typeof versionState === 'object' ? versionState : {};
  if (normalizedScope === GLOBAL_SCOPE_KEY) {
    return cloneJson(scoped);
  }
  const countryId = extractScopeCountry(normalizedScope);
  if (!countryId) return current;

  current[countryId] = cloneJson(scoped[countryId] || {});

  if (!current.__countryStatus || typeof current.__countryStatus !== 'object') {
    current.__countryStatus = {};
  }
  if (scoped.__countryStatus && Object.prototype.hasOwnProperty.call(scoped.__countryStatus, countryId)) {
    current.__countryStatus[countryId] = scoped.__countryStatus[countryId];
  }

  if (!current.__representatives || typeof current.__representatives !== 'object') {
    current.__representatives = {};
  }
  if (scoped.__representatives && Object.prototype.hasOwnProperty.call(scoped.__representatives, countryId)) {
    current.__representatives[countryId] = cloneJson(scoped.__representatives[countryId] || []);
  }

  return current;
}

function makeVersionSnapshot(state, note) {
  return {
    id: Date.now(),
    state: state && typeof state === 'object' ? state : {},
    note: String(note || 'save'),
    createdAt: new Date().toISOString(),
  };
}

function readEditorDataFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (!Array.isArray(parsed.versions)) parsed.versions = [];
      if (!parsed.versionsByScope || typeof parsed.versionsByScope !== 'object') {
        parsed.versionsByScope = {};
      }
      return parsed;
    }
  } catch (error) {
    // fall through
  }
  return { state: {}, versions: [], versionsByScope: {} };
}

function writeEditorDataToFile(data) {
  const next =
    data && typeof data === 'object'
      ? data
      : { state: {}, versions: [], versionsByScope: {} };
  if (!Array.isArray(next.versions)) next.versions = [];
  if (!next.versionsByScope || typeof next.versionsByScope !== 'object') {
    next.versionsByScope = {};
  }
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
  let settled = false;
  let bytesRead = 0;
  let body = '';
  const done = (error, payload) => {
    if (settled) return;
    settled = true;
    callback(error || null, payload);
  };
  req.on('data', (chunk) => {
    if (settled) return;
    bytesRead += Buffer.byteLength(chunk);
    if (bytesRead > maxBytes) {
      const tooLarge = new Error('payload_too_large');
      tooLarge.code = 'payload_too_large';
      done(tooLarge);
      req.pause();
      return;
    }
    body += chunk;
  });
  req.on('end', () => {
    if (settled) return;
    try {
      const parsedBody = body ? JSON.parse(body) : {};
      done(null, parsedBody);
    } catch (error) {
      done(error);
    }
  });
  req.on('error', (error) => {
    done(error || new Error('read_failed'));
  });
}

function ensureUploadDir() {
  fs.mkdirSync(ASSETS_UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_ATTACHMENTS_DIR, { recursive: true });
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

function safeAttachmentFileName(inputName) {
  const base = String(inputName || 'attachment').replace(/[^a-zA-Z0-9._-]/g, '-');
  const ext = path.extname(base).toLowerCase();
  const allowed = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.mp3',
    '.wav',
    '.m4a',
    '.mp4',
    '.mov',
    '.webm',
    '.txt',
    '.csv',
    '.zip',
    '.rar',
    '.7z',
  ]);
  const finalExt = allowed.has(ext) ? ext : '.bin';
  const stem = path.basename(base, ext).slice(0, 60) || 'attachment';
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stem}-${stamp}-${rand}${finalExt}`;
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:([a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/);
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
  const safeName = String(inputName || 'asset').replace(/[^a-zA-Z0-9._-]/g, '-');
  const ext = path.extname(safeName).toLowerCase();
  return path.basename(safeName, ext);
}

async function uploadAssetToCloudinary(dataUrl, inputName, resourceType) {
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

  const targetResourceType = String(resourceType || 'image').trim() || 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${encodeURIComponent(targetResourceType)}/upload`;
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

async function uploadImageToCloudinary(dataUrl, inputName) {
  return uploadAssetToCloudinary(dataUrl, inputName, 'image');
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
      .then(() =>
        pgPool.query(`
          CREATE TABLE IF NOT EXISTS ecva_app_state_versions (
            id BIGSERIAL PRIMARY KEY,
            scope_key TEXT NOT NULL DEFAULT '${GLOBAL_SCOPE_KEY}',
            state JSONB NOT NULL DEFAULT '{}'::jsonb,
            state_hash TEXT NOT NULL,
            note TEXT NOT NULL DEFAULT 'save',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `),
      )
      .then(() =>
        pgPool.query(`
          ALTER TABLE ecva_app_state_versions
          ADD COLUMN IF NOT EXISTS scope_key TEXT NOT NULL DEFAULT '${GLOBAL_SCOPE_KEY}'
        `),
      )
      .then(() =>
        pgPool.query(`
          CREATE INDEX IF NOT EXISTS idx_ecva_app_state_versions_created_at
          ON ecva_app_state_versions (created_at DESC)
        `),
      )
      .then(() =>
        pgPool.query(`
          CREATE INDEX IF NOT EXISTS idx_ecva_app_state_versions_scope_created
          ON ecva_app_state_versions (scope_key, created_at DESC)
        `),
      )
      .then(() => true)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Postgres init failed:', error);
        // Allow retry on next call; do not lock app forever in file fallback.
        pgReadyPromise = null;
        return false;
      });
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

async function writeEditorDataToPostgres(data, scopeKey) {
  const ready = await ensurePostgresReady();
  if (!ready || !pgPool) return false;
  const state = data && data.state && typeof data.state === 'object' ? data.state : {};
  const updatedAt = data && data.updatedAt ? String(data.updatedAt) : new Date().toISOString();
  const note = data && data.note ? String(data.note) : 'save';
  const normalizedScope = normalizeScopeKey(scopeKey);
  const scopedState = buildScopedVersionState(state, normalizedScope);
  const stateHash = hashState(scopedState);
  const latest =
    normalizedScope === GLOBAL_SCOPE_KEY
      ? { rows: [] }
      : await pgPool.query(
          'SELECT state_hash FROM ecva_app_state_versions WHERE scope_key = $1 ORDER BY id DESC LIMIT 1',
          [normalizedScope],
        );

  await pgPool.query(
    `
      INSERT INTO ecva_app_state (id, state, updated_at)
      VALUES ($1, $2::jsonb, $3::timestamptz)
      ON CONFLICT (id)
      DO UPDATE SET state = EXCLUDED.state, updated_at = EXCLUDED.updated_at
    `,
    [EDITOR_STATE_KEY, JSON.stringify(state), updatedAt],
  );
  const latestHash =
    latest && latest.rows && latest.rows[0] && latest.rows[0].state_hash
      ? String(latest.rows[0].state_hash)
      : '';
  if (normalizedScope !== GLOBAL_SCOPE_KEY && latestHash !== stateHash) {
    await pgPool.query(
      `
        INSERT INTO ecva_app_state_versions (scope_key, state, state_hash, note)
        VALUES ($1, $2::jsonb, $3, $4)
      `,
      [normalizedScope, JSON.stringify(scopedState), stateHash, note],
    );
  }
  return true;
}

async function listEditorVersionsFromPostgres(limit, scopeKey) {
  const ready = await ensurePostgresReady();
  if (!ready || !pgPool) return [];
  const normalizedScope = normalizeScopeKey(scopeKey);
  if (normalizedScope === GLOBAL_SCOPE_KEY) return [];
  const safeLimit = parseLimit(limit);
  const result = await pgPool.query(
    `
      SELECT id, created_at, note, scope_key
      FROM ecva_app_state_versions
      WHERE scope_key = $1
      ORDER BY id DESC
      LIMIT $2
    `,
    [normalizedScope, safeLimit],
  );
  return (result.rows || []).map((row) => ({
    versionId: Number(row.id),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
    note: String((row && row.note) || 'save'),
    scope: String((row && row.scope_key) || normalizedScope),
    store: 'postgres',
  }));
}

async function readVersionStateFromPostgres(versionId, scopeKey) {
  const ready = await ensurePostgresReady();
  if (!ready || !pgPool) return null;
  const normalizedScope = normalizeScopeKey(scopeKey);
  if (normalizedScope === GLOBAL_SCOPE_KEY) return null;
  const idNum = Number(versionId);
  if (!Number.isInteger(idNum) || idNum <= 0) return null;
  const result = await pgPool.query(
    'SELECT id, state, created_at, scope_key FROM ecva_app_state_versions WHERE id = $1 AND scope_key = $2 LIMIT 1',
    [idNum, normalizedScope],
  );
  if (!result.rows.length) return null;
  const row = result.rows[0];
  return {
    versionId: Number(row.id),
    state: row && row.state && typeof row.state === 'object' ? row.state : {},
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
    scope: String((row && row.scope_key) || normalizedScope),
  };
}

function listEditorVersionsFromFile(limit, scopeKey) {
  const safeLimit = parseLimit(limit);
  const normalizedScope = normalizeScopeKey(scopeKey);
  if (normalizedScope === GLOBAL_SCOPE_KEY) return [];
  const data = readEditorDataFromFile();
  const scopedCollection =
    data.versionsByScope && typeof data.versionsByScope === 'object'
      ? data.versionsByScope
      : {};
  const versions = Array.isArray(scopedCollection[normalizedScope])
    ? scopedCollection[normalizedScope]
    : [];
  return versions
    .slice(-safeLimit)
    .reverse()
    .map((item) => ({
      versionId: Number(item.id),
      createdAt: String(item.createdAt || ''),
      note: String(item.note || 'save'),
      scope: normalizedScope,
      store: 'file',
    }));
}

function readVersionStateFromFile(versionId, scopeKey) {
  const idNum = Number(versionId);
  const normalizedScope = normalizeScopeKey(scopeKey);
  if (normalizedScope === GLOBAL_SCOPE_KEY) return null;
  if (!Number.isInteger(idNum) || idNum <= 0) return null;
  const data = readEditorDataFromFile();
  const scopedCollection =
    data.versionsByScope && typeof data.versionsByScope === 'object'
      ? data.versionsByScope
      : {};
  const versions = Array.isArray(scopedCollection[normalizedScope])
    ? scopedCollection[normalizedScope]
    : [];
  const found = versions.find((item) => Number(item && item.id) === idNum);
  if (!found || !found.state || typeof found.state !== 'object') return null;
  return {
    versionId: idNum,
    state: found.state,
    createdAt: String(found.createdAt || ''),
    scope: normalizedScope,
  };
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
  const scopeKey = normalizeScopeKey(payload.scopeKey);
  const state = payload.state && typeof payload.state === 'object' ? payload.state : {};
  let persistedToDb = false;
  try {
    persistedToDb = await writeEditorDataToPostgres(
      {
        ...payload,
        state,
      },
      scopeKey,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Postgres write failed:', error);
    persistedToDb = false;
  }
  if (!persistedToDb) {
    const current = readEditorDataFromFile();
    const versionsByScope =
      current.versionsByScope && typeof current.versionsByScope === 'object'
        ? { ...current.versionsByScope }
        : {};
    if (scopeKey !== GLOBAL_SCOPE_KEY) {
      const currentScopeVersions = Array.isArray(versionsByScope[scopeKey])
        ? versionsByScope[scopeKey].slice()
        : [];
      const scopedState = buildScopedVersionState(state, scopeKey);
      const nextHash = hashState(scopedState);
      const latestHash =
        currentScopeVersions.length &&
        currentScopeVersions[currentScopeVersions.length - 1] &&
        currentScopeVersions[currentScopeVersions.length - 1].state
          ? hashState(currentScopeVersions[currentScopeVersions.length - 1].state)
          : '';
      if (latestHash !== nextHash) {
        currentScopeVersions.push(makeVersionSnapshot(scopedState, payload.note || 'save'));
      }
      versionsByScope[scopeKey] = currentScopeVersions.slice(-VERSION_LIMIT_MAX);
    }
    writeEditorDataToFile({
      ...current,
      state,
      updatedAt: payload.updatedAt || new Date().toISOString(),
      versionsByScope,
    });
  } else {
    // Keep local backup for development and recovery even when DB is enabled.
    const current = readEditorDataFromFile();
    writeEditorDataToFile({
      ...current,
      state,
      updatedAt: payload.updatedAt || new Date().toISOString(),
    });
  }
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
      readJsonBody(req, 8 * 1024 * 1024, async (error, parsedBody) => {
        if (error) {
          if (error.code === 'payload_too_large') {
            return sendJson(res, 413, { ok: false, error: 'payload_too_large' });
          }
          return sendJson(res, 400, { ok: false, error: 'invalid_json' });
        }
        const state = parsedBody && parsedBody.state && typeof parsedBody.state === 'object'
          ? parsedBody.state
          : {};
        const scopeKey = normalizeScopeKey(parsedBody && parsedBody.scope);
        const payload = { state, updatedAt: new Date().toISOString(), scopeKey };
        try {
          const persistedToDb = await writeEditorData(payload);
          return sendJson(res, 200, {
            ok: true,
            updatedAt: payload.updatedAt,
            scope: scopeKey,
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

  if (pathname === '/api/editor-data/versions') {
    if (req.method === 'GET') {
      try {
        const limit = parseLimit(parsed.query && parsed.query.limit);
        const scopeKey = normalizeScopeKey(parsed.query && parsed.query.scope);
        let versions = [];
        if (pgPool) {
          versions = await listEditorVersionsFromPostgres(limit, scopeKey);
        } else {
          versions = listEditorVersionsFromFile(limit, scopeKey);
        }
        return sendJson(res, 200, { ok: true, scope: scopeKey, versions });
      } catch (error) {
        return sendJson(res, 500, { ok: false, error: 'versions_read_failed' });
      }
    }

    if (req.method === 'POST') {
      readJsonBody(req, 256 * 1024, async (error, parsedBody) => {
        if (error) {
          if (error.code === 'payload_too_large') {
            return sendJson(res, 413, { ok: false, error: 'payload_too_large' });
          }
          return sendJson(res, 400, { ok: false, error: 'invalid_json' });
        }
        const versionId = Number(parsedBody && parsedBody.versionId);
        const scopeKey = normalizeScopeKey(parsedBody && parsedBody.scope);
        if (scopeKey === GLOBAL_SCOPE_KEY) {
          return sendJson(res, 400, { ok: false, error: 'global_scope_not_supported' });
        }
        if (!Number.isInteger(versionId) || versionId <= 0) {
          return sendJson(res, 400, { ok: false, error: 'invalid_version_id' });
        }
        try {
          const version = pgPool
            ? await readVersionStateFromPostgres(versionId, scopeKey)
            : readVersionStateFromFile(versionId, scopeKey);
          if (!version) {
            return sendJson(res, 404, { ok: false, error: 'version_not_found' });
          }
          const current = await readEditorData();
          const mergedState = applyScopedVersionState(current && current.state, version.state, scopeKey);
          const payload = {
            state: mergedState,
            updatedAt: new Date().toISOString(),
            note: `rollback:${version.versionId}`,
            scopeKey,
          };
          const persistedToDb = await writeEditorData(payload);
          return sendJson(res, 200, {
            ok: true,
            state: mergedState,
            restoredFrom: version.versionId,
            updatedAt: payload.updatedAt,
            scope: scopeKey,
            store: persistedToDb ? 'postgres' : 'file',
          });
        } catch (rollbackError) {
          return sendJson(res, 500, { ok: false, error: 'rollback_failed' });
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
        if (error.code === 'payload_too_large') {
          return sendJson(res, 413, { ok: false, error: 'payload_too_large' });
        }
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
        // eslint-disable-next-line no-console
        console.error('Upload failed:', writeError);
        return sendJson(res, 500, {
          ok: false,
          error: 'write_failed',
          details: String(writeError && writeError.message ? writeError.message : ''),
        });
      }
    });
    return;
  }

  if (pathname === '/api/upload-attachment') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    }
    readJsonBody(req, 20 * 1024 * 1024, async (error, parsedBody) => {
      if (error) {
        if (error.code === 'payload_too_large') {
          return sendJson(res, 413, { ok: false, error: 'payload_too_large' });
        }
        return sendJson(res, 400, { ok: false, error: 'invalid_json' });
      }
      const filename = safeAttachmentFileName(parsedBody && parsedBody.filename);
      const dataUrl = String(parsedBody && parsedBody.dataUrl ? parsedBody.dataUrl : '');
      const parsedDataUrl = parseDataUrl(dataUrl);
      if (!parsedDataUrl) {
        return sendJson(res, 400, { ok: false, error: 'invalid_data_url' });
      }
      try {
        if (isCloudinaryConfigured()) {
          const mime = String(parsedDataUrl.mime || '').toLowerCase();
          const targetResourceType = mime.startsWith('image/')
            ? 'image'
            : mime.startsWith('video/') || mime.startsWith('audio/')
              ? 'video'
              : 'raw';
          const assetUrl = await uploadAssetToCloudinary(
            dataUrl,
            filename,
            targetResourceType,
          );
          return sendJson(res, 200, {
            ok: true,
            path: assetUrl,
            provider: 'cloudinary',
          });
        }
        ensureUploadDir();
        const outPath = path.join(ASSETS_ATTACHMENTS_DIR, filename);
        const bytes = Buffer.from(parsedDataUrl.base64, 'base64');
        fs.writeFileSync(outPath, bytes);
        return sendJson(res, 200, {
          ok: true,
          path: `/assets/uploads/attachments/${filename}`,
          provider: 'local',
        });
      } catch (writeError) {
        // eslint-disable-next-line no-console
        console.error('Attachment upload failed:', writeError);
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
        if (error.code === 'payload_too_large') {
          return sendJson(res, 413, { ok: false, error: 'payload_too_large' });
        }
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
