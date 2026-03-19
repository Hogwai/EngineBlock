import { CONFIG } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { detectCard, getUnscannedCards } from '../shared/detection.js';
import { createObserver } from '../shared/observer.js';
import { isListingPage, createPageManager } from '../shared/page.js';
import { SETTINGS_KEYS, DEFAULT_SETTINGS } from '../shared/settings.js';
import { createFloatingUI } from './ui.js';

// ==================== STORAGE ====================
const STORAGE_PREFIX = 'eb_';

function getStored(key, defaultValue) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setStored(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch { /* storage full or unavailable */ }
}

function getTotalCounters() {
    return {
        keywords: getStored('totalKeywordsBlocked', 0),
        ads: getStored('totalAdsBlocked', 0)
    };
}

function addToTotalCounters(keywords, ads) {
    const current = getTotalCounters();
    const updated = {
        keywords: current.keywords + keywords,
        ads: current.ads + ads
    };
    setStored('totalKeywordsBlocked', updated.keywords);
    setStored('totalAdsBlocked', updated.ads);
    return updated;
}

function resetTotalCounters() {
    setStored('totalKeywordsBlocked', 0);
    setStored('totalAdsBlocked', 0);
}

// ==================== STATE ====================
const state = {
    sessionKeywordsBlocked: 0,
    sessionAdsBlocked: 0,
    keywords: getStored(SETTINGS_KEYS.KEYWORDS, CONFIG.DEFAULT_KEYWORDS).map(k => k.toUpperCase()),
    settings: {
        [SETTINGS_KEYS.ENABLED]: getStored(SETTINGS_KEYS.ENABLED, DEFAULT_SETTINGS[SETTINGS_KEYS.ENABLED]),
        [SETTINGS_KEYS.FILTER_KEYWORDS]: getStored(SETTINGS_KEYS.FILTER_KEYWORDS, DEFAULT_SETTINGS[SETTINGS_KEYS.FILTER_KEYWORDS]),
        [SETTINGS_KEYS.FILTER_ADS]: getStored(SETTINGS_KEYS.FILTER_ADS, DEFAULT_SETTINGS[SETTINGS_KEYS.FILTER_ADS]),
        [SETTINGS_KEYS.LOGGING]: getStored(SETTINGS_KEYS.LOGGING, DEFAULT_SETTINGS[SETTINGS_KEYS.LOGGING])
    },
    ui: null
};

// Record install date on first run
if (!getStored(SETTINGS_KEYS.INSTALL_DATE, 0)) {
    setStored(SETTINGS_KEYS.INSTALL_DATE, Date.now());
}

// ==================== LOGGER ====================
logger.setEnabled(state.settings[SETTINGS_KEYS.LOGGING]);

// ==================== SCAN ====================
function scanAndClean() {
    if (!state.settings[SETTINGS_KEYS.ENABLED]) return;

    let keywordsRemoved = 0;
    let adsRemoved = 0;

    // Keyword filtering - uses display:none (not remove()) to prevent re-scanning
    if (state.settings[SETTINGS_KEYS.FILTER_KEYWORDS]) {
        const cards = getUnscannedCards();
        cards.forEach(card => {
            card.setAttribute(CONFIG.ATTRIBUTES.SCANNED, 'true');
            const result = detectCard(card, state.keywords);
            if (result.matched) {
                card.style.display = 'none';
                keywordsRemoved++;
                logger.log('Card hidden:', result.text);
            }
        });
    }

    // Ad filtering
    if (state.settings[SETTINGS_KEYS.FILTER_ADS]) {
        const ads = document.querySelectorAll(CONFIG.SELECTORS.ADS.join(', '));
        ads.forEach(ad => {
            ad.remove();
            adsRemoved++;
            logger.log('Ad removed:', ad.className || ad.id);
        });
    }

    if (keywordsRemoved > 0 || adsRemoved > 0) {
        state.sessionKeywordsBlocked += keywordsRemoved;
        state.sessionAdsBlocked += adsRemoved;
        const totals = addToTotalCounters(keywordsRemoved, adsRemoved);
        if (state.ui) {
            state.ui.updateCounters({
                sessionKeywords: state.sessionKeywordsBlocked,
                sessionAds: state.sessionAdsBlocked,
                totalKeywords: totals.keywords,
                totalAds: totals.ads
            });
        }
    }
}

