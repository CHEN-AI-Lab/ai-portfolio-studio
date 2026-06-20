/**
 * AI Portfolio Studio - Quick App Router Configuration
 *
 * Route definitions for page navigation.
 * The primary router config lives in manifest.json.
 * This file provides programmatic route helpers for the app.
 */

export const ROUTES = {
  HOME: { path: '/', page: 'Home' },
  WORKS: { path: '/works', page: 'Works' },
  WORK_DETAIL: { path: '/works/detail', page: 'WorkDetail' },
  ABOUT: { path: '/about', page: 'About' },
};

/**
 * Navigate to a page with optional params
 * @param {string} page - Page name (e.g. 'Home', 'Works', 'WorkDetail', 'About')
 * @param {object} params - Query parameters to pass
 */
export function navigateTo(page, params = {}) {
  const router = require('@system.router');
  const route = Object.values(ROUTES).find((r) => r.page === page);
  if (!route) {
    console.error(`[Router] Unknown page: ${page}`);
    return;
  }
  router.push({
    uri: route.path,
    params: params,
  });
}

/**
 * Navigate to work detail page
 * @param {string} workId - Work item ID
 */
export function navigateToWorkDetail(workId) {
  navigateTo('WorkDetail', { id: workId });
}

/**
 * Go back to previous page
 */
export function navigateBack() {
  const router = require('@system.router');
  router.back();
}

/**
 * Replace current page (no back stack entry)
 * @param {string} page - Page name
 * @param {object} params - Query parameters
 */
export function replaceTo(page, params = {}) {
  const router = require('@system.router');
  const route = Object.values(ROUTES).find((r) => r.page === page);
  if (!route) {
    console.error(`[Router] Unknown page: ${page}`);
    return;
  }
  router.replace({
    uri: route.path,
    params: params,
  });
}