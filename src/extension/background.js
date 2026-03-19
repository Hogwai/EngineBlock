import api from './browser-api.js';
import { SETTINGS_KEYS } from '../shared/settings.js';
import { fetchRemoteConfigJSON } from '../shared/remote-config.js';

let totalKeywordsBlocked = 0;
let totalAdsBlocked = 0;
let isEnabled = true;

const countersReady = loadCounters();

function updateBadge(enabled) {
    if (enabled) {
        api.action.setBadgeText({ text: '' });
    } else {
        api.action.setBadgeBackgroundColor({ color: '#FF6600' });
    }
}

async function loadCounters() {
    const result = await api.storage.local.get({
        totalKeywordsBlocked: 0,
        totalAdsBlocked: 0,
        [SETTINGS_KEYS.ENABLED]: true
    });
    totalKeywordsBlocked = result.totalKeywordsBlocked;
    totalAdsBlocked = result.totalAdsBlocked;
    isEnabled = result[SETTINGS_KEYS.ENABLED];
    updateBadge(isEnabled);
}

async function saveCounters() {
    await api.storage.local.set({
        totalKeywordsBlocked,
        totalAdsBlocked
    });
}

const navFilter = { url: [{ hostContains: 'lacentrale.fr' }] };

api.webNavigation.onHistoryStateUpdated.addListener((details) => {
    api.tabs.sendMessage(details.tabId, { type: 'URL_CHANGED', url: details.url });
}, navFilter);

api.webNavigation.onReferenceFragmentUpdated.addListener((details) => {
    api.tabs.sendMessage(details.tabId, { type: 'URL_CHANGED', url: details.url });
}, navFilter);

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BLOCKED' && sender.tab?.id) {
        (async () => {
            await countersReady;
            totalKeywordsBlocked += message.keywords || 0;
            totalAdsBlocked += message.ads || 0;
            await saveCounters();
            api.runtime.sendMessage({
                type: 'COUNTER_UPDATE',
                keywords: totalKeywordsBlocked,
                ads: totalAdsBlocked
            }).catch(() => { });
        })();
        return true;
    }

    if (message.type === 'GET_COUNTERS') {
        countersReady.then(() => {
            sendResponse({
                keywords: totalKeywordsBlocked,
                ads: totalAdsBlocked
            });
        });
        return true;
    }

    if (message.type === 'RESET_COUNTERS') {
        (async () => {
            await countersReady;
            totalKeywordsBlocked = 0;
            totalAdsBlocked = 0;
            await saveCounters();
            api.runtime.sendMessage({
                type: 'COUNTER_UPDATE',
                keywords: 0,
                ads: 0
            }).catch(() => { });
        })();
        return true;
    }

    if (message.type === 'FETCH_REMOTE_CONFIG') {
        fetchRemoteConfigJSON().then(config => {
            sendResponse(config);
        }).catch(() => {
            sendResponse(null);
        });
        return true;
    }

    if (message.type === 'SETTINGS_CHANGED') {
        if (message.enabled !== undefined) {
            isEnabled = message.enabled;
            updateBadge(isEnabled);
        }
        // Relay to content scripts
        api.tabs.query({ url: 'https://*.lacentrale.fr/*' }, (tabs) => {
            for (const tab of tabs) {
                api.tabs.sendMessage(tab.id, message).catch(() => {});
            }
        });
    }
});

async function recordInstallDate() {
    const result = await api.storage.local.get({ [SETTINGS_KEYS.INSTALL_DATE]: 0 });
    if (!result[SETTINGS_KEYS.INSTALL_DATE]) {
        await api.storage.local.set({ [SETTINGS_KEYS.INSTALL_DATE]: Date.now() });
    }
}

async function migrateFromSync() {
    const local = await api.storage.local.get({ [SETTINGS_KEYS.MIGRATED]: false });
    if (local[SETTINGS_KEYS.MIGRATED]) return;

    try {
        const sync = await api.storage.sync.get(['keywords']);
        if (sync.keywords && Array.isArray(sync.keywords)) {
            await api.storage.local.set({ [SETTINGS_KEYS.KEYWORDS]: sync.keywords });
            await api.storage.sync.remove('keywords');
        }
    } catch { /* sync not available (Chrome) — ignore */ }

    await api.storage.local.set({ [SETTINGS_KEYS.MIGRATED]: true });
}

api.runtime.onInstalled.addListener(async () => {
    await recordInstallDate();
    await migrateFromSync();
});

recordInstallDate();
