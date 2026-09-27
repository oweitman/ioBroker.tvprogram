'use strict';

const { expect } = require('chai');

describe('Widget data requests', () => {
    it('sends the selected channels with a programme day request', async () => {
        const shared = (await import('../widgets/tvprogram/js/shared.js')).default;
        const originalSendToAsync = shared.sendToAsync;
        let request;
        shared.sendToAsync = async (instance, command, message) => {
            request = { instance, command, message };
            return [];
        };

        try {
            await shared.loadProgram('tvprogram.0', 'widget1', '2026-09-27', [10, 20]);
            expect(request).to.deep.equal({
                instance: 'tvprogram.0',
                command: 'getServerTVProgram',
                message: { date: '2026-09-27', channelfilter: [10, 20] },
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
            await shared.getFavoritesDataAsync('tvprogram.0', ['News'], ['10']);
            expect(request).to.deep.equal({
                instance: 'tvprogram.0',
                command: 'getFavoritesData',
                message: { favorites: ['News'], channelfilter: ['10'] },
            });
        } finally {
            shared.sendToAsync = originalSendToAsync;
        }
    });
});
