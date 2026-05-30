/**
 * Centralized Frontend Configuration
 * Automatically detects development vs production environment.
 */

(function () {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    /**
     * API Base URL:
     *  - In local dev (localhost): point to local Express server on port 5000
     *  - In production: use /api (assumes reverse proxy routes /api → backend)
     *    OR update PRODUCTION_API_URL below to your deployed backend URL.
     */
    const PRODUCTION_API_URL = ''; // Leave empty to use same-origin /api, OR set e.g. 'https://your-backend.onrender.com/api'

    const API_BASE_URL = isLocalhost
        ? 'http://localhost:5000/api'
        : (PRODUCTION_API_URL || (window.location.origin + '/api'));

    const CONFIG = {
        API_BASE_URL: API_BASE_URL,
        IS_DEV: isLocalhost
    };

    // Make available globally for non-module scripts
    window.APP_CONFIG = CONFIG;

    if (isLocalhost) {
        console.log('[Nissan Config] Development mode. API:', API_BASE_URL);
    }
})();
