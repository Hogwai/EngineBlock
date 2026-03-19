export const SETTINGS_KEYS = {
    ENABLED: 'enabled',
    KEYWORDS: 'keywords',
    FILTER_KEYWORDS: 'filterKeywords',
    FILTER_ADS: 'filterAds',
    LOGGING: 'logging',
    INSTALL_DATE: 'installDate',
    REVIEW_DISMISSED: 'reviewDismissed',
    MIGRATED: 'migrated'
};

export const DEFAULT_SETTINGS = {
    [SETTINGS_KEYS.ENABLED]: true,
    [SETTINGS_KEYS.KEYWORDS]: ['PURETECH', 'VTI', 'THP'],
    [SETTINGS_KEYS.FILTER_KEYWORDS]: true,
    [SETTINGS_KEYS.FILTER_ADS]: true,
    [SETTINGS_KEYS.LOGGING]: false,
    [SETTINGS_KEYS.INSTALL_DATE]: null,
    [SETTINGS_KEYS.REVIEW_DISMISSED]: false,
    [SETTINGS_KEYS.MIGRATED]: false
};

export const LANGUAGES = { EN: 'en', FR: 'fr' };

export function detectLanguage() {
    const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return lang === 'fr' ? LANGUAGES.FR : LANGUAGES.EN;
}

export function getSetting(settings, key) {
    return settings[key] !== undefined ? settings[key] : DEFAULT_SETTINGS[key];
}

export function mergeSettings(partial) {
    return { ...DEFAULT_SETTINGS, ...partial };
}
