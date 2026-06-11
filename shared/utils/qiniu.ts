/**
 * Qiniu Kodo — direct REST API client (no npm dependency).
 * Uses native fetch + crypto (Node.js built-ins).
 *
 * Environment variables:
 *   QINIU_ACCESS_KEY       – Qiniu AccessKey (from 个人中心 → 密钥管理)
 *   QINIU_SECRET_KEY       – Qiniu SecretKey
 *   QINIU_BUCKET           – bucket name
 *   QINIU_DOMAIN           – CDN domain or test domain, e.g. "cdn.example.com" or "s3-cn-east-1.qiniucs.com"
 */

import crypto from 'node:crypto';

function getConfig() {
  return {
    accessKey: process.env.QINIU_ACCESS_KEY || '',
    secretKey: process.env.QINIU_SECRET_KEY || '',
    bucket: process.env.QINIU_BUCKET || '',
    domain: process.env.QINIU_DOMAIN || '',
  };
}

export function isQiniuConfigured(): boolean {
  const cfg = getConfig();
  return Boolean(cfg.accessKey && cfg.secretKey && cfg.bucket && cfg.domain);
}

/** URL-safe base64 encode (no padding, + → -, / → _). */
function urlsafeBase64(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate an UploadToken for Qiniu form upload.
 * Token expires in 1 hour.
 */
function generateUploadToken(key: string, ttlSeconds = 3600): string {
  const cfg = getConfig();
  const deadline = Math.floor(Date.now() / 1000) + ttlSeconds;
  const putPolicy = JSON.stringify({
    scope: `${cfg.bucket}:${key}`,
    deadline,
  });
  const encoded = urlsafeBase64(Buffer.from(putPolicy, 'utf-8'));
  const sign = crypto.createHmac('sha1', cfg.secretKey).update(encoded, 'utf-8').digest();
  return `${cfg.accessKey}:${urlsafeBase64(sign)}:${encoded}`;
}

/**
 * Generate an AccessToken for Qiniu Management API (DELETE, etc.).
 */
function generateAccessToken(pathWithQuery: string, body = ''): string {
  const cfg = getConfig();
  const signingStr = pathWithQuery + '\n' + body;
  const sign = crypto.createHmac('sha1', cfg.secretKey).update(signingStr, 'utf-8').digest();
  return `Qiniu ${cfg.accessKey}:${urlsafeBase64(sign)}`;
}

/**
 * Build the encoded entry URI for management API: base64(bucket:key)
 */
function encodedEntry(key: string): string {
  const cfg = getConfig();
  return urlsafeBase64(Buffer.from(`${cfg.bucket}:${key}`, 'utf-8'));
}

/**
 * Upload a buffer to Qiniu Kodo using form upload API.
 * Returns the public URL.
 */
export async function uploadFileToQiniu(key: string, buffer: Buffer): Promise<string> {
  const cfg = getConfig();
  if (!isQiniuConfigured()) throw new Error('[Qiniu] Not configured — set QINIU_* env vars');

  const token = generateUploadToken(key);
  const uploadUrl = 'https://up.qiniup.com';

  // Build multipart/form-data manually (no npm deps)
  const boundary = `----QiniuFormBoundary${Math.random().toString(36).slice(2, 10)}`;

  const textEncoder = new TextEncoder();

  const parts: Uint8Array[] = [];

  // token field
  parts.push(textEncoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n`));

  // key field
  parts.push(textEncoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="key"\r\n\r\n${key}\r\n`));

  // file field
  parts.push(textEncoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${key}"\r\nContent-Type: application/octet-stream\r\n\r\n`));
  parts.push(new Uint8Array(buffer));
  parts.push(textEncoder.encode(`\r\n--${boundary}--\r\n`));

  // Combine
  const totalLen = parts.reduce((s, p) => s + p.length, 0);
  const body = new Uint8Array(totalLen);
  let off = 0;
  for (const p of parts) {
    body.set(p, off);
    off += p.length;
  }

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Qiniu] Upload failed (${res.status}): ${text}`);
  }

  const result = (await res.json()) as { key?: string; hash?: string; error?: string };
  if (result.error) {
    throw new Error(`[Qiniu] Upload error: ${result.error}`);
  }

  const domain = cfg.domain.replace(/\/+$/, '');
  return `https://${domain}/${key}`;
}

/**
 * Delete a file from Qiniu Kodo using the management API.
 */
export async function deleteFileFromQiniu(key: string): Promise<void> {
  const cfg = getConfig();
  if (!isQiniuConfigured()) throw new Error('[Qiniu] Not configured');

  const entry = encodedEntry(key);
  const path = `/delete/${entry}`;
  const url = `https://rs.qiniu.com${path}`;
  const auth = generateAccessToken(path);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (res.status === 612) {
    // 612 = file not found — treat as success
    return;
  }
  if (!res.ok) {
    const text = await res.text();
    // Some Qiniu error codes that are "ok" for delete
    if (res.status === 612) return;
    throw new Error(`[Qiniu] DELETE failed (${res.status}): ${text}`);
  }
}

/**
 * Read a JSON object from Qiniu Kodo via public URL.
 * Returns null if key doesn't exist.
 */
export async function readJSONFromQiniu<T>(key: string): Promise<T | null> {
  if (!isQiniuConfigured()) return null;

  const cfg = getConfig();
  const url = `https://${cfg.domain.replace(/\/+$/, '')}/${key}`;

  const res = await fetch(url, { method: 'GET' });
  if (res.status === 404) return null;
  if (!res.ok) {
    // Don't throw on read errors — return null so fallback logic works
    return null;
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Write a JSON object to Qiniu Kodo (uploads as a file).
 */
export async function writeJSONToQiniu(key: string, data: unknown): Promise<void> {
  if (!isQiniuConfigured()) return;

  const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  // Reuse upload function with a content type hint in the key
  const token = generateUploadToken(key);
  const uploadUrl = 'https://up.qiniup.com';
  const boundary = `----QiniuFormBoundary${Math.random().toString(36).slice(2, 10)}`;
  const textEncoder = new TextEncoder();

  const parts: Uint8Array[] = [];
  parts.push(textEncoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n`));
  parts.push(textEncoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="key"\r\n\r\n${key}\r\n`));
  parts.push(textEncoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${key}"\r\nContent-Type: application/json\r\n\r\n`));
  parts.push(new Uint8Array(buffer));
  parts.push(textEncoder.encode(`\r\n--${boundary}--\r\n`));

  const totalLen = parts.reduce((s, p) => s + p.length, 0);
  const body = new Uint8Array(totalLen);
  let off = 0;
  for (const p of parts) {
    body.set(p, off);
    off += p.length;
  }

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Qiniu] Write JSON failed (${res.status}): ${text}`);
  }

  const result = (await res.json()) as { error?: string };
  if (result.error) {
    throw new Error(`[Qiniu] Write JSON error: ${result.error}`);
  }
}
