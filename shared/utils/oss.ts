/**
 * Aliyun OSS — direct REST API client (no npm dependency).
 * Uses native fetch + crypto (Node.js built-ins).
 *
 * Environment variables:
 *   OSS_REGION            – e.g. "oss-cn-hangzhou"
 *   OSS_ACCESS_KEY_ID     – Aliyun access key
 *   OSS_ACCESS_KEY_SECRET – Aliyun access key secret
 *   OSS_BUCKET            – bucket name
 *   OSS_PUBLIC_URL        – public endpoint (optional), e.g. "https://bucket.oss-cn-hangzhou.aliyuncs.com"
 */

import crypto from 'node:crypto';

function getConfig() {
  return {
    region: process.env.OSS_REGION || '',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.OSS_BUCKET || '',
    publicUrl: process.env.OSS_PUBLIC_URL || '',
  };
}

export function isOSSConfigured(): boolean {
  const cfg = getConfig();
  return Boolean(cfg.region && cfg.accessKeyId && cfg.accessKeySecret && cfg.bucket);
}

/** Build the OSS endpoint URL for a given key. */
function endpoint(key: string): string {
  const cfg = getConfig();
  return `https://${cfg.bucket}.${cfg.region}.aliyuncs.com/${key}`;
}

/**
 * Sign a request for Aliyun OSS.
 * Returns the Authorization header value.
 */
function sign(method: string, key: string, headers: Record<string, string>): string {
  const cfg = getConfig();

  // Build CanonicalizedOSSHeaders
  const ossHeaders = Object.entries(headers)
    .filter(([k]) => k.startsWith('x-oss-'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v}`)
    .join('\n');

  const contentMd5 = headers['Content-MD5'] || '';
  const contentType = headers['Content-Type'] || '';
  const date = headers['Date'] || '';

  const stringToSign = [
    method,
    contentMd5,
    contentType,
    date,
    ossHeaders,
    `/${cfg.bucket}/${key}`,
  ].filter(Boolean).join('\n');

  const signature = crypto
    .createHmac('sha1', cfg.accessKeySecret)
    .update(stringToSign, 'utf-8')
    .digest('base64');

  return `OSS ${cfg.accessKeyId}:${signature}`;
}

/**
 * Common headers for every OSS request.
 */
function commonHeaders(): Record<string, string> {
  return {
    'Date': new Date().toUTCString(),
  };
}

/**
 * Upload a buffer to OSS.
 * Returns the public URL.
 */
export async function uploadFileToOSS(key: string, buffer: Buffer): Promise<string> {
  const cfg = getConfig();
  if (!isOSSConfigured()) throw new Error('[OSS] Not configured — set OSS_* env vars');

  const url = endpoint(key);
  const headers: Record<string, string> = {
    ...commonHeaders(),
    'Content-Type': 'application/octet-stream',
    'x-oss-object-acl': 'public-read',
  };

  headers['Authorization'] = sign('PUT', key, headers);

  const bodyBytes = new Uint8Array(buffer);
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: bodyBytes,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[OSS] PUT failed (${res.status}): ${text}`);
  }

  if (cfg.publicUrl) {
    return `${cfg.publicUrl.replace(/\/+$/, '')}/${key}`;
  }
  return `https://${cfg.bucket}.${cfg.region}.aliyuncs.com/${key}`;
}

/**
 * Delete a file from OSS.
 */
export async function deleteFileFromOSS(key: string): Promise<void> {
  if (!isOSSConfigured()) throw new Error('[OSS] Not configured');

  const url = endpoint(key);
  const headers: Record<string, string> = {
    ...commonHeaders(),
  };

  headers['Authorization'] = sign('DELETE', key, headers);

  const res = await fetch(url, { method: 'DELETE', headers });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`[OSS] DELETE failed (${res.status}): ${text}`);
  }
}

/**
 * Read a JSON object from OSS. Returns null if key doesn't exist.
 */
export async function readJSONFromOSS<T>(key: string): Promise<T | null> {
  if (!isOSSConfigured()) return null;

  const url = endpoint(key);
  const headers: Record<string, string> = {
    ...commonHeaders(),
  };
  headers['Authorization'] = sign('GET', key, headers);

  const res = await fetch(url, { method: 'GET', headers });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[OSS] GET failed (${res.status}): ${text}`);
  }

  const text = await res.text();
  return JSON.parse(text) as T;
}

/**
 * Write a JSON object to OSS.
 */
export async function writeJSONToOSS(key: string, data: unknown): Promise<void> {
  if (!isOSSConfigured()) return;

  const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  const url = endpoint(key);
  const headers: Record<string, string> = {
    ...commonHeaders(),
    'Content-Type': 'application/json',
  };
  headers['Authorization'] = sign('PUT', key, headers);

  const jsonBytes = new Uint8Array(buffer);
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: jsonBytes,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[OSS] PUT JSON failed (${res.status}): ${text}`);
  }
}
