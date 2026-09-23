'use strict';

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Widget translations bundle', () => {
    const widgetRoot = path.join(__dirname, '..', 'widgets', 'tvprogram');

    it('contains every channel dialog text in every widget language', () => {
        const translations = JSON.parse(fs.readFileSync(path.join(widgetRoot, 'myi18n', 'translations.json'), 'utf8'));
        const languages = Object.keys(translations.tvprogram_oid);
        const names = [
            'title',
            'save',
            'cancel',
            'search',
            'active',
            'inactive',
            'empty',
            'reorder',
            'selected',
            'unselected',
            'sort_native',
            'sort_asc',
            'sort_desc',
            'fullscreen',
            'restore',
        ];

        for (const name of names) {
            const values = translations[`tvprogram_channel_dialog_${name}`];
            expect(values, name).to.be.an('object');
            expect(Object.keys(values).sort(), name).to.deep.equal([...languages].sort());
            expect(Object.values(values).every(Boolean), name).to.equal(true);
        }
    });

    it('bundles translations without a runtime JSON request', () => {
        const source = fs.readFileSync(path.join(widgetRoot, 'js', 'tvprogram.js'), 'utf8');
        const bundle = fs.readFileSync(path.join(widgetRoot, 'dist', 'tvprogram-dist.js'), 'utf8');

        expect(source).not.to.include("fetch('widgets/tvprogram/myi18n/translations.json')");
        expect(bundle).not.to.include('widgets/tvprogram/myi18n/translations.json');
        expect(bundle).to.include('tvprogram_channel_dialog_title');
    });
});
