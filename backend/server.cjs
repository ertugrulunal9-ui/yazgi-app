#!/usr/bin/env node
/* eslint-disable no-console */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

const MAX_BODY_BYTES = Number(process.env.CLOUDSYNC_MAX_BODY_BYTES || 512 * 1024);
const SOFT_DELETE = process.env.CLOUDSYNC_SOFT_DELETE !== 'false';
const ALLOW_DEV_TOKENS = process.env.CLOUDSYNC_ALLOW_DEV_TOKENS === 'true';
const REQUIRE_TLS = process.env.CLOUDSYNC_REQUIRE_TLS !== 'false';
const TRUST_PROXY = process.env.CLOUDSYNC_TRUST_PROXY !== 'false';
const ENABLE_HSTS = process.env.CLOUDSYNC_ENABLE_HSTS !== 'false';

const JWT_HS256_SECRET = process.env.CLOUDSYNC_JWT_HS256_SECRET || '';
const JWT_HS256_SECRETS = parseJwtSecrets(process.env.CLOUDSYNC_JWT_HS256_SECRETS, JWT_HS256_SECRET);
const EXPECTED_ISSUERS = splitCsv(process.env.CLOUDSYNC_JWT_ISSUERS);
const EXPECTED_AUDIENCES = splitCsv(process.env.CLOUDSYNC_JWT_AUDIENCES);

const DATA_DIR = process.env.CLOUDSYNC_DATA_DIR || path.join(__dirname, 'data');
const DB_FILE_PATH = process.env.CLOUDSYNC_DB_PATH || path.join(DATA_DIR, 'cloudsync.store.enc.json');
const AUDIT_LOG_PATH = process.env.CLOUDSYNC_AUDIT_LOG_PATH || path.join(DATA_DIR, 'cloudsync.audit.log');
const ENCRYPTION_KEYS = parseEncryptionKeys(process.env.CLOUDSYNC_ENCRYPTION_KEYS);
let ACTIVE_ENCRYPTION_KID = process.env.CLOUDSYNC_ACTIVE_ENC_KEY_ID || '';

const REVENUECAT_API_BASE = process.env.CLOUDSYNC_REVENUECAT_API_BASE || 'https://api.revenuecat.com/v1';
const REVENUECAT_SECRET_API_KEY = process.env.CLOUDSYNC_REVENUECAT_SECRET_API_KEY || '';
const REVENUECAT_WEBHOOK_SECRET = process.env.CLOUDSYNC_REVENUECAT_WEBHOOK_SECRET || '';

const PRODUCT_IDS = new Set([
  'premium_traits',
  'save_slots_premium',
  'cosmetics_pack',
  'energy_refill',
  'season_pass',
  'remove_ads',
]);

const ENTITLEMENT_TO_PRODUCT = {
  premium: 'save_slots_premium',
  premium_slots: 'save_slots_premium',
  no_ads: 'remove_ads',
  season_pass: 'season_pass',
  ...parseEntitlementMap(process.env.CLOUDSYNC_ENTITLEMENT_MAP),
};

const RATE_LIMITS = {
  readSlot: { limit: 120, windowMs: 60_000 },
  listSlots: { limit: 60, windowMs: 60_000 },
  writeSlot: { limit: 30, windowMs: 60_000 },
  deleteSlot: { limit: 10, windowMs: 60_000 },
  deleteAll: { limit: 3, windowMs: 60 * 60_000 },
  readEntitlements: { limit: 60, windowMs: 60_000 },
  refreshEntitlements: { limit: 10, windowMs: 60_000 },
  webhook: { limit: 180, windowMs: 60_000 },
};

const rateStore = new Map();
const saveStore = new Map();
const entitlementStore = new Map();

let persistQueue = Promise.resolve();

assertProductionSecurity();
initializeEncryptionKeys();
loadPersistentStore();

function assertProductionSecurity() {
  if (!IS_PROD) return;
  if (ALLOW_DEV_TOKENS) {
    throw new Error('CLOUDSYNC_ALLOW_DEV_TOKENS must remain false in production');
  }
  if (JWT_HS256_SECRETS.length === 0) {
    throw new Error('JWT secret configuration is required in production');
  }
  if (!REQUIRE_TLS) {
    throw new Error('CLOUDSYNC_REQUIRE_TLS must remain true in production');
  }
}

