(function () {
    'use strict';
    // #region browser api
    const extAPI = typeof browser !== 'undefined' && browser.storage ? browser : null;
    const storageAPI = {
        get: (keys, callback) => {
            if (!extAPI) return callback(typeof keys === 'string' ? {} : Array.isArray(keys) ? {} : {});
            extAPI.storage.sync.get(keys, callback);
        },
        set: (items, callback = () => { }) => {
            if (!extAPI) return;
            extAPI.storage.sync.set(items, callback);
        },
        onChanged: extAPI?.storage.onChanged,
    };
    // #endregion

    // #region variables
    const AD_SELECTORS = [
        '.lcui-AdPlaceholder',
        '#pavePubDesktop',
        '.appNexusPlaceholder',
        '#pavePubGallery',
        'div.advertising-container'
    ];


    let currentKeywords = ['PURETECH', 'VTI', 'THP'];
    // #endregion

    // #region utility methods
    function loadKeywordsFromStorage() {
        storageAPI.get(['keywords'], (result) => {
            if (result.keywords && Array.isArray(result.keywords)) {
                currentKeywords = result.keywords.map(k => k.toUpperCase());
            }
        });
    }

    function scanAndClean() {
        let removedCount = 0;

        const adContainers = document.querySelectorAll(AD_SELECTORS.join(', '));
        adContainers.forEach(ad => {
            ad.remove();
            console.debug(`[EngineBlock] Ad removed: ${ad.className || ad.id}`);
        });

        const vehicleCards = document.querySelectorAll('.searchCard:not([data-ptb-processed])');
        vehicleCards.forEach(card => {
            card.setAttribute('data-ptb-processed', 'true');

            const subTitle = card.querySelector('div[class*="vehiclecardV2_subTitle__"]');
            if (subTitle) {
                const textContent = subTitle.textContent.trim().toUpperCase();
                if (currentKeywords.some(keyword => textContent.includes(keyword))) {
                    card.remove();
                    removedCount++;
                    console.debug(`[EngineBlock] Card removed: ${textContent.trim()}`);
                }
            }
        });

        if (removedCount > 0) {
            console.debug(`[EngineBlock] ${removedCount} éléments supprimés.`);
        }
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const debouncedScanAndClean = debounce(scanAndClean, 300);
    // #endregion

    const observer = new MutationObserver((mutations) => {
        const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
        if (hasAddedNodes) {
            debouncedScanAndClean();
        }
    });

    const observerConfig = { childList: true, subtree: true };
    observer.observe(document.body, observerConfig);

    loadKeywordsFromStorage();

    // #region listeners
    storageAPI.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.keywords) {
            currentKeywords = (changes.keywords.newValue || []).map(k => k.toUpperCase());
            debouncedScanAndClean();
        }
    });
    // #endregion
})();