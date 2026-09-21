'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('TV für alle provider', () => {
    const load = get =>
        proxyquire('../lib/tvfueralle', {
            axios: { default: { create: () => ({ get }) } },
            'node:https': { Agent: class {} },
        });

    it('uses the correct API endpoints with certificate validation by default', async () => {
        const requests = [];
        const provider = load(async (url, options) => {
            requests.push({ url, options });
            return { data: {} };
        });
        await provider.getCategories();
        await provider.getChannels();
        await provider.getGenres();
        await provider.getProgram('2026-09-22');
        expect(requests.map(request => request.url)).to.deep.equal([
            'https://tvfueralle.de/api/categories',
            'https://tvfueralle.de/api/channels',
            'https://tvfueralle.de/api/genres',
            'https://tvfueralle.de/api/broadcasts/2026-09-22',
        ]);
        expect(requests.every(request => request.options === undefined)).to.equal(true);
    });

    it('retries an expired certificate only for this provider', async () => {
        const options = [];
        const provider = load(async (_url, option) => {
            options.push(option);
            if (!option) {
                throw Object.assign(new Error('expired'), { code: 'CERT_HAS_EXPIRED' });
            }
            return { data: { channels: [] } };
        });
        await provider.getChannels();
        expect(options).to.have.length(2);
        expect(options[1].httpsAgent).to.exist;
    });

    it('does not retry unrelated TLS failures', async () => {
        let calls = 0;
        const provider = load(async () => {
            calls++;
            throw Object.assign(new Error('invalid certificate'), { code: 'DEPTH_ZERO_SELF_SIGNED_CERT' });
        });
        try {
            await provider.getChannels();
            throw new Error('Expected rejection');
        } catch (error) {
            expect(error).to.have.property('code', 'DEPTH_ZERO_SELF_SIGNED_CERT');
        }
        expect(calls).to.equal(1);
    });
});