function splitCsv(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseEntitlementMap(raw) {
  const mapped = {};
  for (const entry of splitCsv(raw)) {
    const idx = entry.indexOf('=');
    if (idx <= 0) continue;
    const key = entry.slice(0, idx).trim().toLowerCase();
    const value = entry.slice(idx + 1).trim();
    if (!key || !PRODUCT_IDS.has(value)) continue;
    mapped[key] = value;
  }
  return mapped;
}

function parseJwtSecrets(raw, legacySecret) {
  const secrets = [];
  for (const entry of splitCsv(raw)) {
    const idx = entry.indexOf(':');
    if (idx > 0) {
      const kid = entry.slice(0, idx).trim();
      const secret = entry.slice(idx + 1).trim();
      if (kid && secret) secrets.push({ kid, secret });
      continue;
    }
    if (entry.length > 0) {
      secrets.push({ kid: null, secret: entry });
    }
  }
  if (legacySecret) {
    secrets.push({ kid: 'legacy', secret: legacySecret });
  }
  return secrets;
}

function parseEncryptionKeys(raw) {
  const map = new Map();
  for (const entry of splitCsv(raw)) {
    const idx = entry.indexOf(':');
    if (idx <= 0) {
      throw new Error('CLOUDSYNC_ENCRYPTION_KEYS entries must be in format kid:base64_32byte_key');
    }
    const kid = entry.slice(0, idx).trim();
    const encoded = entry.slice(idx + 1).trim();
    if (!kid || !encoded) continue;
    const keyBytes = base64UrlDecode(encoded);
    if (keyBytes.length !== 32) {
      throw new Error(`Encryption key "${kid}" must decode to 32 bytes`);
    }
    map.set(kid, keyBytes);
  }
  return map;
}

function initializeEncryptionKeys() {
  if (ENCRYPTION_KEYS.size > 0) {
    if (!ACTIVE_ENCRYPTION_KID || !ENCRYPTION_KEYS.has(ACTIVE_ENCRYPTION_KID)) {
      ACTIVE_ENCRYPTION_KID = ENCRYPTION_KEYS.keys().next().value;
    }
    return;
  }

  if (IS_PROD) {
    throw new Error('CLOUDSYNC_ENCRYPTION_KEYS is required in production');
  }

  const ephemeralKid = 'ephemeral-dev';
  ENCRYPTION_KEYS.set(ephemeralKid, crypto.randomBytes(32));
  ACTIVE_ENCRYPTION_KID = ephemeralKid;
  console.warn('[cloudsync] CLOUDSYNC_ENCRYPTION_KEYS missing. Using ephemeral dev key.');
}

function requestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

function nowIso() {
  return new Date().toISOString();
}

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const normalized = String(input).replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

function timingSafeEqualText(left, right) {
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function rateLimitCheck(bucketKey, actorKey) {
  const conf = RATE_LIMITS[bucketKey];
  const key = `${bucketKey}:${actorKey}`;
  const now = Date.now();
  const existing = rateStore.get(key);

  if (!existing || now >= existing.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + conf.windowMs });
    return null;
  }

  if (existing.count >= conf.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { retryAfterSec };
  }

  existing.count += 1;
  return null;
}

function isLoopbackRequest(req) {
  const ip = getClientIp(req);
  if (!ip) return false;
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.0.0.1');
}

function isSecureTransport(req) {
  if (req.socket && req.socket.encrypted) return true;
  if (!TRUST_PROXY) return false;
  const protoHeader = req.headers['x-forwarded-proto'];
  if (typeof protoHeader !== 'string') return false;
  const proto = protoHeader.split(',')[0].trim().toLowerCase();
  return proto === 'https';
}

