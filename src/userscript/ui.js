import { createTranslator } from '../shared/translations.js';
import { detectLanguage } from '../shared/settings.js';
import { CONFIG } from '../shared/config.js';

// ==================== STYLES ====================
const STYLES = `
    :host {
        all: initial;
        position: fixed !important;
        bottom: 80px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    /* ---- FAB ---- */
    .eb-fab {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF6600, #e55a00);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
        transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        position: relative;
        outline: none;
    }

    .eb-fab:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .eb-fab.disabled {
        background: #999;
    }

    .eb-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #E74C3C;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        line-height: 1;
    }

    .eb-badge.visible {
        display: flex;
    }

    /* ---- Panel ---- */
    .eb-panel {
        position: absolute;
        bottom: 56px;
        right: 0;
        width: 300px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
    }

    .eb-panel.open {
        display: flex;
        animation: eb-slide 0.2s ease-out;
    }

    @keyframes eb-slide {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* ---- Header ---- */
    .eb-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(135deg, #FF6600, #e55a00);
        color: #fff;
    }

    .eb-title {
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        letter-spacing: 0.3px;
    }

    .eb-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.85);
        display: flex;
        align-items: center;
        line-height: 0;
        transition: color 0.2s;
    }

    .eb-close:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.15);
    }

    /* ---- Section divider ---- */
    .eb-divider {
        height: 1px;
        background: #eee;
        margin: 0;
    }

    /* ---- Toggles ---- */
    .eb-toggles {
        padding: 6px 16px;
    }

    .eb-toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        cursor: pointer;
        font-size: 13px;
        color: #333;
        user-select: none;
    }

    .eb-toggle-row span:first-child {
        flex: 1;
    }

    .eb-toggle-wrap {
        position: relative;
        flex-shrink: 0;
    }

    .eb-toggle-wrap input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }

    .eb-switch {
        display: block;
        width: 36px;
        height: 20px;
        background: #ccc;
        border-radius: 10px;
        position: relative;
        transition: background 0.2s;
        cursor: pointer;
    }

    .eb-switch::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: transform 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    input:checked + .eb-switch {
        background: #FF6600;
    }

    input:checked + .eb-switch::after {
        transform: translateX(16px);
    }

    /* ---- Counters ---- */
    .eb-counters {
        padding: 8px 16px;
        background: #fafafa;
    }

    .eb-counter-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 12px;
        color: #555;
    }

    .eb-counter-label {
        font-weight: 500;
        color: #444;
    }

    .eb-counter-values {
        display: flex;
        gap: 12px;
    }

    .eb-counter-value {
        text-align: right;
        min-width: 36px;
    }

    .eb-counter-value span {
        font-weight: 700;
        color: #FF6600;
    }

    .eb-counter-meta {
        font-size: 10px;
        color: #aaa;
        text-align: right;
    }

    .eb-reset-counters {
        display: block;
        width: 100%;
        margin-top: 6px;
        padding: 4px 0;
        background: none;
        border: none;
        font-size: 11px;
        color: #aaa;
        cursor: pointer;
        text-align: right;
        transition: color 0.2s;
    }

    .eb-reset-counters:hover {
        color: #FF6600;
    }

    /* ---- Keywords section ---- */
    .eb-keywords-section {
        padding: 8px 16px 12px;
    }

    .eb-keywords-title {
        font-size: 11px;
        font-weight: 600;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }

    .eb-keyword-input-row {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
    }

    .eb-keyword-input {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 12px;
        color: #333;
        outline: none;
        transition: border-color 0.2s;
    }

    .eb-keyword-input:focus {
        border-color: #FF6600;
    }

    .eb-keyword-add-btn {
        padding: 6px 12px;
        background: #FF6600;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
        white-space: nowrap;
    }

    .eb-keyword-add-btn:hover {
        opacity: 0.9;
    }

    .eb-keyword-list {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 6px;
        min-height: 0;
    }

    .eb-keyword-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px 3px 10px;
        background: #fff3e8;
        border: 1px solid #ffd6b0;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        color: #cc5200;
    }

    .eb-keyword-remove {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: #cc5200;
        display: flex;
        align-items: center;
        opacity: 0.6;
        transition: opacity 0.2s;
        line-height: 0;
    }

    .eb-keyword-remove:hover {
        opacity: 1;
    }

    .eb-keyword-reset {
        background: none;
        border: none;
        font-size: 11px;
        color: #aaa;
        cursor: pointer;
        padding: 2px 0;
        transition: color 0.2s;
    }

    .eb-keyword-reset:hover {
        color: #FF6600;
    }

    .eb-status {
        font-size: 11px;
        color: #aaa;
        min-height: 14px;
        margin-top: 4px;
    }

    .eb-status.success {
        color: #27ae60;
    }

    .eb-status.error {
        color: #e74c3c;
    }

    /* ---- Scan button ---- */
    .eb-scan-btn {
        display: block;
        width: calc(100% - 32px);
        margin: 4px 16px 8px;
        padding: 8px;
        background: linear-gradient(135deg, #FF6600, #e55a00);
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    .eb-scan-btn:hover {
        opacity: 0.9;
    }

    .eb-scan-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* ---- Footer ---- */
    .eb-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px 16px 10px;
        border-top: 1px solid #eee;
        font-size: 11px;
        color: #ccc;
        gap: 4px;
    }

    .eb-footer-link {
        color: #bbb;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
    }

    .eb-footer-link:hover {
        color: #FF6600;
    }

    /* ---- Disabled state ---- */
    .eb-panel.disabled .eb-filter-toggle { opacity: 0.4; pointer-events: none; }
    .eb-panel.disabled .eb-keywords-section { opacity: 0.4; pointer-events: none; }
    .eb-panel.disabled .eb-scan-btn { opacity: 0.4; pointer-events: none; }
`;

