'use strict';

const { expect } = require('chai');

describe('Search widget logos', () => {
    it('refreshes the result view when the alternative logo path changes', async () => {
        const search = (await import('../widgets/tvprogram/js/search.js')).default;
        const originalCreateWidget = search.createWidget;
        let refreshes = 0;
        search.createWidget = () => {
            refreshes++;
        };
        try {
            search.onChange(
                'widget1',
                '',
                {},
                {},
                'tvprogram.0.tv1',
                { type: 'tvprogram.0.tv1.optchnlogopath.val' },
                '/vis.0/icons/tvlogos/',
            );
            expect(refreshes).to.equal(1);
        } finally {
            search.createWidget = originalCreateWidget;
        }
    });
});