function applySecurityHeaders(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (ENABLE_HSTS && isSecureTransport(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
}

function json(req, res, statusCode, payload, headers = {}) {
  applySecurityHeaders(req, res);
  const body = payload ? JSON.stringify(payload) : '';
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(body);
}

function noContent(req, res, headers = {}) {
  applySecurityHeaders(req, res);
  res.writeHead(204, headers);
  res.end();
}

function error(req, res, statusCode, code, message, requestIdValue, extra = {}, headers = {}) {
  json(
    req,
    res,
    statusCode,
    {
      error: {
        code,
        message,
        requestId: requestIdValue,
        ...extra,
      },
    },
    headers
  );
}

function anonymizeForAudit(value) {
  if (value === null || value === undefined) return null;
  return sha256Hex(String(value)).slice(0, 16);
}

function writeAudit(req, reqId, action, outcome, details = {}) {
  const entry = {
    ts: nowIso(),
    requestId: reqId,
    action,
    outcome,
    method: req.method || 'GET',
    path: req.url || '/',
    ip: getClientIp(req),
    userHash: details.userId ? anonymizeForAudit(details.userId) : null,
    slotId: details.slotId || null,
    code: details.code || null,
    statusCode: details.statusCode || null,
    note: details.note || null,
  };

  try {
    ensureDir(path.dirname(AUDIT_LOG_PATH));
    fs.appendFile(AUDIT_LOG_PATH, `${JSON.stringify(entry)}\n`, () => {});
  } catch (auditError) {
    console.error('[cloudsync] failed to append audit log', auditError);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function storeKey(userId, slotId) {
  return `${userId}::${slotId}`;
}

function getRecord(userId, slotId) {
  return saveStore.get(storeKey(userId, slotId)) || null;
}

function setRecord(userId, slotId, record) {
  saveStore.set(storeKey(userId, slotId), record);
}

function deleteRecord(userId, slotId) {
  saveStore.delete(storeKey(userId, slotId));
}

function listRecords(userId) {
  const prefix = `${userId}::`;
  const result = [];
  for (const [key, value] of saveStore.entries()) {
    if (key.startsWith(prefix)) result.push(value);
  }
  return result;
}

function defaultEntitlementRecord(userId) {
  return {
    userId,
    products: [],
    source: 'none',
    updatedAt: nowIso(),
    revision: 0,
    lastEventId: null,
  };
}

function getEntitlementRecord(userId) {
  return entitlementStore.get(userId) || defaultEntitlementRecord(userId);
}

function normalizeProductCandidates(candidates) {
  const set = new Set();
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const normalized = candidate.trim().toLowerCase();
    if (!normalized) continue;
    if (PRODUCT_IDS.has(normalized)) {
      set.add(normalized);
      continue;
    }
    const mapped = ENTITLEMENT_TO_PRODUCT[normalized];
    if (mapped && PRODUCT_IDS.has(mapped)) {
      set.add(mapped);
    }
  }
  return Array.from(set).sort();
}

function setEntitlementRecord(userId, products, source, lastEventId = null) {
  const existing = entitlementStore.get(userId) || defaultEntitlementRecord(userId);
  const normalizedProducts = normalizeProductCandidates(products);
  const next = {
    ...existing,
    userId,
    products: normalizedProducts,
    source,
    updatedAt: nowIso(),
    revision: existing.revision + 1,
    lastEventId: lastEventId || existing.lastEventId || null,
  };
  entitlementStore.set(userId, next);
  return next;
}

function buildEntitlementFlags(products) {
  const set = new Set(products);
  return {
    premiumSlots: set.has('save_slots_premium') || set.has('season_pass'),
    removeAds: set.has('remove_ads') || set.has('season_pass'),
    seasonPass: set.has('season_pass'),
    premiumTraits: set.has('premium_traits'),
    cosmeticsPack: set.has('cosmetics_pack'),
    energyRefill: set.has('energy_refill'),
  };
}

function buildEntitlementResponse(record) {
  return {
    userId: record.userId,
    products: [...record.products],
    flags: buildEntitlementFlags(record.products),
    source: record.source,
    revision: record.revision,
    updatedAt: record.updatedAt,
  };
}

function parseIfMatch(req) {
  const value = req.headers['if-match'];
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const normalized = value.trim().replace(/^W\//, '').replace(/^"/, '').replace(/"$/, '');
  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

function validateSavePayload(slotId, payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    errors.push('Body must be an object');
    return errors;
  }
  if (!payload.metadata || typeof payload.metadata !== 'object' || Array.isArray(payload.metadata)) {
    errors.push('metadata must be an object');
  } else if (payload.metadata.slotId && String(payload.metadata.slotId) !== slotId) {
    errors.push('metadata.slotId does not match route slotId');
  }
  if (typeof payload.playerName !== 'string') {
    errors.push('playerName must be a string');
  }
  if (!payload.stats || typeof payload.stats !== 'object' || Array.isArray(payload.stats)) {
    errors.push('stats must be an object');
  }
  if (!payload.gameState || typeof payload.gameState !== 'object' || Array.isArray(payload.gameState)) {
    errors.push('gameState must be an object');
  }
  return errors;
}

function validateIntegrityHeaders(req, payload, rawBody) {
  const saveVersionRaw = req.headers['x-save-version'];
  const saveChecksum = req.headers['x-save-checksum'];

  if (typeof saveVersionRaw !== 'string' || saveVersionRaw.trim().length === 0) {
    return { ok: false, code: 'validation_error', message: 'Missing X-Save-Version header' };
  }
  if (typeof saveChecksum !== 'string' || saveChecksum.trim().length === 0) {
    return { ok: false, code: 'validation_error', message: 'Missing X-Save-Checksum header' };
  }

  const saveVersion = Number(saveVersionRaw);
  if (!Number.isFinite(saveVersion) || saveVersion < 0) {
    return { ok: false, code: 'validation_error', message: 'X-Save-Version must be a non-negative number' };
  }

  const bodyVersion = payload && payload.metadata ? payload.metadata.version : undefined;
  if (typeof bodyVersion === 'number' && bodyVersion !== saveVersion) {
    return { ok: false, code: 'integrity_mismatch', message: 'Body metadata.version mismatch' };
  }

  const bodyChecksum = payload && payload.metadata ? payload.metadata.checksum : undefined;
  if (typeof bodyChecksum === 'string' && bodyChecksum.length > 0 && bodyChecksum !== saveChecksum) {
    return { ok: false, code: 'integrity_mismatch', message: 'Body metadata.checksum mismatch' };
  }

  const suppliedSha = req.headers['x-content-sha256'];
  const computedSha = sha256Hex(rawBody);
  if (typeof suppliedSha === 'string' && suppliedSha.trim().length > 0) {
    if (suppliedSha.toLowerCase() !== computedSha) {
      return { ok: false, code: 'integrity_mismatch', message: 'X-Content-SHA256 mismatch' };
    }
  }

  return {
    ok: true,
    saveVersion,
    saveChecksum: saveChecksum.trim(),
    serverSha256: computedSha,
  };
}

function base64UrlToUtf8(input) {
  return base64UrlDecode(input).toString('utf8');
}

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT');
  }
  const headerB64 = parts[0];
  const payloadB64 = parts[1];
  const signatureB64 = parts[2];

  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlToUtf8(headerB64));
    payload = JSON.parse(base64UrlToUtf8(payloadB64));
  } catch {
    throw new Error('Invalid JWT encoding');
  }

  return {
    header,
    payload,
    signingInput: `${headerB64}.${payloadB64}`,
    signatureB64,
  };
}

