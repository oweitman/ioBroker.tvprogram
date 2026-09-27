'use strict';

const { expect } = require('chai');
const { filterProgramByChannels } = require('../lib/program-filter');

describe('Programme channel filtering', () => {
    const program = [
        { id: 1, channel: 10 },
        { id: 2, channel: 20 },
        { id: 3, channel: 30 },
    ];

    it('returns only explicitly selected channels', () => {
        expect(filterProgramByChannels(program, [30, '10'])).to.deep.equal([
            { id: 1, channel: 10 },
            { id: 3, channel: 30 },
        ]);
    });

    it('keeps legacy requests without a channel filter compatible', () => {
        expect(filterProgramByChannels(program)).to.equal(program);
    });

    it('returns no programmes for an explicitly empty selection', () => {
        expect(filterProgramByChannels(program, [])).to.deep.equal([]);
    });
});
