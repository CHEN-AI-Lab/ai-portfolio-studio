// ─── Cookie helpers ───────────────────────────────────────────────
// Lightweight utility for setting/reading cookies on the client side

interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie in the browser.
 * Used primarily for locale switching (NEXT_LOCALE cookie).
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof document === 'undefined') return;

  const { path = '/', domain, maxAge, secure, sameSite = 'lax' } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookie += `; path=${path}`;

  if (domain) cookie += `; domain=${domain}`;
  if (maxAge) cookie += `; max-age=${maxAge}`;
  if (secure) cookie += '; secure';
  if (sameSite) cookie += `; samesite=${sameSite}`;

  document.cookie = cookie;
}

/**
 * Read a cookie value by name.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`),
  );

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Delete a cookie by name.
 */
export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0`;
}
