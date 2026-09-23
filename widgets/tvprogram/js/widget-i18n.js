import translations from '../myi18n/translations.json' with { type: 'json' };

/**
 * Resolve a widget translation in the requested VIS language.
 *
 * @param {string} key Translation key.
 * @param {string} language VIS language.
 * @returns {string} Translated text or the English fallback.
 */
export function translateWidget(key, language) {
    const values = translations[key] || {};
    const normalized = String(language || 'en').toLowerCase();
    const base = normalized.split('-')[0];
    return values[normalized] || values[base] || values.en || key;
}

export { translations as widgetTranslations };
