'use strict';

const { expect } = require('chai');

describe('Favorites widget', () => {
    it('loads its channels and refreshes favorite broadcasts', async () => {
        const widget = (await import('../widgets/tvprogram/js/favorites.js')).default;
        const originalVis = global.vis;
        const originalJQuery = global.$;
        let markup = '';
        let requests = 0;
        const now = Date.now();
        const event = title => ({
            id: requests,
            title,
            channel: 1,
            viewdate: '2026-09-22',
            startTime: new Date(now + 60_000).toISOString(),
            endTime: new Date(now + 3_600_000).toISOString(),
        });
        const fakeJQuery = {
            0: { style: { cssText: '' } },
            length: 1,
            css: () => fakeJQuery,
            html: value => {
                markup = value;
            },
        };
        global.$ = () => fakeJQuery;
        global.vis = {
            editMode: true,
            language: 'en',
            binds: {
                tvprogram: {
                    getTvprogramId: () => 'tvprogram.0.tv1',
                    getInstance: () => 'tvprogram.0',
                    realBackgroundColor: () => '#fff',
                    checkStyle: () => '',
                    getConfigFavorites: () => ['News'],
                    channels: null,
                    loadChannels: async () => [{ id: 1, channelId: 'test', name: 'Test' }],
                    getFavoritesDataAsync: async () => [event(++requests === 1 ? 'First' : 'Updated')],
                    getChannelLogo: () => '/test.png',
                    compareDate: () => false,
                },
            },
        };
        try {
            await widget.createWidget('fav1', '', { tvprogram_oid: 'tvprogram.0.tv1' }, {});
            expect(markup).to.include('First');
            expect(markup).to.include('/test.png');
            await widget.createWidget('fav1', '', { tvprogram_oid: 'tvprogram.0.tv1' }, {});
            expect(markup).to.include('Updated');
            expect(markup).not.to.include('First');
            expect(requests).to.equal(2);
        } finally {
            clearTimeout(widget.timer.fav1);
            delete widget.timer.fav1;
            global.vis = originalVis;
            global.$ = originalJQuery;
        }
    });

    it('filters favorites by the saved channel selection when enabled', async () => {
        const widget = (await import('../widgets/tvprogram/js/favorites.js')).default;
        const originalVis = global.vis;
        const originalJQuery = global.$;
        const now = Date.now();
        let markup = '';
        let selection = [2];
        let boundStates;
        const events = [1, 2, 3, 4, 5].map(channel => ({
            id: channel,
            title: `Channel ${channel}`,
            channel,
            viewdate: '2026-09-22',
            startTime: new Date(now + 60_000).toISOString(),
            endTime: new Date(now + 3_600_000).toISOString(),
        }));
        const fakeJQuery = {
            0: { style: { cssText: '' } },
            length: 1,
            css: () => fakeJQuery,
            html: value => {
                markup = value;
            },
        };
        global.$ = () => fakeJQuery;
        global.vis = {
            editMode: false,
            language: 'en',
            binds: {
                tvprogram: {
                    getTvprogramId: () => 'tvprogram.0.tv1',
                    getInstance: () => 'tvprogram.0',
                    realBackgroundColor: () => '#fff',
                    checkStyle: () => '',
                    bindStates: (_div, states) => {
                        boundStates = states;
                    },
                    getConfigFavorites: () => ['News'],
                    getConfigChannelfilter: () => selection,
                    channels: events.map(event => ({ id: event.channel })),
                    getFavoritesDataAsync: async () => events,
                    getChannelLogo: () => '',
                    compareDate: () => false,
                },
            },
        };
        const data = { tvprogram_oid: 'tvprogram.0.tv1', tvprogram_favorites_selectedchannels: true };
        try {
            await widget.createWidget('favSelected', '', data, {});
            expect(boundStates).to.include('tvprogram.0.tv1.channelfilter');
            expect(markup).to.include('Channel 2');
            expect(markup).not.to.include('Channel 1');

            selection = [];
            await widget.createWidget('favSelected', '', data, {});
            expect(markup).to.include('Channel 4');
            expect(markup).not.to.include('Channel 5');

            selection = ['__none__'];
            await widget.createWidget('favSelected', '', data, {});
            expect(markup).not.to.include('Channel 2');

            await widget.createWidget('favSelected', '', { ...data, tvprogram_favorites_selectedchannels: false }, {});
            expect(markup).to.include('Channel 5');
        } finally {
            clearTimeout(widget.timer.favSelected);
            delete widget.timer.favSelected;
            delete widget.bound['tvprogram.0.tv1'].favSelected;
            global.vis = originalVis;
            global.$ = originalJQuery;
        }
    });
});
