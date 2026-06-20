/**
 * AI Portfolio Studio — Desktop i18n Module
 *
 * Locale state management wrapper around shared/js/shared.mjs.
 * The shared module provides i18n data; this file manages the
 * current locale and exposes a (key, vars) style t() for the
 * existing desktop app codebase.
 */

import { t as sharedT } from '../../shared/js/shared.mjs';
export type Locale = 'zh-CN' | 'en';

// ─── Current locale state ────────────────────────────────────────

let currentLocale: Locale = 'zh-CN';

const listeners: Array<(locale: Locale) => void> = [];

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  listeners.forEach((fn) => fn(locale));
}

export function onLocaleChange(fn: (locale: Locale) => void): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function toggleLocale(): Locale {
  const next: Locale = currentLocale === 'zh-CN' ? 'en' : 'zh-CN';
  setLocale(next);
  return next;
}

// ─── Translation helper ──────────────────────────────────────────

/**
 * Translate a dot-separated key path in the current locale.
 * Signature matches the existing desktop app interface.
 * @param key - e.g. 'nav.home', 'work.all'
 * @param vars - Optional interpolation values, e.g. { count: 12 }
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const msg = sharedT(currentLocale, key);
  if (!vars) return msg;
  return msg.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/**
 * Get a translated array by key path.
 * Falls back to empty array if the path does not resolve to an array.
 */
export function tArray(key: string): string[] {
  // Attempt to read from the shared messages object directly.
  // sharedT only returns strings, so we resolve manually.
  const parts = key.split('.');
  // We import the ZH messages for array retrieval since shared only
  // exports t(). For now return empty — the desktop app uses inline
  // skills/tools arrays defined in main.ts, not i18n arrays.
  return [];
}

// ─── Expose for HTML templates ───────────────────────────────────

(window as any).__i18n = { t, tArray, getLocale, setLocale, toggleLocale, onLocaleChange };
