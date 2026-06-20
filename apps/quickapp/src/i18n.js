/**
 * AI Portfolio Studio - Quick App i18n Module
 *
 * Wraps shared/js/shared.mjs with locale state management for the Quick App.
 * The inline translation data has been replaced with imports from shared.
 */

import { t as sharedT, CATEGORIES, SITE_CONFIG, createApiClient, formatDuration } from '../../shared/js/shared.mjs';

let currentLocale = 'zh-CN';

/**
 * Set the active locale
 * @param {'zh-CN'|'en'} locale
 */
export function setLocale(locale) {
  if (locale === 'zh-CN' || locale === 'en') {
    currentLocale = locale;
  }
}

/**
 * Get the current locale code
 * @returns {string}
 */
export function getLocale() {
  return currentLocale;
}

/**
 * Translate a dot-separated key path in the current locale.
 * Wraps shared t(locale, path) → t(key, params) for Quick App compatibility.
 * @param {string} key - e.g. 'nav.home' or 'work.all'
 * @param {object} params - Optional interpolation params, e.g. { count: 12 }
 * @returns {string}
 */
export function t(key, params) {
  const msg = sharedT(currentLocale, key);
  if (typeof msg !== 'string') return key;
  if (params) {
    return msg.replace(/\{(\w+)\}/g, (match, p) => {
      return params[p] !== undefined ? String(params[p]) : match;
    });
  }
  return msg;
}

/**
 * Get a nested raw value (non-string, e.g. an object) by key path.
 * Falls back to shared's zh-CN messages for raw access.
 * @param {string} key - dot-separated key path
 * @returns {any}
 */
export function tv(key) {
  const keys = key.split('.');
  let value = sharedT(currentLocale, key);
  // If sharedT returned the key itself (fallback), try zh-CN
  if (value === key) {
    value = sharedT('zh-CN', key);
  }
  // tv() should return the raw nested value; sharedT only returns strings,
  // so this is a limited implementation. For category icons, use getCategoryIcon.
  return value !== key ? value : null;
}

/**
 * Get category icon emoji
 * @param {string} categoryId
 * @returns {string}
 */
export function getCategoryIcon(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.icon : '📁';
}

// Re-export shared constants and utilities
export { CATEGORIES, SITE_CONFIG, createApiClient, formatDuration };

export default {
  setLocale,
  getLocale,
  t,
  tv,
  getCategoryIcon,
  CATEGORIES,
  SITE_CONFIG,
  createApiClient,
  formatDuration,
};