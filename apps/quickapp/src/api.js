/**
 * AI Portfolio Studio - API Client Module
 *
 * Wraps shared createApiClient for the Quick App platform.
 * Uses @system.fetch adapted to the standard fetch Response interface.
 */

import { createApiClient, SITE_CONFIG } from '../../shared/js/shared.mjs';

/**
 * Quick App native fetch adapter.
 * Wraps @system.fetch to return a standard Response-like Promise
 * compatible with createApiClient's expected fetchFn interface.
 */
function qaFetch(url, options) {
  return new Promise((resolve, reject) => {
    const sysFetch = require('@system.fetch');
    sysFetch.fetch({
      url,
      method: (options && options.method) || 'GET',
      header: (options && options.headers) || {},
      success: function (response) {
        resolve({
          ok: true,
          async json() { return JSON.parse(response.data); },
        });
      },
      fail: function (err, code) {
        reject(new Error(err || 'Network request failed'));
      },
    });
  });
}

const api = createApiClient(SITE_CONFIG.url, qaFetch);

/**
 * Fetch all works from the portfolio API
 * @returns {Promise<Array>} - Array of work items
 */
export async function fetchWorks() {
  return api.getWorks();
}

/**
 * Fetch a single work by ID
 * @param {string} id - Work item ID
 * @returns {Promise<object|null>} - Work item or null
 */
export async function fetchWorkById(id) {
  const works = await fetchWorks();
  return works.find((w) => w.id === id) || null;
}

/**
 * Fetch works filtered by category
 * @param {string} category - Category ID
 * @returns {Promise<Array>} - Filtered work items
 */
export async function fetchWorksByCategory(category) {
  const works = await fetchWorks();
  if (!category || category === 'all') return works;
  return works.filter((w) => w.category === category);
}

export default {
  fetchWorks,
  fetchWorkById,
  fetchWorksByCategory,
};