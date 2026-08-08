/**
 * utils/webdav.js
 * Nextcloud WebDAV integration for MAGIC Youth file storage.
 *
 * In production (NODE_ENV=production): requires NEXTCLOUD_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_PASSWORD.
 * Missing credentials in production causes a clear startup failure.
 *
 * In development: falls back to local filesystem storage under uploads/MAGIC-YOUTH/... 
 * with the same directory structure as Nextcloud, making it easy to migrate to Nextcloud later.
 */

const fs   = require('fs');
const path = require('path');
const http = require('https');
const http2 = require('http');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const NC_URL      = process.env.NEXTCLOUD_URL      || '';
const NC_USER     = process.env.NEXTCLOUD_USERNAME  || '';
const NC_PASS     = process.env.NEXTCLOUD_PASSWORD  || '';
const NC_ROOT     = process.env.NEXTCLOUD_ROOT_PATH || 'MAGIC-YOUTH';

const LOCAL_ROOT  = path.join(__dirname, '..', 'uploads');

let _storageMode = null;

/**
 * Validate Nextcloud config and determine storage mode.
 * Must be called during server startup.
 */
function initStorage() {
  if (NC_URL && NC_USER && NC_PASS) {
    _storageMode = 'nextcloud';
    console.log('[Storage] Nextcloud WebDAV storage: ACTIVE');
  } else if (IS_PRODUCTION) {
    throw new Error(
      '[Storage] FATAL: Production environment is missing Nextcloud configuration.\n' +
      '  Required environment variables: NEXTCLOUD_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_PASSWORD\n' +
      '  Do NOT run production without Nextcloud. Exiting.'
    );
  } else {
    _storageMode = 'local';
    console.warn('[Storage] ⚠ Nextcloud not configured — using LOCAL filesystem (development only).');
    console.warn('[Storage] ⚠ Set NEXTCLOUD_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_PASSWORD for production.');
  }
}

/**
 * Build the Nextcloud WebDAV URL for a given remote path.
 */
function _ncUrl(remotePath) {
  const base = NC_URL.replace(/\/$/, '');
  return `${base}/remote.php/dav/files/${NC_USER}/${remotePath}`;
}

/**
 * Parse the URL to determine protocol module to use.
 */
function _httpModule() {
  return NC_URL.startsWith('https') ? http : http2;
}

/**
 * Perform a WebDAV request.
 * @param {string} method - HTTP method (MKCOL, PUT, GET, DELETE, PROPFIND)
 * @param {string} remotePath - Full remote path relative to NC_USER root
 * @param {Buffer|null} body - Request body for PUT
 * @param {object} extraHeaders - Additional headers
 */
function _webdavRequest(method, remotePath, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = _ncUrl(remotePath);
    const auth = Buffer.from(`${NC_USER}:${NC_PASS}`).toString('base64');
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port:     urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path:     urlObj.pathname,
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Length': body ? body.length : 0,
        ...extraHeaders,
      },
    };

    const mod = _httpModule();
    const req = mod.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Ensure a remote directory chain exists via MKCOL.
 * Creates each segment individually.
 */
async function createDirectory(remotePath) {
  if (_storageMode === 'local') {
    const localPath = path.join(LOCAL_ROOT, remotePath);
    fs.mkdirSync(localPath, { recursive: true });
    return;
  }
  // Create each segment in the path
  const segments = remotePath.split('/').filter(Boolean);
  let current = '';
  for (const seg of segments) {
    current = current ? `${current}/${seg}` : seg;
    const res = await _webdavRequest('MKCOL', current);
    if (![201, 405].includes(res.status)) {
      throw new Error(`MKCOL failed for "${current}" — HTTP ${res.status}`);
    }
  }
}

/**
 * Upload a file to Nextcloud (or local fallback).
 * @param {string} localFilePath - Absolute path of the temp file to upload
 * @param {string} remotePath    - Nextcloud path (e.g. "MAGIC-YOUTH/Units/Unit-A/2025-2026/Events/poster.jpg")
 * @returns {string} The remote path stored in MongoDB
 */
async function uploadFile(localFilePath, remotePath) {
  if (_storageMode === 'local') {
    const destPath = path.join(LOCAL_ROOT, remotePath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(localFilePath, destPath);
    return remotePath;
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  // Ensure parent directory exists
  const parentPath = remotePath.split('/').slice(0, -1).join('/');
  if (parentPath) await createDirectory(parentPath);

  const res = await _webdavRequest('PUT', remotePath, fileBuffer, {
    'Content-Type': 'application/octet-stream',
  });

  if (![200, 201, 204].includes(res.status)) {
    throw new Error(`Upload failed for "${remotePath}" — HTTP ${res.status}`);
  }
  return remotePath;
}

/**
 * Download a file from Nextcloud (or local fallback).
 * @param {string} remotePath - Nextcloud path stored in MongoDB
 * @returns {Buffer} File contents
 */
async function downloadFile(remotePath) {
  if (_storageMode === 'local') {
    const localPath = path.join(LOCAL_ROOT, remotePath);
    if (!fs.existsSync(localPath)) throw new Error(`File not found: ${remotePath}`);
    return fs.readFileSync(localPath);
  }

  const res = await _webdavRequest('GET', remotePath);
  if (res.status !== 200) {
    throw new Error(`Download failed for "${remotePath}" — HTTP ${res.status}`);
  }
  return res.body;
}

/**
 * Delete a file from Nextcloud (or local fallback).
 * @param {string} remotePath - Nextcloud path stored in MongoDB
 */
async function deleteFile(remotePath) {
  if (_storageMode === 'local') {
    const localPath = path.join(LOCAL_ROOT, remotePath);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    return;
  }

  const res = await _webdavRequest('DELETE', remotePath);
  if (![200, 204, 404].includes(res.status)) {
    throw new Error(`Delete failed for "${remotePath}" — HTTP ${res.status}`);
  }
}

/**
 * Check if a file or directory exists.
 */
async function fileExists(remotePath) {
  if (_storageMode === 'local') {
    return fs.existsSync(path.join(LOCAL_ROOT, remotePath));
  }

  const res = await _webdavRequest('PROPFIND', remotePath, null, { Depth: '0' });
  return res.status === 207;
}

/**
 * Build the Nextcloud storage path for a given context.
 * Example: buildPath({ unitCode: 'Unit-A', year: '2025-2026', area: 'Events', filename: 'poster.jpg' })
 * → "MAGIC-YOUTH/Units/Unit-A/2025-2026/Events/poster.jpg"
 */
function buildPath({ unitCode, year, area, filename }) {
  const parts = [NC_ROOT, 'Units', unitCode, year, area, filename].filter(Boolean);
  return parts.join('/');
}

/**
 * Get the current storage mode: 'nextcloud' or 'local'
 */
function getStorageMode() {
  return _storageMode;
}

module.exports = { initStorage, uploadFile, downloadFile, deleteFile, createDirectory, fileExists, buildPath, getStorageMode };
