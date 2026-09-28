'use strict';

const { expect } = require('chai');

describe('TV control widget', () => {
    it('invalidates an active load when its programme source changes', async () => {
        const control = (await import('../widgets/tvprogram/js/control.js')).default;
        const originalCreateWidget = control.createWidget;
        const invalidated = [];
        control.sourceRevision = { 'tvprogram.0.tv1': 2 };
        control.programdata = { 'tvprogram.0.tv1': { widget1: [{ events: [] }] } };
        control.visTvprogram = {
            invalidateSourceData: oid => invalidated.push(oid),
        };
        let reloads = 0;
        control.createWidget = () => {
            reloads++;
        };

        try {
            control.onChange(
                'widget1',
                'view1',
                {},
                {},
                'tvprogram.0.tv1',
                { type: 'tvprogram.0.tv1.cmd.val' },
                'new|source|iptv-epg:at',
            );

            expect(control.sourceRevision['tvprogram.0.tv1']).to.equal(3);
            expect(control.programdata).not.to.have.property('tvprogram.0.tv1');
            expect(invalidated).to.deep.equal(['tvprogram.0.tv1']);
            expect(reloads).to.equal(1);
        } finally {
            control.createWidget = originalCreateWidget;
        }
    });

    for (const widgetName of ['search', 'favorites']) {
        it(`invalidates an active ${widgetName} load when its programme source changes`, async () => {
            const widget = (await import(`../widgets/tvprogram/js/${widgetName}.js`)).default;
            const originalCreateWidget = widget.createWidget;
            const oid = 'tvprogram.0.tv1';
            const invalidated = [];
            widget.sourceRevision = { [oid]: 1 };
            widget.visTvprogram = {
                invalidateSourceData: value => invalidated.push(value),
            };
            if (widgetName === 'search') {
                widget.searchdata = { [oid]: { widget1: {} } };
                widget.searchresult = { [oid]: { widget1: [] } };
            }
            let reloads = 0;
            widget.createWidget = () => {
                reloads++;
            };

            try {
                widget.onChange('widget1', 'view1', {}, {}, oid, { type: `${oid}.cmd.val` }, 'new|source|iptv-epg:ch');

                expect(widget.sourceRevision[oid]).to.equal(2);
                expect(invalidated).to.deep.equal([oid]);
                expect(reloads).to.equal(1);
                if (widgetName === 'search') {
                    expect(widget.searchdata).not.to.have.property(oid);
                    expect(widget.searchresult).not.to.have.property(oid);
                }
            } finally {
                widget.createWidget = originalCreateWidget;
            }
        });
    }
});
