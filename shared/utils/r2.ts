/**
 * Cloudflare R2 — direct REST API client (S3-compatible, no npm deps).
 * Uses native fetch + crypto (Node.js built-ins).
 *
 * Environment variables:
 *   R2_ACCOUNT_ID         – Cloudflare Account ID (from R2 overview page)
 *   R2_ACCESS_KEY_ID      – R2 API token Access Key ID
 *   R2_ACCESS_KEY_SECRET  – R2 API token Secret Access Key
 *   R2_BUCKET             – bucket name
 *   R2_PUBLIC_URL         – public endpoint (optional), e.g. "https://pub-xxxx.r2.dev"
 */

import crypto from 'node:crypto';

function getConfig() {
  return {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.R2_ACCESS_KEY_SECRET || '',
    bucket: process.env.R2_BUCKET || '',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  };
}

export function isR2Configured(): boolean {
  const cfg = getConfig();
  return Boolean(cfg.accountId && cfg.accessKeyId && cfg.accessKeySecret && cfg.bucket);
}

/** Build the R2 S3 endpoint URL for a given key. */
function endpoint(key: string): string {
  const cfg = getConfig();
  return `https://${cfg.bucket}.${cfg.accountId}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Sign a request with AWS Signature V4 (compatible with R2).
 * Simplified for PUT / GET / DELETE operations.
 */
function signV4(
  method: string,
  key: string,
  headers: Record<string, string>,
  queryString: string,
  bodyHash: string,
): string {
  const cfg = getConfig();
  const service = 's3';
  const region = 'auto';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  headers['x-amz-date'] = amzDate;
  headers['x-amz-content-sha256'] = bodyHash;

  // Canonical request
  const canonicalUri = `/${key}`;
  const canonicalHeaders = Object.entries(headers)
    .sort(([aK], [bK]) => aK.localeCompare(bK))
    .map(([k, v]) => `${k.toLowerCase()}:${String(v).trim()}\n`)
    .join('');
  const signedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
    .join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    queryString,
    canonicalHeaders,
    signedHeaders,
    bodyHash,
  ].join('\n');

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const hashCanonical = crypto.createHash('sha256').update(canonicalRequest, 'utf-8').digest('hex');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hashCanonical,
  ].join('\n');

  // Signing key
  function hmac(key: Buffer, msg: string): Buffer {
    return crypto.createHmac('sha256', key).update(msg, 'utf-8').digest();
  }
  const kDate = hmac(Buffer.from(`AWS4${cfg.accessKeySecret}`, 'utf-8'), dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');

  const signature = crypto.createHmac('sha256', kSigning)
    .update(stringToSign, 'utf-8')
    .digest('hex');

  return `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${credentialScope},SignedHeaders=${signedHeaders},Signature=${signature}`;
}

/** Compute SHA-256 hex of a buffer. */
function sha256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Upload a buffer to R2. Returns the public URL.
 */
export async function uploadFileToR2(key: string, buffer: Buffer): Promise<string> {
  const cfg = getConfig();
  if (!isR2Configured()) throw new Error('[R2] Not configured — set R2_* env vars');

  const url = endpoint(key);
  const bodyBuf = buffer;
  const bodyHash = sha256(bodyBuf);

  const headers: Record<string, string> = {
    'Host': new URL(url).host,
    'Content-Type': 'application/octet-stream',
  };

  const authHeader = signV4('PUT', key, headers, '', bodyHash);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      'Authorization': authHeader,
    },
    body: new Uint8Array(bodyBuf),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[R2] PUT failed (${res.status}): ${text}`);
  }

  if (cfg.publicUrl) {
    return `${cfg.publicUrl.replace(/\/+$/, '')}/${key}`;
  }
  return `${url}`;
}

/**
 * Delete a file from R2.
 */
export async function deleteFileFromR2(key: string): Promise<void> {
  if (!isR2Configured()) throw new Error('[R2] Not configured');

  const url = endpoint(key);
  const headers: Record<string, string> = {
    'Host': new URL(url).host,
    'Content-Type': 'application/octet-stream',
  };

  const bodyHash = sha256(Buffer.from(''));
  const authHeader = signV4('DELETE', key, headers, '', bodyHash);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...headers,
      'Authorization': authHeader,
    },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`[R2] DELETE failed (${res.status}): ${text}`);
  }
}

/**
 * Read a JSON object from R2. Returns null if key doesn't exist.
 */
export async function readJSONFromR2<T>(key: string): Promise<T | null> {
  if (!isR2Configured()) return null;

  const url = endpoint(key);
  const headers: Record<string, string> = {
    'Host': new URL(url).host,
  };

  const bodyHash = sha256(Buffer.from(''));
  const authHeader = signV4('GET', key, headers, '', bodyHash);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      'Authorization': authHeader,
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[R2] GET failed (${res.status}): ${text}`);
  }

  const text = await res.text();
  return JSON.parse(text) as T;
}

/**
 * Write a JSON object to R2.
 */
export async function writeJSONToR2(key: string, data: unknown): Promise<void> {
  if (!isR2Configured()) return;

  const jsonBuf = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  const url = endpoint(key);
  const bodyHash = sha256(jsonBuf);

  const headers: Record<string, string> = {
    'Host': new URL(url).host,
    'Content-Type': 'application/json',
  };

  const authHeader = signV4('PUT', key, headers, '', bodyHash);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      'Authorization': authHeader,
    },
    body: new Uint8Array(jsonBuf),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[R2] PUT JSON failed (${res.status}): ${text}`);
  }
}
