/**
 * AI Portfolio Studio - Home Page Logic
 */

import { t, getLocale, setLocale, getCategoryIcon } from '../i18n';
import { fetchWorks } from '../api';

export default {
  private: {
    /**
     * Initialize page data
     */
    onInit() {
      console.log('[Home] Page initialized');
    },
  },
};