export const CONFIG = {
    SELECTORS: {
        CARD: '.searchCard',
        SUBTITLE: 'div[class*="vehiclecardV2_subTitle__"]',
        ADS: [
            '.lcui-AdPlaceholder',
            '#pavePubDesktop',
            '.appNexusPlaceholder',
            '#pavePubGallery',
            'div.advertising-container'
        ],
        FEED_WRAPPER: 'div[class*="searchResults"]'
    },
    ATTRIBUTES: {
        SCANNED: 'data-eb-scanned'
    },
    DEFAULT_KEYWORDS: ['PURETECH', 'VTI', 'THP'],
    REMOTE_CONFIG_URL: 'https://raw.githubusercontent.com/Hogwai/EngineBlock/main/remote-config.json',
    DELAYS: {
        DEBOUNCE: 200,
        NOTIFICATION_THROTTLE: 300,
        WRAPPER_RETRY: 200,
        MAX_WRAPPER_RETRIES: 15
    },
    REVIEW: {
        CHROME_URL: '',
        FIREFOX_URL: 'https://addons.mozilla.org/fr/firefox/addon/engineblock/',
        DAYS_BEFORE_REVIEW: 7
    }
};

export function mergeRemoteSelectors(remoteSelectors) {
    if (remoteSelectors.card) CONFIG.SELECTORS.CARD = remoteSelectors.card;
    if (remoteSelectors.subtitle) CONFIG.SELECTORS.SUBTITLE = remoteSelectors.subtitle;
    if (remoteSelectors.feedWrapper) CONFIG.SELECTORS.FEED_WRAPPER = remoteSelectors.feedWrapper;
    if (Array.isArray(remoteSelectors.ads)) CONFIG.SELECTORS.ADS = remoteSelectors.ads;
}
