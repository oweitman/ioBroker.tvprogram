'use strict';

const { expect } = require('chai');

describe('Widget data requests', () => {
    it('reports failed server responses in the browser console', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        const originalVis = global.vis;
        const originalError = console.error;
        const messages = [];
        global.vis = { conn: { sendTo: (_instance, _command, _data, callback) => callback('error') } };
        console.error = (...args) => messages.push(args);

        try {
            expect(await shared.sendToAsync('tvprogram.0', 'getServerData', { dataname: 'channels' })).to.equal(
                'error',
            );
            expect(messages[0][0]).to.include(
                '[tvprogram] Data request failed: tvprogram.0 | getServerData | channels',
            );
        } finally {
            global.vis = originalVis;
            console.error = originalError;
        }
    });

    it('reports and rejects timed out server requests', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        const originalVis = global.vis;
        const originalError = console.error;
        const originalTimeout = shared.requestTimeoutMs;
        const messages = [];
        global.vis = { conn: { sendTo: () => undefined } };
        console.error = (...args) => messages.push(args);
        shared.requestTimeoutMs = 5;

        try {
            let error;
            try {
                await shared.sendToAsync('tvprogram.0', 'getServerTVProgram', {
                    date: '2026-09-28',
                    tvprogram_oid: 'tvprogram.0.tv2',
                });
            } catch (caught) {
                error = caught;
            }
            expect(error).to.be.instanceOf(Error);
            expect(error.message).to.include('timed out');
            expect(messages[0][0]).to.include(
                '[tvprogram] Data request timeout: tvprogram.0 | getServerTVProgram | tvprogram.0.tv2 | 2026-09-28',
            );
        } finally {
            shared.requestTimeoutMs = originalTimeout;
            global.vis = originalVis;
            console.error = originalError;
        }
    });

    it('invalidates only the metadata cache of the changed TV source', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        shared.sourceData = {
            'tvprogram.0.tv1': { channels: [{ id: 1 }], categories: ['News'], genres: ['News'], infos: {} },
            'tvprogram.0.tv2': { channels: [{ id: 2 }] },
        };
        shared.useSourceData('tvprogram.0.tv1');

        shared.invalidateSourceData('tvprogram.0.tv1');

        expect(shared.sourceData).not.to.have.property('tvprogram.0.tv1');
        expect(shared.sourceData).to.have.property('tvprogram.0.tv2');
        expect(shared.channels).to.equal(undefined);
        expect(shared.categories).to.equal(undefined);
        expect(shared.genres).to.equal(undefined);
        expect(shared.infos).to.equal(undefined);
    });

    it('invalidates a source command only once across multiple widgets', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        shared.sourceData = {
            'tvprogram.0.tv1': { sourceIdentity: 'iptv-epg:CH', channels: [{ id: 1 }] },
        };
        shared.sourceRevisions = {};

        expect(shared.invalidateSourceData('tvprogram.0.tv1', 'iptv-epg:AT')).to.equal(true);
        shared.sourceData['tvprogram.0.tv1'].channels = [{ id: 2 }];
        expect(shared.invalidateSourceData('tvprogram.0.tv1', 'iptv-epg:AT')).to.equal(false);

        expect(shared.sourceData['tvprogram.0.tv1']).to.deep.equal({
            sourceIdentity: 'iptv-epg:AT',
            sourceRevision: 'iptv-epg:AT',
            channels: [{ id: 2 }],
        });
    });

    it('invalidates the same source again for a new adapter revision', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        shared.sourceData = {
            'tvprogram.0.tv2': {
                sourceIdentity: 'iptv-epg:CH',
                sourceRevision: 'old-process:tv2:iptv-epg:CH',
                channels: [{ id: 1, name: 'stale channel' }],
            },
        };
        shared.sourceRevisions = { 'tvprogram.0.tv2': 'old-process:tv2:iptv-epg:CH' };

        expect(
            shared.invalidateSourceData('tvprogram.0.tv2', 'iptv-epg:CH', 'new-process:tv2:iptv-epg:CH'),
        ).to.equal(true);
        expect(shared.sourceData['tvprogram.0.tv2']).to.deep.equal({
            sourceIdentity: 'iptv-epg:CH',
            sourceRevision: 'new-process:tv2:iptv-epg:CH',
        });
        expect(
            shared.invalidateSourceData('tvprogram.0.tv2', 'iptv-epg:CH', 'new-process:tv2:iptv-epg:CH'),
        ).to.equal(false);
    });

    it('sends the selected channels with a programme day request', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        const originalSendToAsync = shared.sendToAsync;
        let request;
        shared.sendToAsync = async (instance, command, message) => {
            request = { instance, command, message };
            return [];
        };

        try {
            await shared.loadProgram('tvprogram.0', 'widget1', '2026-09-27', [10, 20], 'tvprogram.0.tv2');
            expect(request).to.deep.equal({
                instance: 'tvprogram.0',
                command: 'getServerTVProgram',
                message: {
                    date: '2026-09-27',
                    channelfilter: [10, 20],
                    tvprogram_oid: 'tvprogram.0.tv2',
                },
            });
        } finally {
            shared.sendToAsync = originalSendToAsync;
        }
    });

    it('sends a channel filter for selected-channel favorites', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        const originalSendToAsync = shared.sendToAsync;
        let request;
        shared.sendToAsync = async (instance, command, message) => {
            request = { instance, command, message };
            return [];
        };

        try {
            await shared.getFavoritesDataAsync('tvprogram.0', ['News'], ['10'], 'tvprogram.0.tv2');
            expect(request).to.deep.equal({
                instance: 'tvprogram.0',
                command: 'getFavoritesData',
                message: { favorites: ['News'], channelfilter: ['10'], tvprogram_oid: 'tvprogram.0.tv2' },
            });
        } finally {
            shared.sendToAsync = originalSendToAsync;
        }
    });
});
