'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');

describe('Admin source translations', () => {
    it('uses the same complete and valid key set in every language', () => {
        const languages = Object.keys(require('../io-package.json').common.titleLang);
        const english = JSON.parse(fs.readFileSync(path.join(__dirname, '../admin/i18n/en.json'), 'utf8'));
        const expectedKeys = Object.keys(english).sort();

        for (const language of languages) {
            const file = path.join(__dirname, `../admin/i18n/${language}.json`);
            const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
            expect(Object.keys(translations).sort(), `${language}: translation keys`).to.deep.equal(expectedKeys);
            for (const [key, value] of Object.entries(translations)) {
                expect(value, `${language}: ${key}`).to.be.a('string').and.not.empty;
                expect(value, `${language}: ${key}`).not.to.match(/[?�]|Ã|Â|â€|ï¿½/);
            }
        }
    });

    it('covers every configured language and IPTV-EPG country', () => {
        const languages = Object.keys(require('../io-package.json').common.titleLang);
        const config = require('../admin/jsonConfig.json');
        const labels = [
            config.items.mainTab.label,
            config.items.mainTab.items.tvconfigs.label,
            ...config.items.mainTab.items.tvconfigs.items.map(item => item.title),
            config.items.mainTab.items.loadTime.label,
            ...config.items.mainTab.items.tvconfigs.items
                .flatMap(item => item.options || [])
                .map(option => option.label),
            ...config.items.mainTab.items.tvconfigs.items
                .map(item => item.validatorErrorText)
                .filter(Boolean),
        ];
        for (const language of languages) {
            const file = path.join(__dirname, `../admin/i18n/${language}.json`);
            const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
            for (const label of labels) {
                expect(translations[label], `${language}: ${label}`).to.be.a('string').and.not.empty;
            }
        }
    });

    it('uses responsive cards and source-dependent country selection', () => {
        const config = require('../admin/jsonConfig.json');
        const table = config.items.mainTab.items.tvconfigs;
        const datapoint = table.items[0];
        const country = table.items.find(item => item.attr === 'country');

        expect(table.useCardFor).to.include.members(['xs', 'sm']);
        expect(table.uniqueColumns).to.deep.equal(['name']);
        expect(table.titleAttribute).to.equal('datapoint');
        expect(table.items.every(item => item.title && !item.label)).to.equal(true);
        expect(datapoint).to.include({ attr: 'datapoint', readOnly: true });
        expect(datapoint).not.to.have.property('hidden');
        expect(datapoint.defaultFunc).to.equal("''");
        expect(datapoint.onChange.alsoDependsOn).to.deep.equal(['name']);
        expect(datapoint.onChange.calculateFunc).to.include("data.datapoint || String(data.name || '')");
        expect(country.hidden).to.equal("data.source !== 'iptv-epg'");

        const calculate = new Function('data', `return ${datapoint.onChange.calculateFunc}`);
        expect(calculate({ datapoint: '', name: 'Wohnzimmer Süd' })).to.equal('wohnzimmersued');
        expect(calculate({ datapoint: 'wohnzimmer', name: 'Neuer Name' })).to.equal('wohnzimmer');
    });
});
