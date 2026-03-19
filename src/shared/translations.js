const TRANSLATIONS = {
    en: {
        popupTitle: 'EngineBlock',
        keywordsBlocked: 'Keywords blocked',
        adsBlocked: 'Ads blocked',
        session: 'session',
        total: 'total',
        filterKeywords: 'Engine keywords',
        filterAds: 'Ads',
        addKeyword: 'Add',
        keywordPlaceholder: 'e.g. HYBRID, E-208, 1.2L',
        resetDefaults: 'Reset default values',
        scanNow: 'Scan now',
        scanning: 'Scanning...',
        statusReady: 'Ready',
        settingsTitle: 'Settings',
        enabled: 'Extension enabled',
        logging: 'Enable logging',
        resetCounters: 'Reset counters',
        resetCountersConfirm: 'Are you sure?',
        yes: 'Yes',
        no: 'No',
        saved: 'Saved.',
        alreadyPresent: 'already present.',
        madeBy: 'Made by',
        reviewTitle: 'Enjoying EngineBlock?',
        reviewMessage: 'Leave us a review!',
        reviewButton: 'Review',
        dismissReview: 'Dismiss',
        extensionDisabled: 'Extension is disabled',
        support: 'Support',
        githubLink: 'GitHub',
        feedbackLink: 'Feedback'
    },
    fr: {
        popupTitle: 'EngineBlock',
        keywordsBlocked: 'Mots-clés bloqués',
        adsBlocked: 'Pubs bloquées',
        session: 'session',
        total: 'total',
        filterKeywords: 'Mots-clés moteur',
        filterAds: 'Publicités',
        addKeyword: 'Ajouter',
        keywordPlaceholder: 'ex: HYBRID, E-208, 1.2L',
        resetDefaults: 'Valeurs par défaut',
        scanNow: 'Scanner',
        scanning: 'Scan en cours...',
        statusReady: 'Prêt',
        settingsTitle: 'Paramètres',
        enabled: 'Extension activée',
        logging: 'Activer les logs',
        resetCounters: 'Réinitialiser les compteurs',
        resetCountersConfirm: 'Êtes-vous sûr ?',
        yes: 'Oui',
        no: 'Non',
        saved: 'Enregistré.',
        alreadyPresent: 'déjà présent.',
        madeBy: 'Créé par',
        reviewTitle: 'Vous aimez EngineBlock ?',
        reviewMessage: 'Laissez-nous un avis !',
        reviewButton: 'Donner un avis',
        dismissReview: 'Ignorer',
        extensionDisabled: "L'extension est désactivée",
        support: 'Support',
        githubLink: 'GitHub',
        feedbackLink: 'Retour'
    }
};

export function getTranslation(language, key) {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
}

export function createTranslator(language) {
    return (key) => getTranslation(language, key);
}