// ==================== DOM BUILDER HELPERS ====================
const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    }
    return element;
}

function svg(tag, attrs = {}, ...children) {
    const element = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
    }
    for (const child of children) {
        if (child) element.appendChild(child);
    }
    return element;
}

function svgIcon(w, h, paths) {
    return svg('svg', { width: w, height: h, viewBox: '0 0 24 24', fill: 'none' },
        ...paths.map(p => {
            const { tag: t = 'path', ...rest } = p;
            return svg(t, rest);
        })
    );
}

function toggleRow(labelText, inputId, extraClass) {
    const cls = extraClass ? `eb-toggle-row ${extraClass}` : 'eb-toggle-row';
    return el('label', { class: cls },
        el('span', {}, labelText),
        el('span', { class: 'eb-toggle-wrap' },
            el('input', { type: 'checkbox', id: inputId }),
            el('span', { class: 'eb-switch' })
        )
    );
}

// ==================== DOM CONSTRUCTION ====================
function createDOM(t) {
    // FAB icon — gear/filter
    const fabIcon = svgIcon(22, 22, [
        { d: 'M19 13H5V11H19V13Z', fill: 'white' },
        { d: 'M19 7H5V5H19V7Z', fill: 'white' },
        { d: 'M15 17H5V15H15V17Z', fill: 'white' },
        { tag: 'circle', cx: '18', cy: '16', r: '5', fill: '#E74C3C' },
        { d: 'M15.5 14L20.5 18M20.5 14L15.5 18', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' },
    ]);

    const closeIcon = svgIcon(14, 14, [
        { d: 'M18 6L6 18M6 6l12 12', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round' },
    ]);

    const removeIcon = svgIcon(10, 10, [
        { d: 'M18 6L6 18M6 6l12 12', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round' },
    ]);

    const fab = el('button', { class: 'eb-fab', id: 'eb-fab', title: 'EngineBlock' },
        fabIcon,
        el('span', { class: 'eb-badge', id: 'eb-badge' })
    );

    const panel = el('div', { class: 'eb-panel', id: 'eb-panel' },
        // Header
        el('div', { class: 'eb-header' },
            el('span', { class: 'eb-title' }, 'EngineBlock'),
            el('button', { class: 'eb-close', id: 'eb-close', title: 'Close' }, closeIcon)
        ),
        // Main toggle
        el('div', { class: 'eb-toggles' },
            toggleRow(t('enabled'), 'eb-enabled')
        ),
        el('div', { class: 'eb-divider' }),
        // Counters
        el('div', { class: 'eb-counters', id: 'eb-counters' },
            el('div', { class: 'eb-counter-row' },
                el('span', { class: 'eb-counter-label' }, t('keywordsBlocked')),
                el('div', { class: 'eb-counter-values' },
                    el('div', { class: 'eb-counter-value' },
                        el('span', { id: 'eb-session-keywords' }, '0'),
                        el('div', { class: 'eb-counter-meta' }, t('session'))
                    ),
                    el('div', { class: 'eb-counter-value' },
                        el('span', { id: 'eb-total-keywords' }, '0'),
                        el('div', { class: 'eb-counter-meta' }, t('total'))
                    )
                )
            ),
            el('div', { class: 'eb-counter-row' },
                el('span', { class: 'eb-counter-label' }, t('adsBlocked')),
                el('div', { class: 'eb-counter-values' },
                    el('div', { class: 'eb-counter-value' },
                        el('span', { id: 'eb-session-ads' }, '0'),
                        el('div', { class: 'eb-counter-meta' }, t('session'))
                    ),
                    el('div', { class: 'eb-counter-value' },
                        el('span', { id: 'eb-total-ads' }, '0'),
                        el('div', { class: 'eb-counter-meta' }, t('total'))
                    )
                )
            ),
            el('button', { class: 'eb-reset-counters', id: 'eb-reset-counters' }, t('resetCounters'))
        ),
        el('div', { class: 'eb-divider' }),
        // Filter toggles
        el('div', { class: 'eb-toggles' },
            toggleRow(t('filterKeywords'), 'eb-filter-keywords', 'eb-filter-toggle'),
            toggleRow(t('filterAds'), 'eb-filter-ads', 'eb-filter-toggle'),
            toggleRow(t('logging'), 'eb-logging')
        ),
        el('div', { class: 'eb-divider' }),
        // Keywords management
        el('div', { class: 'eb-keywords-section', id: 'eb-keywords-section' },
            el('div', { class: 'eb-keywords-title' }, t('filterKeywords')),
            el('div', { class: 'eb-keyword-input-row' },
                el('input', { class: 'eb-keyword-input', id: 'eb-keyword-input', type: 'text', placeholder: t('keywordPlaceholder') }),
                el('button', { class: 'eb-keyword-add-btn', id: 'eb-keyword-add' }, t('addKeyword'))
            ),
            el('div', { class: 'eb-keyword-list', id: 'eb-keyword-list' }),
            el('button', { class: 'eb-keyword-reset', id: 'eb-keyword-reset' }, t('resetDefaults')),
            el('div', { class: 'eb-status', id: 'eb-status' })
        ),
        el('div', { class: 'eb-divider' }),
        // Scan button
        el('button', { class: 'eb-scan-btn', id: 'eb-scan' }, t('scanNow')),
        // Footer
        el('div', { class: 'eb-footer' },
            el('span', {}, t('madeBy')),
            el('a', { class: 'eb-footer-link', href: 'https://github.com/Hogwai', target: '_blank' }, 'Hogwai')
        )
    );

    const fragment = document.createDocumentFragment();
    fragment.appendChild(fab);
    fragment.appendChild(panel);
    return { fragment, removeIcon };
}

// ==================== FLOATING UI ====================
export function createFloatingUI({
    getState,
    onToggleEnabled,
    onToggleFilterKeywords,
    onToggleFilterAds,
    onToggleLogging,
    onKeywordsChanged,
    onScan,
    onResetCounters
}) {
    const lang = detectLanguage();
    const t = createTranslator(lang);

    const host = document.createElement('div');
    host.id = 'engineblock-ui';
    const shadow = host.attachShadow({ mode: 'closed' });

    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    shadow.appendChild(styleEl);

    const { fragment, removeIcon } = createDOM(t);
    shadow.appendChild(fragment);

    // Element references
    const $ = (id) => shadow.getElementById(id);
    const fab = $('eb-fab');
    const badge = $('eb-badge');
    const panel = $('eb-panel');
    const closeBtn = $('eb-close');
    const enabledInput = $('eb-enabled');
    const filterKeywordsInput = $('eb-filter-keywords');
    const filterAdsInput = $('eb-filter-ads');
    const loggingInput = $('eb-logging');
    const sessionKeywordsEl = $('eb-session-keywords');
    const totalKeywordsEl = $('eb-total-keywords');
    const sessionAdsEl = $('eb-session-ads');
    const totalAdsEl = $('eb-total-ads');
    const resetCountersBtn = $('eb-reset-counters');
    const keywordInput = $('eb-keyword-input');
    const keywordAddBtn = $('eb-keyword-add');
    const keywordList = $('eb-keyword-list');
    const keywordResetBtn = $('eb-keyword-reset');
    const statusEl = $('eb-status');
    const scanBtn = $('eb-scan');

    let statusTimer = null;

    // ---- Helpers ----
    function showStatus(text, type = '') {
        statusEl.textContent = text;
        statusEl.className = 'eb-status' + (type ? ' ' + type : '');
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'eb-status';
        }, 2500);
    }

    function updateDisabledState(enabled) {
        fab.classList.toggle('disabled', !enabled);
        panel.classList.toggle('disabled', !enabled);
    }

    function renderKeywords(keywords) {
        keywordList.innerHTML = '';
        keywords.forEach(kw => {
            const tag = el('span', { class: 'eb-keyword-tag' },
                document.createTextNode(kw),
                (() => {
                    const btn = el('button', { class: 'eb-keyword-remove', title: 'Remove' });
                    // Clone the removeIcon SVG for each tag
                    const iconClone = svgIcon(10, 10, [
                        { d: 'M18 6L6 18M6 6l12 12', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round' },
                    ]);
                    btn.appendChild(iconClone);
                    btn.addEventListener('click', () => {
                        const s = getState();
                        const updated = s.keywords.filter(k => k.toUpperCase() !== kw.toUpperCase());
                        renderKeywords(updated);
                        onKeywordsChanged(updated);
                    });
                    return btn;
                })()
            );
            keywordList.appendChild(tag);
        });
    }

    function addKeyword() {
        const raw = keywordInput.value.trim().toUpperCase();
        if (!raw) return;
        const s = getState();
        const current = s.keywords.map(k => k.toUpperCase());
        if (current.includes(raw)) {
            showStatus(`"${raw}" ${t('alreadyPresent')}`, 'error');
            return;
        }
        const updated = [...s.keywords, raw];
        renderKeywords(updated);
        onKeywordsChanged(updated);
        keywordInput.value = '';
        showStatus(t('saved'), 'success');
    }

    // ---- Initial state ----
    const initial = getState();
    enabledInput.checked = initial.enabled;
    filterKeywordsInput.checked = initial.filterKeywords;
    filterAdsInput.checked = initial.filterAds;
    loggingInput.checked = initial.logging;
    sessionKeywordsEl.textContent = initial.sessionKeywords;
    totalKeywordsEl.textContent = initial.totalKeywords;
    sessionAdsEl.textContent = initial.sessionAds;
    totalAdsEl.textContent = initial.totalAds;
    updateDisabledState(initial.enabled);
    renderKeywords(initial.keywords || []);

    // ---- Events ----
    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!host.contains(e.target)) {
            panel.classList.remove('open');
        }
    });

    enabledInput.addEventListener('change', () => {
        updateDisabledState(enabledInput.checked);
        onToggleEnabled(enabledInput.checked);
    });

    filterKeywordsInput.addEventListener('change', () => {
        onToggleFilterKeywords(filterKeywordsInput.checked);
    });

    filterAdsInput.addEventListener('change', () => {
        onToggleFilterAds(filterAdsInput.checked);
    });

    loggingInput.addEventListener('change', () => {
        onToggleLogging(loggingInput.checked);
    });

    resetCountersBtn.addEventListener('click', () => {
        onResetCounters();
    });

    keywordAddBtn.addEventListener('click', () => {
        addKeyword();
    });

    keywordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addKeyword();
    });

    keywordResetBtn.addEventListener('click', () => {
        const defaults = CONFIG.DEFAULT_KEYWORDS;
        renderKeywords(defaults);
        onKeywordsChanged(defaults);
        showStatus(t('saved'), 'success');
    });

    scanBtn.addEventListener('click', () => {
        onScan();
        showStatus(t('scanning'), 'success');
    });

    // Append to page
    document.body.appendChild(host);

    // ---- Public API ----
    return {
        updateCounters({ sessionKeywords, sessionAds, totalKeywords, totalAds }) {
            sessionKeywordsEl.textContent = sessionKeywords;
            totalKeywordsEl.textContent = totalKeywords;
            sessionAdsEl.textContent = sessionAds;
            totalAdsEl.textContent = totalAds;
            const sessionTotal = sessionKeywords + sessionAds;
            badge.textContent = sessionTotal;
            badge.classList.toggle('visible', sessionTotal > 0);
        },
        updateKeywords(keywords) {
            renderKeywords(keywords);
        },
        show() {
            host.style.display = '';
        },
        hide() {
            host.style.display = 'none';
            panel.classList.remove('open');
        },
        destroy() {
            host.remove();
        }
    };
}