function verifyHs256(token) {
  const parsed = parseJwt(token);
  if (parsed.header.alg !== 'HS256') {
    throw new Error(`Unsupported alg: ${parsed.header.alg || 'unknown'}`);
  }

  if (JWT_HS256_SECRETS.length === 0) {
    throw new Error('JWT secret missing on server');
  }

  const tokenKid = typeof parsed.header.kid === 'string' ? parsed.header.kid : null;
  const candidates = tokenKid
    ? JWT_HS256_SECRETS.filter((entry) => entry.kid === tokenKid)
    : JWT_HS256_SECRETS;

  const fallbackCandidates = candidates.length > 0 ? candidates : JWT_HS256_SECRETS;

  for (const candidate of fallbackCandidates) {
    const expected = crypto
      .createHmac('sha256', candidate.secret)
      .update(parsed.signingInput)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    if (timingSafeEqualText(expected, parsed.signatureB64)) {
      return parsed.payload;
    }
  }

  throw new Error('JWT signature mismatch');
}

function hasExpectedAudience(audClaim) {
  if (EXPECTED_AUDIENCES.length === 0) return true;
  if (typeof audClaim === 'string') return EXPECTED_AUDIENCES.includes(audClaim);
  if (Array.isArray(audClaim)) {
    return audClaim.some((item) => typeof item === 'string' && EXPECTED_AUDIENCES.includes(item));
  }
  return false;
}

function validateClaims(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid token payload');
  }
  if (typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
    throw new Error('Token missing sub claim');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && nowSec >= payload.exp) {
    throw new Error('Token expired');
  }
  if (typeof payload.nbf === 'number' && nowSec < payload.nbf) {
    throw new Error('Token not active yet');
  }
  if (
    EXPECTED_ISSUERS.length > 0 &&
    (typeof payload.iss !== 'string' || !EXPECTED_ISSUERS.includes(payload.iss))
  ) {
    throw new Error('Token issuer is not allowed');
  }
  if (!hasExpectedAudience(payload.aud)) {
    throw new Error('Token audience is not allowed');
  }

  return {
    sub: payload.sub.trim(),
    claims: payload,
  };
}

function parseBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return match[1].trim();
}

function authenticate(req) {
  const token = parseBearerToken(req);
  if (!token) {
    const e = new Error('Missing bearer token');
    e.statusCode = 401;
    e.code = 'auth_missing_token';
    throw e;
  }

  if (ALLOW_DEV_TOKENS && token.startsWith('dev_')) {
    const sub = token.slice(4).trim();
    if (!sub) {
      const e = new Error('Invalid dev token');
      e.statusCode = 401;
      e.code = 'auth_invalid_token';
      throw e;
    }
    return {
      sub,
      claims: { sub, iss: 'dev', aud: 'dev' },
      mode: 'dev',
    };
  }

  try {
    const payload = verifyHs256(token);
    const validated = validateClaims(payload);
    return {
      ...validated,
      mode: 'hs256',
    };
  } catch (authError) {
    const e = new Error(authError.message || 'Invalid token');
    e.statusCode = 401;
    e.code = 'auth_invalid_token';
    throw e;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        const e = new Error('Payload too large');
        e.statusCode = 413;
        e.code = 'payload_too_large';
        req.destroy(e);
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim().length === 0) {
        const e = new Error('Empty JSON body');
        e.statusCode = 400;
        e.code = 'validation_error';
        reject(e);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        resolve({ raw, parsed });
      } catch {
        const e = new Error('Invalid JSON');
        e.statusCode = 400;
        e.code = 'validation_error';
        reject(e);
      }
    });

    req.on('error', (err) => {
      if (err && err.statusCode) {
        reject(err);
        return;
      }
      const e = new Error('Request stream error');
      e.statusCode = 400;
      e.code = 'validation_error';
      reject(e);
    });
  });
}

function applyRateLimitOrFail(req, res, reqId, bucketKey, actorKey) {
  const limited = rateLimitCheck(bucketKey, actorKey);
  if (!limited) return false;
  error(req, res, 429, 'rate_limited', 'Too many requests', reqId, {}, { 'Retry-After': String(limited.retryAfterSec) });
  return true;
}

function ensureTlsOrFail(req, res, reqId) {
  if (!REQUIRE_TLS) return false;
  if (isSecureTransport(req) || isLoopbackRequest(req)) return false;
  error(req, res, 400, 'tls_required', 'HTTPS/TLS is required for this endpoint', reqId);
  return true;
}

function encryptStoreSnapshot(snapshot) {
  const key = ENCRYPTION_KEYS.get(ACTIVE_ENCRYPTION_KID);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const aad = Buffer.from('cloudsync-store-v1', 'utf8');
  cipher.setAAD(aad);
  const plaintext = Buffer.from(JSON.stringify(snapshot), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    version: 1,
    kid: ACTIVE_ENCRYPTION_KID,
    iv: base64UrlEncode(iv),
    tag: base64UrlEncode(tag),
    data: base64UrlEncode(encrypted),
    savedAt: nowIso(),
  };
}

function decryptStoreSnapshot(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    throw new Error('Invalid store envelope');
  }
  const kid = envelope.kid;
  if (typeof kid !== 'string' || !ENCRYPTION_KEYS.has(kid)) {
    throw new Error('Store envelope uses unknown encryption key id');
  }
  const key = ENCRYPTION_KEYS.get(kid);
  const iv = base64UrlDecode(envelope.iv || '');
  const tag = base64UrlDecode(envelope.tag || '');
  const data = base64UrlDecode(envelope.data || '');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from('cloudsync-store-v1', 'utf8'));
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext);
}

function snapshotStore() {
  return {
    schemaVersion: 1,
    savedAt: nowIso(),
    saves: Array.from(saveStore.values()),
    entitlements: Array.from(entitlementStore.values()),
  };
}

