import { CONFIG, mergeRemoteSelectors } from './config.js';
import { logger } from './logger.js';

const CACHE_KEY = 'remoteConfig';

function extractValidSelectors(data) {
    if (!data || typeof data !== 'object') return null;
    if (typeof data.version !== 'number') return null;
    if (!data.selectors || typeof data.selectors !== 'object') return null;

    const s = data.selectors;
    const valid = {};
    if (typeof s.card === 'string' && s.card) valid.card = s.card;
    if (typeof s.subtitle === 'string' && s.subtitle) valid.subtitle = s.subtitle;
    if (typeof s.feedWrapper === 'string') valid.feedWrapper = s.feedWrapper;
    if (Array.isArray(s.ads) && s.ads.every(a => typeof a === 'string' && a)) valid.ads = s.ads;
    return Object.keys(valid).length > 0 ? valid : null;
}

export async function fetchRemoteConfigJSON() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
        const res = await fetch(CONFIG.REMOTE_CONFIG_URL, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) return null;
        const data = await res.json();
        const selectors = extractValidSelectors(data);
        return selectors ? { version: data.version, selectors } : null;
    } catch {
        clearTimeout(timeout);
        return null;
    }
}

export async function applyRemoteConfig(storage, fetcher = fetchRemoteConfigJSON) {
    try {
        const cached = await storage.get(CACHE_KEY);
        if (cached?.selectors) {
            mergeRemoteSelectors(cached.selectors);
            logger.log('Applied cached remote config');
        }
    } catch { /* ignore */ }

    try {
        const fresh = await fetcher();
        if (fresh) {
            mergeRemoteSelectors(fresh.selectors);
            await storage.set({ [CACHE_KEY]: fresh });
            logger.log('Applied and cached fresh remote config');
        }
    } catch { /* ignore */ }
}
