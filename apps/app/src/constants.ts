import { SITE_CONFIG } from '@shared/constants/index';

// The web app's production URL for API calls and linking
export const BASE_URL = SITE_CONFIG.url;

// API endpoint for fetching works
export const API_WORKS_UPLOADS = `${BASE_URL}/api/works/uploads`;

// Static content path
export const MEDIA_BASE_URL = `${BASE_URL}/media`;