// ==================== OBSERVER & PAGE ====================
const observer = createObserver(scanAndClean);
const pageManager = createPageManager(observer);

// ==================== HISTORY PATCHING (SPA) ====================
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
    originalPushState.apply(this, args);
    pageManager.handleUrlChange(window.location.href);
};

history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    pageManager.handleUrlChange(window.location.href);
};

window.addEventListener('popstate', () => {
    pageManager.handleUrlChange(window.location.href);
});

// Fallback polling for edge cases
let lastUrl = location.href;
setInterval(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        pageManager.handleUrlChange(location.href);
    }
}, 1000);

// ==================== VISIBILITY ====================
document.addEventListener('visibilitychange', () => {
    if (!pageManager.isOnListing()) return;
    if (!state.settings[SETTINGS_KEYS.ENABLED]) return;
    document.hidden ? observer.stop() : observer.start();
});

// ==================== UI ====================
function initUI() {
    const totals = getTotalCounters();
    state.ui = createFloatingUI({
        getState: () => ({
            enabled: state.settings[SETTINGS_KEYS.ENABLED],
            filterKeywords: state.settings[SETTINGS_KEYS.FILTER_KEYWORDS],
            filterAds: state.settings[SETTINGS_KEYS.FILTER_ADS],
            logging: state.settings[SETTINGS_KEYS.LOGGING],
            keywords: getStored(SETTINGS_KEYS.KEYWORDS, CONFIG.DEFAULT_KEYWORDS),
            sessionKeywords: state.sessionKeywordsBlocked,
            sessionAds: state.sessionAdsBlocked,
            totalKeywords: totals.keywords,
            totalAds: totals.ads
        }),
        onToggleEnabled(enabled) {
            state.settings[SETTINGS_KEYS.ENABLED] = enabled;
            setStored(SETTINGS_KEYS.ENABLED, enabled);
            if (!enabled) {
                observer.stop();
            } else if (pageManager.isOnListing()) {
                observer.start();
            }
        },
        onToggleFilterKeywords(enabled) {
            state.settings[SETTINGS_KEYS.FILTER_KEYWORDS] = enabled;
            setStored(SETTINGS_KEYS.FILTER_KEYWORDS, enabled);
        },
        onToggleFilterAds(enabled) {
            state.settings[SETTINGS_KEYS.FILTER_ADS] = enabled;
            setStored(SETTINGS_KEYS.FILTER_ADS, enabled);
        },
        onToggleLogging(enabled) {
            state.settings[SETTINGS_KEYS.LOGGING] = enabled;
            setStored(SETTINGS_KEYS.LOGGING, enabled);
            logger.setEnabled(enabled);
        },
        onKeywordsChanged(keywords) {
            state.keywords = keywords.map(k => k.toUpperCase());
            setStored(SETTINGS_KEYS.KEYWORDS, keywords);
        },
        onScan() {
            scanAndClean();
        },
        onResetCounters() {
            state.sessionKeywordsBlocked = 0;
            state.sessionAdsBlocked = 0;
            resetTotalCounters();
            if (state.ui) {
                state.ui.updateCounters({
                    sessionKeywords: 0,
                    sessionAds: 0,
                    totalKeywords: 0,
                    totalAds: 0
                });
            }
        }
    });
}

// ==================== INIT ====================
function start() {
    initUI();
    pageManager.handleUrlChange(window.location.href);
    if (!isListingPage()) {
        state.ui.hide();
    }
}

if (document.body) {
    start();
} else {
    const waiter = new MutationObserver(() => {
        if (document.body) {
            waiter.disconnect();
            start();
        }
    });
    waiter.observe(document.documentElement, { childList: true });
}