function queuePersistStore() {
  persistQueue = persistQueue
    .then(() => {
      const snapshot = snapshotStore();
      const envelope = encryptStoreSnapshot(snapshot);
      ensureDir(path.dirname(DB_FILE_PATH));
      const tmpPath = `${DB_FILE_PATH}.tmp-${process.pid}`;
      fs.writeFileSync(tmpPath, JSON.stringify(envelope), 'utf8');
      fs.renameSync(tmpPath, DB_FILE_PATH);
    })
    .catch((persistError) => {
      console.error('[cloudsync] failed to persist store:', persistError);
      throw persistError;
    });
  return persistQueue;
}

function loadPersistentStore() {
  try {
    ensureDir(path.dirname(DB_FILE_PATH));
    if (!fs.existsSync(DB_FILE_PATH)) return;
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8').trim();
    if (!raw) return;
    const envelope = JSON.parse(raw);
    const snapshot = decryptStoreSnapshot(envelope);

    const saves = Array.isArray(snapshot.saves) ? snapshot.saves : [];
    for (const item of saves) {
      if (!item || typeof item !== 'object') continue;
      if (typeof item.userId !== 'string' || typeof item.slotId !== 'string') continue;
      saveStore.set(storeKey(item.userId, item.slotId), item);
    }

    const entitlements = Array.isArray(snapshot.entitlements) ? snapshot.entitlements : [];
    for (const item of entitlements) {
      if (!item || typeof item !== 'object') continue;
      if (typeof item.userId !== 'string') continue;
      const products = normalizeProductCandidates(Array.isArray(item.products) ? item.products : []);
      entitlementStore.set(item.userId, {
        userId: item.userId,
        products,
        source: typeof item.source === 'string' ? item.source : 'restored',
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : nowIso(),
        revision: Number.isInteger(item.revision) ? item.revision : 1,
        lastEventId: typeof item.lastEventId === 'string' ? item.lastEventId : null,
      });
    }

    console.log(`[cloudsync] loaded ${saveStore.size} saves, ${entitlementStore.size} entitlement records`);
  } catch (loadError) {
    console.error('[cloudsync] failed to load persistent store:', loadError);
    if (IS_PROD) {
      throw loadError;
    }
  }
}

async function handleGetSlot(req, res, reqId, auth, slotId, includeDeleted) {
  if (applyRateLimitOrFail(req, res, reqId, 'readSlot', auth.rateActor || auth.sub)) return;

  const record = getRecord(auth.sub, slotId);
  if (!record) {
    error(req, res, 404, 'save_not_found', 'Save slot not found', reqId);
    writeAudit(req, reqId, 'get_slot', 'fail', { userId: auth.sub, slotId, code: 'save_not_found', statusCode: 404 });
    return;
  }
  if (record.deletedAt && !includeDeleted) {
    error(req, res, 410, 'save_deleted', 'Save slot is deleted', reqId);
    writeAudit(req, reqId, 'get_slot', 'fail', { userId: auth.sub, slotId, code: 'save_deleted', statusCode: 410 });
    return;
  }

  json(
    req,
    res,
    200,
    record.data,
    {
      ETag: `"${record.revision}"`,
      'X-Save-Revision': String(record.revision),
      'X-Request-Id': reqId,
    }
  );
  writeAudit(req, reqId, 'get_slot', 'success', { userId: auth.sub, slotId, statusCode: 200 });
}

async function handleListSlots(req, res, reqId, auth, includeDeleted) {
  if (applyRateLimitOrFail(req, res, reqId, 'listSlots', auth.rateActor || auth.sub)) return;

  const items = listRecords(auth.sub)
    .filter((record) => includeDeleted || !record.deletedAt)
    .map((record) => ({
      slotId: record.slotId,
      revision: record.revision,
      deletedAt: record.deletedAt,
      updatedAt: record.updatedAt,
      metadata: (record.data && record.data.metadata) || null,
    }))
    .sort((a, b) => {
      const left = Number((a.metadata && a.metadata.lastPlayed) || 0);
      const right = Number((b.metadata && b.metadata.lastPlayed) || 0);
      return right - left;
    });

  json(
    req,
    res,
    200,
    {
      items,
      count: items.length,
    },
    { 'X-Request-Id': reqId }
  );
  writeAudit(req, reqId, 'list_slots', 'success', { userId: auth.sub, statusCode: 200 });
}

