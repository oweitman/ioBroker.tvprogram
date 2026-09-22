'use strict';

const { expect } = require('chai');

describe('Timetable channel selection', () => {
    const channels = [
        { id: 1, name: 'ZDF', channelId: 'ZDF.de', order: 2 },
        { id: 2, name: 'Das Erste', channelId: 'DasErste.de', order: 1 },
        { id: 3, name: '3sat', channelId: '3sat.de', order: 3 },
        { id: 4, name: 'Arte', channelId: 'Arte.de', order: 4 },
    ];

    it('keeps selected order and sorts only inactive channels', async () => {
        const { selectedOrder, inactiveOrder, nativeOrder } = await import('../widgets/tvprogram/js/channel-selection-model.js');
        expect(selectedOrder(channels, [3, 1]).map(channel => channel.id)).to.deep.equal([3, 1]);
        expect(selectedOrder(channels, [999, 2]).map(channel => channel.id)).to.deep.equal([2]);
        expect(inactiveOrder(channels, [3, 1], 'native').map(channel => channel.id)).to.deep.equal([2, 4]);
        expect(inactiveOrder(channels, [3, 1], 'asc').map(channel => channel.id)).to.deep.equal([4, 2]);
        expect(inactiveOrder(channels, [3, 1], 'desc').map(channel => channel.id)).to.deep.equal([2, 4]);
        expect(channels.map(channel => channel.id)).to.deep.equal([1, 2, 3, 4]);
        expect(nativeOrder(channels).map(channel => channel.id)).to.deep.equal([2, 1, 3, 4]);
    });

    it('filters names and IDs without changing the selection', async () => {
        const { matchingChannels, selectedOrder } = await import('../widgets/tvprogram/js/channel-selection-model.js');
        expect(matchingChannels(channels, 'zdf').map(channel => channel.id)).to.deep.equal([1]);
        expect(matchingChannels(channels, ' daserste.de ').map(channel => channel.id)).to.deep.equal([2]);
        expect(selectedOrder(channels, [3, 1]).map(channel => channel.id)).to.deep.equal([3, 1]);
    });

    it('keeps an explicitly empty selection distinct from the default', async () => {
        const { persistedSelection, selectedOrder } = await import('../widgets/tvprogram/js/channel-selection-model.js');
        expect(persistedSelection([])).to.deep.equal(['__none__']);
        expect(selectedOrder(channels, persistedSelection([]))).to.deep.equal([]);
        expect(persistedSelection([3, 1])).to.deep.equal([3, 1]);
    });

    it('preserves readable theme colors and corrects low contrast', async () => {
        const { dialogTheme } = await import('../widgets/tvprogram/js/channel-selection-model.js');
        expect(dialogTheme('rgb(255, 255, 255)', 'rgb(0, 0, 0)').foreground).to.equal('rgb(255, 255, 255)');
        expect(dialogTheme('rgb(255, 255, 255)', 'rgb(255, 255, 255)').foreground).to.equal('#111111');
        expect(dialogTheme('rgb(0, 0, 0)', 'rgb(0, 0, 0)').foreground).to.equal('#ffffff');
    });
});
