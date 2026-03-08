import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    // Slightly longer timeout to account for cold-start on Render free tier
    timeout: 15000,
});

/* ─── Simple in-memory GET cache ──────────────────────────────────────────
   Caches successful GET responses for `TTL` ms.
   Mutation methods (POST / PUT / DELETE) bypass and bust the cache.
   This prevents the same dashboard data being fetched 10+ times on
   every render/re-render, which is the main source of perceived slowness.
────────────────────────────────────────────────────────────────────────── */
const cache = new Map();          // url → { data, expiresAt }
const TTL = 20_000;             // 20 seconds default
const NO_CACHE = new Set([          // never cache these endpoints
    '/auth/me',
    '/notifications',
]);

const getCached = (url) => {
    const entry = cache.get(url);
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    cache.delete(url);
    return null;
};

const bustCache = (url) => {
    // Bust any cached GET that shares the same resource path prefix
    for (const key of cache.keys()) {
        if (key.startsWith(url.split('?')[0])) cache.delete(key);
    }
};

// Request interceptor — serve from cache for GET requests
api.interceptors.request.use((config) => {
    if (config.method === 'get') {
        const cacheKey = config.url + (config.params ? JSON.stringify(config.params) : '');
        const skipCache = NO_CACHE.has(config.url) || config.noCache;

        if (!skipCache) {
            const cached = getCached(cacheKey);
            if (cached) {
                // Abort the real request and return the cached data synthesised as a
                // resolved axios response via the cancel-token trick.
                config._cachedData = cached;
                config._cacheKey = cacheKey;
            } else {
                config._cacheKey = cacheKey;
            }
        }
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor — store GET results in cache + handle errors
api.interceptors.response.use(
    (response) => {
        const { config } = response;
        // Store fresh GET responses in cache
        if (config.method === 'get' && config._cacheKey && !config.noCache) {
            cache.set(config._cacheKey, { data: response.data, expiresAt: Date.now() + TTL });
        }

        // Bust cache on mutations so next GET sees fresh data
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            bustCache(config.url);
        }

        // If this request was actually served from cache (_cachedData was set),
        // just return wrapped data — real network was never made.
        if (config._cachedData) {
            return { ...response, data: config._cachedData };
        }

        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

// Expose helpers so pages can manually clear cache if needed
export const clearApiCache = () => cache.clear();
export const bustApiCache = (url) => bustCache(url);