async function handlePutSlot(req, res, reqId, auth, slotId) {
  if (applyRateLimitOrFail(req, res, reqId, 'writeSlot', auth.rateActor || auth.sub)) return;

  const body = await readJsonBody(req);
  const payloadErrors = validateSavePayload(slotId, body.parsed);
  if (payloadErrors.length > 0) {
    error(req, res, 400, 'validation_error', 'Payload validation failed', reqId, { details: payloadErrors });
    writeAudit(req, reqId, 'put_slot', 'fail', {
      userId: auth.sub,
      slotId,
      code: 'validation_error',
      statusCode: 400,
    });
    return;
  }

  const integrity = validateIntegrityHeaders(req, body.parsed, body.raw);
  if (!integrity.ok) {
    error(req, res, 400, integrity.code, integrity.message, reqId);
    writeAudit(req, reqId, 'put_slot', 'fail', {
      userId: auth.sub,
      slotId,
      code: integrity.code,
      statusCode: 400,
    });
    return;
  }

  const key = storeKey(auth.sub, slotId);
  const existing = saveStore.get(key) || null;
  const ifMatchRevision = parseIfMatch(req);

  if (ifMatchRevision !== null) {
    const currentRevision = existing ? existing.revision : 0;
    if (ifMatchRevision !== currentRevision) {
      error(req, res, 409, 'save_conflict', 'Revision mismatch', reqId, {
        remote: existing
          ? {
              slotId,
              revision: existing.revision,
              lastPlayed: (existing.data && existing.data.metadata && existing.data.metadata.lastPlayed) || 0,
            }
          : null,
      });
      writeAudit(req, reqId, 'put_slot', 'fail', {
        userId: auth.sub,
        slotId,
        code: 'save_conflict',
        statusCode: 409,
      });
      return;
    }
  }

  const createdAt = existing ? existing.createdAt : nowIso();
  const revision = existing ? existing.revision + 1 : 1;
  const updatedAt = nowIso();

  const record = {
    userId: auth.sub,
    slotId,
    data: body.parsed,
    metadata: {
      version: integrity.saveVersion,
      lastPlayed: Number((body.parsed && body.parsed.metadata && body.parsed.metadata.lastPlayed) || Date.now()),
    },
    clientChecksum: integrity.saveChecksum,
    serverSha256: integrity.serverSha256,
    revision,
    createdAt,
    updatedAt,
    deletedAt: null,
  };

  setRecord(auth.sub, slotId, record);
  await queuePersistStore();

  json(
    req,
    res,
    existing ? 200 : 201,
    {
      slotId,
      revision,
      updatedAt,
    },
    {
      ETag: `"${revision}"`,
      'X-Request-Id': reqId,
    }
  );
  writeAudit(req, reqId, 'put_slot', 'success', {
    userId: auth.sub,
    slotId,
    statusCode: existing ? 200 : 201,
  });
}

async function handleDeleteSlot(req, res, reqId, auth, slotId) {
  if (applyRateLimitOrFail(req, res, reqId, 'deleteSlot', auth.rateActor || auth.sub)) return;

  const existing = getRecord(auth.sub, slotId);
  if (!existing) {
    error(req, res, 404, 'save_not_found', 'Save slot not found', reqId);
    writeAudit(req, reqId, 'delete_slot', 'fail', { userId: auth.sub, slotId, code: 'save_not_found', statusCode: 404 });
    return;
  }

  if (SOFT_DELETE) {
    const next = {
      ...existing,
      deletedAt: nowIso(),
      updatedAt: nowIso(),
      revision: existing.revision + 1,
    };
    setRecord(auth.sub, slotId, next);
  } else {
    deleteRecord(auth.sub, slotId);
  }

  await queuePersistStore();
  noContent(req, res, { 'X-Request-Id': reqId });
  writeAudit(req, reqId, 'delete_slot', 'success', { userId: auth.sub, slotId, statusCode: 204 });
}

async function handleDeleteAll(req, res, reqId, auth) {
  if (applyRateLimitOrFail(req, res, reqId, 'deleteAll', auth.rateActor || auth.sub)) return;

  const records = listRecords(auth.sub);
  let affected = 0;

  if (SOFT_DELETE) {
    for (const record of records) {
      if (record.deletedAt) continue;
      record.deletedAt = nowIso();
      record.updatedAt = nowIso();
      record.revision += 1;
      setRecord(auth.sub, record.slotId, record);
      affected += 1;
    }
  } else {
    for (const record of records) {
      deleteRecord(auth.sub, record.slotId);
      affected += 1;
    }
  }

  await queuePersistStore();
  noContent(req, res, {
    'X-Request-Id': reqId,
    'X-Deleted-Count': String(affected),
  });
  writeAudit(req, reqId, 'delete_all', 'success', { userId: auth.sub, statusCode: 204, note: `affected=${affected}` });
}

async function handleGetEntitlements(req, res, reqId, auth) {
  if (applyRateLimitOrFail(req, res, reqId, 'readEntitlements', auth.rateActor || auth.sub)) return;

  const record = getEntitlementRecord(auth.sub);
  json(req, res, 200, buildEntitlementResponse(record), { 'X-Request-Id': reqId });
  writeAudit(req, reqId, 'get_entitlements', 'success', { userId: auth.sub, statusCode: 200 });
}

function isDateInFuture(value) {
  if (!value) return true;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now();
}

function extractRevenueCatProducts(payload) {
  const subscriber = payload && payload.subscriber && typeof payload.subscriber === 'object'
    ? payload.subscriber
    : {};
  const candidates = [];

  const entitlements = subscriber.entitlements && typeof subscriber.entitlements === 'object'
    ? subscriber.entitlements
    : {};
  for (const [entitlementId, details] of Object.entries(entitlements)) {
    candidates.push(entitlementId);
    if (!details || typeof details !== 'object') continue;
    if (!isDateInFuture(details.expires_date)) continue;
    if (typeof details.product_identifier === 'string') {
      candidates.push(details.product_identifier);
    }
  }

  const subscriptions = subscriber.subscriptions && typeof subscriber.subscriptions === 'object'
    ? subscriber.subscriptions
    : {};
  for (const [productId, details] of Object.entries(subscriptions)) {
    if (!details || typeof details !== 'object') continue;
    if (!isDateInFuture(details.expires_date)) continue;
    candidates.push(productId);
  }

  const nonSubscriptions = subscriber.non_subscriptions && typeof subscriber.non_subscriptions === 'object'
    ? subscriber.non_subscriptions
    : {};
  for (const productId of Object.keys(nonSubscriptions)) {
    candidates.push(productId);
  }

  const otherPurchases = subscriber.other_purchases && typeof subscriber.other_purchases === 'object'
    ? subscriber.other_purchases
    : {};
  for (const productId of Object.keys(otherPurchases)) {
    candidates.push(productId);
  }

  return normalizeProductCandidates(candidates);
}

