import api from './browser-api.js';
import { SETTINGS_KEYS, DEFAULT_SETTINGS, detectLanguage } from '../shared/settings.js';
import { CONFIG } from '../shared/config.js';
import { createTranslator } from '../shared/translations.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ── Translation ──────────────────────────────────────────────────────────

    const t = createTranslator(detectLanguage());

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });
    }

    applyTranslations();

    // ── Tab mode detection (Firefox Android / options_ui) ────────────────────

    if (window.location.search.includes('open_in_tab') || window.innerWidth > 400) {
        document.body.classList.add('tab-mode');
    }

    // ── Status helper ────────────────────────────────────────────────────────

    function showStatus(text, color = '') {
        const el = document.getElementById('statusText');
        el.textContent = text;
        el.style.color = color;
        setTimeout(() => {
            el.textContent = t('statusReady');
            el.style.color = '';
        }, 2000);
    }

    // ── Keyword management ───────────────────────────────────────────────────

    async function loadKeywords() {
        const result = await api.storage.local.get({ [SETTINGS_KEYS.KEYWORDS]: CONFIG.DEFAULT_KEYWORDS });
        return result[SETTINGS_KEYS.KEYWORDS];
    }

    async function saveKeywords(keywords) {
        await api.storage.local.set({ [SETTINGS_KEYS.KEYWORDS]: keywords });
        api.runtime.sendMessage({ type: 'SETTINGS_CHANGED', [SETTINGS_KEYS.KEYWORDS]: keywords }).catch(() => {});
    }

    function renderKeywords(keywords) {
        const list = document.getElementById('keywordList');
        list.innerHTML = '';
        keywords.forEach((kw, i) => {
            const li = document.createElement('li');
            const text = document.createTextNode(kw);
            li.appendChild(text);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-keyword';
            removeBtn.textContent = '×';
            removeBtn.dataset.index = i;
            li.appendChild(removeBtn);
            list.appendChild(li);
        });
    }

    document.getElementById('addKeywordBtn').addEventListener('click', async () => {
        const input = document.getElementById('keywordInput');
        const value = input.value.trim().toUpperCase();
        if (!value) return;
        const keywords = await loadKeywords();
        if (keywords.includes(value)) {
            showStatus(t('alreadyPresent'), 'orange');
            return;
        }
        keywords.push(value);
        await saveKeywords(keywords);
        renderKeywords(keywords);
        input.value = '';
    });

    // Allow adding keyword by pressing Enter
    document.getElementById('keywordInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('addKeywordBtn').click();
        }
    });

    // Remove keyword — event delegation
    document.getElementById('keywordList').addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-keyword')) {
            const index = parseInt(e.target.dataset.index, 10);
            const keywords = await loadKeywords();
            keywords.splice(index, 1);
            await saveKeywords(keywords);
            renderKeywords(keywords);
        }
    });

    document.getElementById('resetKeywordsBtn').addEventListener('click', async () => {
        const defaults = [...CONFIG.DEFAULT_KEYWORDS];
        await saveKeywords(defaults);
        renderKeywords(defaults);
    });

    // ── Counters ─────────────────────────────────────────────────────────────

    // Total counters from background
    api.runtime.sendMessage({ type: 'GET_COUNTERS' }, (response) => {
        if (response) {
            document.getElementById('keywordsTotalCount').textContent = response.keywords || 0;
            document.getElementById('adsTotalCount').textContent = response.ads || 0;
        }
    });

    // Session counters from active tab's content script
    api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            api.tabs.sendMessage(tabs[0].id, { type: 'GET_SESSION_COUNTS' }, (response) => {
                if (response) {
                    document.getElementById('keywordsSessionCount').textContent = response.keywords || 0;
                    document.getElementById('adsSessionCount').textContent = response.ads || 0;
                }
            });
        }
    });

    // Real-time counter updates from background
    api.runtime.onMessage.addListener((message) => {
        if (message.type === 'COUNTER_UPDATE') {
            document.getElementById('keywordsTotalCount').textContent = message.keywords || 0;
            document.getElementById('adsTotalCount').textContent = message.ads || 0;
        }
    });

    // ── Filter toggles ───────────────────────────────────────────────────────

    const filterSettings = await api.storage.local.get({
        [SETTINGS_KEYS.FILTER_KEYWORDS]: DEFAULT_SETTINGS[SETTINGS_KEYS.FILTER_KEYWORDS],
        [SETTINGS_KEYS.FILTER_ADS]: DEFAULT_SETTINGS[SETTINGS_KEYS.FILTER_ADS]
    });
    document.getElementById('filterKeywords').checked = filterSettings[SETTINGS_KEYS.FILTER_KEYWORDS];
    document.getElementById('filterAds').checked = filterSettings[SETTINGS_KEYS.FILTER_ADS];

    document.getElementById('filterKeywords').addEventListener('change', async (e) => {
        await api.storage.local.set({ [SETTINGS_KEYS.FILTER_KEYWORDS]: e.target.checked });
        api.runtime.sendMessage({ type: 'SETTINGS_CHANGED', [SETTINGS_KEYS.FILTER_KEYWORDS]: e.target.checked }).catch(() => {});
    });

    document.getElementById('filterAds').addEventListener('change', async (e) => {
        await api.storage.local.set({ [SETTINGS_KEYS.FILTER_ADS]: e.target.checked });
        api.runtime.sendMessage({ type: 'SETTINGS_CHANGED', [SETTINGS_KEYS.FILTER_ADS]: e.target.checked }).catch(() => {});
    });

    // ── Scan button ──────────────────────────────────────────────────────────

    document.getElementById('scanNowBtn').addEventListener('click', async () => {
        const [tab] = await api.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url?.includes('lacentrale.fr')) {
            showStatus('Not on lacentrale.fr', 'red');
            return;
        }

        showStatus(t('scanning'), 'blue');
        document.getElementById('scanNowBtn').disabled = true;

        api.tabs.sendMessage(tab.id, { type: 'MANUAL_SCAN' }, (response) => {
            document.getElementById('scanNowBtn').disabled = false;
            if (api.runtime.lastError || !response) {
                showStatus(t('statusReady'));
                return;
            }
            const parts = [];
            if (response.keywords > 0) parts.push(`${response.keywords} keyword${response.keywords !== 1 ? 's' : ''}`);
            if (response.ads > 0) parts.push(`${response.ads} ad${response.ads !== 1 ? 's' : ''}`);
            if (parts.length > 0) {
                showStatus(`${parts.join(', ')} hidden`, 'green');
            } else {
                showStatus(t('statusReady'));
            }
        });
    });

    // ── Settings modal ───────────────────────────────────────────────────────

    document.getElementById('openSettings').addEventListener('click', () => {
        document.getElementById('settingsOverlay').hidden = false;
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsOverlay').hidden = true;
    });

    document.getElementById('settingsOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('settingsOverlay').hidden = true;
        }
    });

    // ── Settings toggles (enabled, logging) ──────────────────────────────────

    const mainSettings = await api.storage.local.get({
        [SETTINGS_KEYS.ENABLED]: DEFAULT_SETTINGS[SETTINGS_KEYS.ENABLED],
        [SETTINGS_KEYS.LOGGING]: DEFAULT_SETTINGS[SETTINGS_KEYS.LOGGING]
    });

    const enabledToggle = document.getElementById('enabledToggle');
    enabledToggle.checked = mainSettings[SETTINGS_KEYS.ENABLED];
    updateDisabledBanner(mainSettings[SETTINGS_KEYS.ENABLED]);

    enabledToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        await api.storage.local.set({ [SETTINGS_KEYS.ENABLED]: enabled });
        api.runtime.sendMessage({ type: 'SETTINGS_CHANGED', [SETTINGS_KEYS.ENABLED]: enabled }).catch(() => {});
        updateDisabledBanner(enabled);
    });

    document.getElementById('loggingToggle').checked = mainSettings[SETTINGS_KEYS.LOGGING];
    document.getElementById('loggingToggle').addEventListener('change', async (e) => {
        await api.storage.local.set({ [SETTINGS_KEYS.LOGGING]: e.target.checked });
        api.runtime.sendMessage({ type: 'SETTINGS_CHANGED', [SETTINGS_KEYS.LOGGING]: e.target.checked }).catch(() => {});
    });

    function updateDisabledBanner(enabled) {
        document.getElementById('disabledBanner').hidden = enabled;
    }

    // ── Reset counters ────────────────────────────────────────────────────────

    document.getElementById('resetCountersBtn').addEventListener('click', () => {
        document.getElementById('resetCountersBtn').hidden = true;
        document.getElementById('resetConfirm').hidden = false;
    });

    document.getElementById('cancelReset').addEventListener('click', () => {
        document.getElementById('resetConfirm').hidden = true;
        document.getElementById('resetCountersBtn').hidden = false;
    });

    document.getElementById('confirmReset').addEventListener('click', async () => {
        await api.storage.local.set({ totalKeywordsBlocked: 0, totalAdsBlocked: 0 });
        document.getElementById('keywordsTotalCount').textContent = '0';
        document.getElementById('adsTotalCount').textContent = '0';
        api.runtime.sendMessage({ type: 'RESET_COUNTERS' }).catch(() => {});
        document.getElementById('resetConfirm').hidden = true;
        document.getElementById('resetCountersBtn').hidden = false;
        document.getElementById('settingsOverlay').hidden = true;
        showStatus(t('saved'), 'green');
    });

    // ── Support section ───────────────────────────────────────────────────────

    document.getElementById('supportToggle').addEventListener('click', () => {
        const toggle = document.getElementById('supportToggle');
        const content = document.getElementById('supportContent');
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        toggle.classList.toggle('open', !isExpanded);
        content.hidden = isExpanded;
    });

    // ── Review banner ─────────────────────────────────────────────────────────

    const isFirefox = typeof browser !== 'undefined' && !!browser.runtime?.getURL;
    const reviewUrl = isFirefox ? CONFIG.REVIEW.FIREFOX_URL : CONFIG.REVIEW.CHROME_URL;
    if (reviewUrl) {
        document.getElementById('reviewLink').href = reviewUrl;
    }

    async function checkReviewBanner() {
        const result = await api.storage.local.get({
            [SETTINGS_KEYS.INSTALL_DATE]: null,
            [SETTINGS_KEYS.REVIEW_DISMISSED]: false
        });
        if (result[SETTINGS_KEYS.REVIEW_DISMISSED]) return;
        if (!result[SETTINGS_KEYS.INSTALL_DATE]) return;
        const daysSince = (Date.now() - result[SETTINGS_KEYS.INSTALL_DATE]) / (1000 * 60 * 60 * 24);
        if (daysSince >= CONFIG.REVIEW.DAYS_BEFORE_REVIEW) {
            document.getElementById('reviewBanner').hidden = false;
        }
    }

    document.getElementById('dismissReview').addEventListener('click', async () => {
        document.getElementById('reviewBanner').hidden = true;
        await api.storage.local.set({ [SETTINGS_KEYS.REVIEW_DISMISSED]: true });
    });

    // ── Load initial keywords ─────────────────────────────────────────────────

    const initialKeywords = await loadKeywords();
    renderKeywords(initialKeywords);

    // ── Kick off async checks ─────────────────────────────────────────────────

    checkReviewBanner();
});
