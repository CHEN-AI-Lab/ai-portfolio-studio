/**
 * AI Portfolio Studio - Quick App Entry
 * 
 * App lifecycle hooks and global state initialization.
 */

import { ROUTES } from '../router';

export default {
  data: {
    locale: 'zh-CN',
    appName: 'AI 创艺工坊',
  },

  onCreate() {
    console.log('[App] Application created - AI Portfolio Studio');
    const storage = require('@system.storage');
    const self = this;

    // Restore saved locale preference
    storage.get({
      key: 'app_locale',
      success: function (data) {
        if (data && (data === 'zh-CN' || data === 'en')) {
          self.locale = data;
        }
        self._applyLocale(self.locale);
      },
      fail: function () {
        self._applyLocale(self.locale);
      },
    });
  },

  onDestroy() {
    console.log('[App] Application destroyed');
  },

  /**
   * Switch application locale
   * @param {string} locale - 'zh-CN' or 'en'
   */
  switchLocale(locale) {
    if (locale !== 'zh-CN' && locale !== 'en') return;
    this.locale = locale;
    const storage = require('@system.storage');
    storage.set({
      key: 'app_locale',
      value: locale,
    });
    this._applyLocale(locale);
  },

  /**
   * Internal: apply locale across all pages via broadcast
   */
  _applyLocale(locale) {
    const i18n = require('./i18n');
    i18n.setLocale(locale);
    // Update app name
    this.appName = locale === 'zh-CN' ? 'AI 创艺工坊' : 'AI Creative Studio';
    // Broadcast locale change to all pages
    this.$broadcast('locale-changed', { locale });
  },

  /**
   * Get current locale string
   * @returns {string}
   */
  getLocale() {
    return this.locale;
  },
};