async function fetchRevenueCatEntitlements(userId) {
  if (!REVENUECAT_SECRET_API_KEY) {
    throw new Error('RevenueCat secret API key is not configured');
  }
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is unavailable in this Node runtime');
  }

  const endpoint = `${REVENUECAT_API_BASE.replace(/\/+$/, '')}/subscribers/${encodeURIComponent(userId)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${REVENUECAT_SECRET_API_KEY}`,
    },
  });

  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RevenueCat API failed with ${response.status}: ${text.slice(0, 200)}`);
  }

  const payload = await response.json();
  return extractRevenueCatProducts(payload);
}

async function handleRefreshEntitlements(req, res, reqId, auth) {
  if (applyRateLimitOrFail(req, res, reqId, 'refreshEntitlements', auth.rateActor || auth.sub)) return;

  try {
    const products = await fetchRevenueCatEntitlements(auth.sub);
    const record = setEntitlementRecord(auth.sub, products, 'revenuecat_api');
    await queuePersistStore();
    json(req, res, 200, buildEntitlementResponse(record), { 'X-Request-Id': reqId });
    writeAudit(req, reqId, 'refresh_entitlements', 'success', { userId: auth.sub, statusCode: 200 });
  } catch (refreshError) {
    error(req, res, 502, 'entitlement_refresh_failed', refreshError.message, reqId);
    writeAudit(req, reqId, 'refresh_entitlements', 'fail', {
      userId: auth.sub,
      code: 'entitlement_refresh_failed',
      statusCode: 502,
    });
  }
}

function extractWebhookUpdate(payload) {
  const event = payload && payload.event && typeof payload.event === 'object' ? payload.event : payload;
  const candidates = [];
  let appUserId = null;
  let eventId = null;

  const collectStrings = (value) => {
    if (!value) return;
    if (typeof value === 'string') {
      candidates.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') candidates.push(item);
      }
    }
  };

  if (event && typeof event === 'object') {
    if (typeof event.app_user_id === 'string') appUserId = event.app_user_id;
    if (typeof event.original_app_user_id === 'string') appUserId = event.original_app_user_id;
    if (typeof event.id === 'string') eventId = event.id;
    if (typeof event.event_id === 'string') eventId = event.event_id;
    collectStrings(event.product_id);
    collectStrings(event.entitlement_id);
    collectStrings(event.entitlement_ids);
    collectStrings(event.entitlements);
  }

  if (!appUserId && payload && typeof payload.app_user_id === 'string') {
    appUserId = payload.app_user_id;
  }
  if (!eventId && payload && typeof payload.id === 'string') {
    eventId = payload.id;
  }

  if (payload && payload.subscriber && typeof payload.subscriber === 'object') {
    const subscriber = payload.subscriber;
    if (!appUserId && typeof subscriber.original_app_user_id === 'string') {
      appUserId = subscriber.original_app_user_id;
    }
    if (!appUserId && typeof subscriber.app_user_id === 'string') {
      appUserId = subscriber.app_user_id;
    }

    const fromSubscriber = extractRevenueCatProducts(payload);
    for (const productId of fromSubscriber) {
      candidates.push(productId);
    }
  }

  return {
    appUserId: appUserId ? String(appUserId).trim() : '',
    eventId: eventId ? String(eventId).trim() : null,
    products: normalizeProductCandidates(candidates),
  };
}

function authorizeWebhook(req) {
  if (!REVENUECAT_WEBHOOK_SECRET) return false;
  const bearer = parseBearerToken(req);
  if (bearer && timingSafeEqualText(bearer, REVENUECAT_WEBHOOK_SECRET)) return true;
  const directHeader = req.headers['x-webhook-secret'];
  if (typeof directHeader === 'string' && timingSafeEqualText(directHeader.trim(), REVENUECAT_WEBHOOK_SECRET)) {
    return true;
  }
  return false;
}

async function handleRevenueCatWebhook(req, res, reqId) {
  if (applyRateLimitOrFail(req, res, reqId, 'webhook', getClientIp(req))) return;

  if (!REVENUECAT_WEBHOOK_SECRET) {
    error(req, res, 503, 'webhook_unavailable', 'Webhook secret is not configured', reqId);
    writeAudit(req, reqId, 'revenuecat_webhook', 'fail', { code: 'webhook_unavailable', statusCode: 503 });
    return;
  }

  if (!authorizeWebhook(req)) {
    error(req, res, 401, 'webhook_unauthorized', 'Webhook authentication failed', reqId);
    writeAudit(req, reqId, 'revenuecat_webhook', 'fail', { code: 'webhook_unauthorized', statusCode: 401 });
    return;
  }

  const body = await readJsonBody(req);
  const update = extractWebhookUpdate(body.parsed);
  if (!update.appUserId) {
    error(req, res, 400, 'validation_error', 'Webhook payload missing app user id', reqId);
    writeAudit(req, reqId, 'revenuecat_webhook', 'fail', { code: 'validation_error', statusCode: 400 });
    return;
  }

  const record = setEntitlementRecord(update.appUserId, update.products, 'revenuecat_webhook', update.eventId);
  await queuePersistStore();
  noContent(req, res, { 'X-Request-Id': reqId });
  writeAudit(req, reqId, 'revenuecat_webhook', 'success', {
    userId: update.appUserId,
    statusCode: 204,
    note: `products=${record.products.join('|')}`,
  });
}

async function handleRequest(req, res) {
  const reqId = requestId();
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method || 'GET';
  const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

  if (pathname === '/health' && method === 'GET') {
    json(
      req,
      res,
      200,
      {
        status: 'ok',
        now: nowIso(),
        mode: NODE_ENV,
      },
      { 'X-Request-Id': reqId }
    );
    return;
  }

  if (ensureTlsOrFail(req, res, reqId)) {
    writeAudit(req, reqId, 'tls_enforcement', 'fail', { code: 'tls_required', statusCode: 400 });
    return;
  }

  if (pathname === '/v1/webhooks/revenuecat' && method === 'POST') {
    await handleRevenueCatWebhook(req, res, reqId);
    return;
  }

  let auth;
  try {
    auth = authenticate(req);
  } catch (authError) {
    error(
      req,
      res,
      authError.statusCode || 401,
      authError.code || 'auth_invalid_token',
      authError.message || 'Authentication failed',
      reqId
    );
    writeAudit(req, reqId, 'auth', 'fail', {
      code: authError.code || 'auth_invalid_token',
      statusCode: authError.statusCode || 401,
    });
    return;
  }

  const clientIp = getClientIp(req);
  auth.rateActor = `${auth.sub}:${clientIp}`;
  res.setHeader('X-Request-Id', reqId);

  if (pathname === '/v1/saves' && method === 'GET') {
    await handleListSlots(req, res, reqId, auth, includeDeleted);
    return;
  }

  if (pathname === '/v1/saves' && method === 'DELETE') {
    await handleDeleteAll(req, res, reqId, auth);
    return;
  }

  if (pathname === '/v1/entitlements' && method === 'GET') {
    await handleGetEntitlements(req, res, reqId, auth);
    return;
  }

  if (pathname === '/v1/entitlements/refresh' && method === 'POST') {
    await handleRefreshEntitlements(req, res, reqId, auth);
    return;
  }

  const canonicalSlot = pathname.match(/^\/v1\/saves\/([^/]+)$/);
  if (canonicalSlot) {
    const slotId = safeDecodeURIComponent(canonicalSlot[1]);
    if (method === 'GET') {
      await handleGetSlot(req, res, reqId, auth, slotId, includeDeleted);
      return;
    }
    if (method === 'PUT') {
      await handlePutSlot(req, res, reqId, auth, slotId);
      return;
    }
    if (method === 'DELETE') {
      await handleDeleteSlot(req, res, reqId, auth, slotId);
      return;
    }
  }

  const compatibilitySlot = pathname.match(/^\/saves\/([^/]+)\/([^/]+)$/);
  if (compatibilitySlot) {
    const userId = safeDecodeURIComponent(compatibilitySlot[1]);
    const slotId = safeDecodeURIComponent(compatibilitySlot[2]);
    if (userId !== auth.sub) {
      error(req, res, 403, 'ownership_mismatch', 'Path userId does not match token subject', reqId);
      writeAudit(req, reqId, 'compat_route', 'fail', {
        userId: auth.sub,
        slotId,
        code: 'ownership_mismatch',
        statusCode: 403,
      });
      return;
    }

    if (method === 'GET') {
      await handleGetSlot(req, res, reqId, auth, slotId, includeDeleted);
      return;
    }
    if (method === 'PUT') {
      await handlePutSlot(req, res, reqId, auth, slotId);
      return;
    }
    if (method === 'DELETE') {
      await handleDeleteSlot(req, res, reqId, auth, slotId);
      return;
    }
  }

  error(req, res, 404, 'not_found', 'Endpoint not found', reqId);
  writeAudit(req, reqId, 'routing', 'fail', { userId: auth.sub, code: 'not_found', statusCode: 404 });
}

const server = http.createServer((req, res) => {
  Promise.resolve(handleRequest(req, res)).catch((unhandled) => {
    const reqId = requestId();
    console.error('[cloudsync] unhandled error', unhandled);
    error(req, res, 500, 'internal_error', 'Unexpected server error', reqId);
    writeAudit(req, reqId, 'unhandled', 'fail', { code: 'internal_error', statusCode: 500 });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[cloudsync] listening on http://${HOST}:${PORT}`);
  console.log(`[cloudsync] mode=${NODE_ENV}, tls_required=${REQUIRE_TLS}, hsts=${ENABLE_HSTS}`);
  console.log(`[cloudsync] soft delete: ${SOFT_DELETE ? 'enabled' : 'disabled'}`);
  console.log(`[cloudsync] dev tokens: ${ALLOW_DEV_TOKENS ? 'enabled' : 'disabled'}`);
  console.log(`[cloudsync] persistent store: ${DB_FILE_PATH}`);
  console.log(`[cloudsync] audit log: ${AUDIT_LOG_PATH}`);
});
