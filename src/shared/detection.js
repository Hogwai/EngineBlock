import { CONFIG } from './config.js';

export function detectCard(card, keywords) {
    const subtitle = card.querySelector(CONFIG.SELECTORS.SUBTITLE);
    if (!subtitle) return { matched: false, text: '' };

    const text = subtitle.textContent.trim().toUpperCase();
    const matched = keywords.some(kw => text.includes(kw.toUpperCase()));
    return { matched, text };
}

export function getUnscannedCards(root = document) {
    const selector = `${CONFIG.SELECTORS.CARD}:not([${CONFIG.ATTRIBUTES.SCANNED}])`;
    return Array.from(root.querySelectorAll(selector));
}
