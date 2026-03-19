import { CONFIG, mergeRemoteSelectors } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { detectCard, getUnscannedCards } from '../shared/detection.js';
import { createObserver } from '../shared/observer.js';
import { isListingPage, createPageManager } from '../shared/page.js';
import { SETTINGS_KEYS } from '../shared/settings.js';
import api from './browser-api.js';
import { applyRemoteConfig } from '../shared/remote-config.js';

const state = {
    sessionKeywordsBlocked: 0,
    sessionAdsBlocked: 0,
    keywords: [...CONFIG.DEFAULT_KEYWORDS],
    settings: {
        [SETTINGS_KEYS.ENABLED]: true,
        [SETTINGS_KEYS.FILTER_KEYWORDS]: true,
        [SETTINGS_KEYS.FILTER_ADS]: true,
        [SETTINGS_KEYS.LOGGING]: false
    }
};

const notifier = {
    pending: false,
    scheduled: false,
    lastNotifiedKeywords: 0,
    lastNotifiedAds: 0,
    queue() {
        this.pending = true;
        if (!this.scheduled) {
            this.scheduled = true;
            setTimeout(() => {
                requestIdleCallback(() => {
                    if (this.pending) {
                        const newKeywords = state.sessionKeywordsBlocked - this.lastNotifiedKeywords;
                        const newAds = state.sessionAdsBlocked - this.lastNotifiedAds;
                        if (newKeywords > 0 || newAds > 0) {
                            api.runtime.sendMessage({
                                type: 'BLOCKED',
                                keywords: newKeywords,
                                ads: newAds
                            }).catch(() => { });
                            this.lastNotifiedKeywords = state.sessionKeywordsBlocked;
                            this.lastNotifiedAds = state.sessionAdsBlocked;
                        }
                        this.pending = false;
                    }
                    this.scheduled = false;
                }, { timeout: 500 });
            }, CONFIG.DELAYS.NOTIFICATION_THROTTLE);
        }
    },
    reset() {
        this.lastNotifiedKeywords = 0;
        this.lastNotifiedAds = 0;
    }
};

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
        notifier.queue();
    }
}

const observer = createObserver(scanAndClean);
const pageManager = createPageManager(observer);

async function loadSettings() {
    const result = await api.storage.local.get({
        [SETTINGS_KEYS.ENABLED]: true,
        [SETTINGS_KEYS.FILTER_KEYWORDS]: true,
        [SETTINGS_KEYS.FILTER_ADS]: true,
        [SETTINGS_KEYS.LOGGING]: false,
        [SETTINGS_KEYS.KEYWORDS]: CONFIG.DEFAULT_KEYWORDS
    });
    state.settings = result;
    state.keywords = (result[SETTINGS_KEYS.KEYWORDS] || CONFIG.DEFAULT_KEYWORDS).map(k => k.toUpperCase());
    logger.setEnabled(result[SETTINGS_KEYS.LOGGING] || false);
}

function updateSettings(newSettings) {
    if (newSettings[SETTINGS_KEYS.ENABLED] !== undefined) {
        state.settings[SETTINGS_KEYS.ENABLED] = newSettings[SETTINGS_KEYS.ENABLED];
        if (!state.settings[SETTINGS_KEYS.ENABLED]) {
            observer.stop();
        } else if (pageManager.isOnListing()) {
            observer.start();
        }
    }
    if (newSettings[SETTINGS_KEYS.FILTER_KEYWORDS] !== undefined) {
        state.settings[SETTINGS_KEYS.FILTER_KEYWORDS] = newSettings[SETTINGS_KEYS.FILTER_KEYWORDS];
    }
    if (newSettings[SETTINGS_KEYS.FILTER_ADS] !== undefined) {
        state.settings[SETTINGS_KEYS.FILTER_ADS] = newSettings[SETTINGS_KEYS.FILTER_ADS];
    }
    if (newSettings[SETTINGS_KEYS.LOGGING] !== undefined) {
        state.settings[SETTINGS_KEYS.LOGGING] = newSettings[SETTINGS_KEYS.LOGGING];
        logger.setEnabled(newSettings[SETTINGS_KEYS.LOGGING]);
    }
    if (newSettings[SETTINGS_KEYS.KEYWORDS] !== undefined) {
        state.keywords = newSettings[SETTINGS_KEYS.KEYWORDS].map(k => k.toUpperCase());
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        observer.stop();
    } else if (pageManager.isOnListing() && state.settings[SETTINGS_KEYS.ENABLED]) {
        observer.start();
    }
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'URL_CHANGED') {
        pageManager.handleUrlChange(message.url);
        return;
    }

    if (message.type === 'GET_SESSION_COUNTS') {
        sendResponse({
            keywords: state.sessionKeywordsBlocked,
            ads: state.sessionAdsBlocked
        });
        return true;
    }

    if (message.type === 'MANUAL_SCAN') {
        scanAndClean();
        observer.start();
        sendResponse({
            keywords: state.sessionKeywordsBlocked,
            ads: state.sessionAdsBlocked
        });
        return true;
    }

    if (message.type === 'SETTINGS_CHANGED') {
        updateSettings(message);
        return;
    }

    if (message.type === 'REMOTE_CONFIG') {
        if (message.selectors) {
            mergeRemoteSelectors(message.selectors);
        }
        return;
    }
});

api.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[SETTINGS_KEYS.KEYWORDS]) {
        state.keywords = (changes[SETTINGS_KEYS.KEYWORDS].newValue || CONFIG.DEFAULT_KEYWORDS).map(k => k.toUpperCase());
    }
});

async function init() {
    if (!document.body) {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
    }

    await loadSettings();

    const storage = {
        get: (key) => api.storage.local.get(key).then(r => r[key] ?? null),
        set: (data) => api.storage.local.set(data)
    };
    const fetcher = () => api.runtime.sendMessage({ type: 'FETCH_REMOTE_CONFIG' }).catch(() => null);
    applyRemoteConfig(storage, fetcher);

    if (isListingPage() && state.settings[SETTINGS_KEYS.ENABLED]) {
        pageManager.handleUrlChange(window.location.href);
    }
}

init();
