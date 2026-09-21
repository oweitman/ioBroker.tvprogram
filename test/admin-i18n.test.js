'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');

describe('Admin source translations', () => {
    it('covers every configured language and IPTV-EPG country', () => {
        const languages = Object.keys(require('../io-package.json').common.titleLang);
        const config = require('../admin/jsonConfig.json');
        const labels = [
            config.items.mainTab.items.source.label,
            config.items.mainTab.items.country.label,
            config.items.mainTab.items.loadTime.label,
            ...config.items.mainTab.items.source.options.map(option => option.label),
            ...config.items.mainTab.items.country.options.map(option => option.label),
        ];
        for (const language of languages) {
            const file = path.join(__dirname, `../admin/i18n/${language}.json`);
            const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
            for (const label of labels) {
                expect(translations[label], `${language}: ${label}`).to.be.a('string').and.not.empty;
            }
        }
    });
});
