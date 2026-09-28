'use strict';

const { expect } = require('chai');
const { dataPointId, switchSelection, sourceNotificationRequired, tvConfigs, tvDeviceDiff } = require('../lib/source-config');

describe('Per-TV source configuration', () => {
    it('keeps legacy adapter settings during migration', () => {
        expect(tvConfigs({ tvcount: 2, source: 'iptv-epg', country: 'AT' })).to.deep.equal([
            { tv: 'tv1', name: 'TV 1', source: 'iptv-epg', country: 'AT' },
            { tv: 'tv2', name: 'TV 2', source: 'iptv-epg', country: 'AT' },
        ]);
    });

    it('maps every configured TV to its own source and country', () => {
        expect(
            tvConfigs({
                tvconfigs: [
                    { name: 'Living room', source: 'tvfueralle', country: 'DE' },
                    { name: 'Austria', source: 'iptv-epg', country: 'AT' },
                ],
            }),
        ).to.deep.equal([
            { tv: 'tv1', name: 'Living room', source: 'tvfueralle', country: 'DE' },
            { tv: 'tv2', name: 'Austria', source: 'iptv-epg', country: 'AT' },
        ]);
    });

    it('uses persistent data point IDs independently of the row order', () => {
        const config = {
            tvconfigs: [
                { datapoint: 'wohnzimmersued', name: 'Wohnzimmer Süd' },
                { datapoint: 'schlafzimmer', name: 'Schlafzimmer' },
            ],
        };
        expect(tvConfigs(config).map(entry => entry.tv)).to.deep.equal(['wohnzimmersued', 'schlafzimmer']);
        expect(tvConfigs({ tvconfigs: config.tvconfigs.reverse() }).map(entry => entry.tv)).to.deep.equal([
            'schlafzimmer',
            'wohnzimmersued',
        ]);
    });

    it('creates simple data point IDs from user-facing names', () => {
        expect(dataPointId(' TV Wohnzimmer Süd ')).to.equal('tvwohnzimmersued');
        expect(dataPointId('Étage 2 / links')).to.equal('etage2links');
        expect(dataPointId('---', 'tv3')).to.equal('tv3');
    });

    it('stores and restores selections by source identity', () => {
        const changed = switchSelection('iptv-epg:DE', 'iptv-epg:AT', [1, 2], { 'iptv-epg:AT': [8, 9] });
        expect(changed.selections['iptv-epg:DE']).to.deep.equal([1, 2]);
        expect(changed.selected).to.deep.equal([8, 9]);

        const restored = switchSelection('iptv-epg:AT', 'iptv-epg:DE', [8, 9], changed.selections);
        expect(restored.selected).to.deep.equal([1, 2]);
    });

    it('selects defaults only when a source has no saved channel selection', () => {
        const defaults = switchSelection('tvfueralle', 'iptv-epg:CH', [1, 2], {}, [10, 20, 30, 40]);
        expect(defaults.selected).to.deep.equal([10, 20, 30, 40]);

        const explicitEmpty = switchSelection(
            'tvfueralle',
            'iptv-epg:CH',
            [1, 2],
            { 'iptv-epg:CH': ['__none__'] },
            [10, 20, 30, 40],
        );
        expect(explicitEmpty.selected).to.deep.equal(['__none__']);
    });

    it('replaces an uninitialized empty selection with defaults', () => {
        const initialized = switchSelection('', 'iptv-epg:CH', [], {}, [10, 20, 30, 40]);
        expect(initialized.selected).to.deep.equal([10, 20, 30, 40]);
        expect(initialized.changed).to.equal(true);
    });

    it('notifies widgets once after every adapter start', () => {
        expect(sourceNotificationRequired('iptv-epg:CH', 'iptv-epg:CH', undefined)).to.equal(true);
        expect(sourceNotificationRequired('iptv-epg:AT', 'iptv-epg:CH', 'iptv-epg:AT')).to.equal(true);
        expect(sourceNotificationRequired('iptv-epg:CH', 'iptv-epg:CH', 'iptv-epg:CH')).to.equal(false);
    });

    it('finds missing and obsolete persistent TV device keys', () => {
        const configured = tvConfigs({
            tvconfigs: [
                { datapoint: 'livingroom', name: 'Living room' },
                { datapoint: 'bedroom', name: 'Bedroom' },
            ],
        });

        expect(tvDeviceDiff(configured, ['tv1', 'bedroom'])).to.deep.equal({
            desired: ['livingroom', 'bedroom'],
            missing: ['livingroom'],
            obsolete: ['tv1'],
        });
    });
});
