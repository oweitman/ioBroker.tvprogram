'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');
const { describe, it } = require('mocha');
const {
    countryCodes,
    sourceIdentity,
    sourceChanged,
    stableId,
    logoName,
    xmltvDate,
    broadcastDay,
    hasUsableGuide,
    nextDownload,
    parseXmltv,
} = require('../lib/epg');

describe('IPTV-EPG normalization', () => {
    it('requires source data for the current broadcast day', () => {
        const now = new Date(2026, 8, 22, 6, 0);
        const guide = {
            channels: [{ id: 1 }],
            categories: [],
            genres: [],
            program: { '2026-09-22': [{ id: 1 }] },
        };
        expect(hasUsableGuide(guide, now)).to.equal(true);
        expect(hasUsableGuide({ ...guide, channels: [] }, now)).to.equal(false);
        expect(hasUsableGuide({ ...guide, genres: undefined }, now)).to.equal(false);
        expect(hasUsableGuide({ ...guide, program: { '2026-09-21': [{ id: 1 }] } }, now)).to.equal(false);
        expect(hasUsableGuide({ ...guide, program: { '2026-09-22': [] } }, now)).to.equal(false);
        expect(hasUsableGuide({ ...guide, program: { '2026-09-23': [{ id: 1 }] } }, now)).to.equal(false);
        expect(hasUsableGuide({ ...guide, program: { '2026-09-21': [{ id: 1 }] } }, new Date(2026, 8, 22, 4, 0))).to.equal(true);
    });
    it('uses the same simple logo names across Germany, Austria and Switzerland', () => {
        expect(logoName('DasErste.de')).to.equal('ard');
        expect(logoName('DasErste.at')).to.equal('ard');
        expect(logoName('DasErste.ch')).to.equal('ard');
        expect(logoName('ZDF.at')).to.equal('zdf');
        expect(logoName('RTL.ch')).to.equal('rtl');
        expect(logoName('ORF1.at')).to.equal('orf1');
        expect(logoName('ORFeins.ch')).to.equal('orfeins');
        expect(logoName('SRF1.ch')).to.equal('srf1');
    });
    it('parses XMLTV offsets and assigns the 05:00 broadcast day', () => {
        const start = xmltvDate('20260922023000 +0200');
        expect(start).to.equal('2026-09-22T00:30:00.000Z');
        expect(broadcastDay(start || '')).to.equal('2026-09-21');
        expect(xmltvDate('invalid')).to.equal(null);
    });

    it('keeps numeric identifiers stable and within JavaScript precision', () => {
        expect(stableId('channel:DasErste.de')).to.equal(stableId('channel:DasErste.de'));
        expect(Number.isSafeInteger(stableId('channel:DasErste.de'))).to.equal(true);
        expect(countryCodes).to.include('DE');
        expect(countryCodes).to.have.length(78);
    });

    it('exposes exactly the supported countries in adapter configuration', () => {
        const config = require('../admin/jsonConfig.json');
        const options = config.items.mainTab.items.country.options;
        expect(options.map(option => option.value).sort()).to.deep.equal([...countryCodes].sort());
    });

    it('separates source caches and rejects unknown countries', () => {
        expect(sourceIdentity('', '')).to.equal('tvfueralle');
        expect(sourceIdentity('iptv-epg', 'de')).to.equal('iptv-epg:DE');
        expect(sourceIdentity('iptv-epg', 'US')).to.equal('iptv-epg:US');
        expect(() => sourceIdentity('iptv-epg', 'XX')).to.throw();
        expect(sourceChanged(undefined, 'iptv-epg:DE')).to.equal(true);
        expect(sourceChanged(undefined, 'tvfueralle')).to.equal(false);
        expect(sourceChanged('iptv-epg:AT', 'iptv-epg:CH')).to.equal(true);
        expect(sourceChanged('iptv-epg:DE', 'iptv-epg:DE')).to.equal(false);
    });

    it('schedules within the selected local hour', () => {
        const now = new Date(2026, 8, 21, 1, 0);
        const next = nextDownload(now, '03:30', () => 0.5);
        expect(next.getHours()).to.equal(4);
        expect(next.getMinutes()).to.equal(0);
        expect(() => nextDownload(now, '25:00')).to.throw();
    });

    it('maps channels, descriptions, categories and overnight programmes', async () => {
        const xml = `<tv><channel id="DasErste.de"><display-name>DE - Das Erste</display-name><icon src="https://example.test/logo"/></channel>
            <programme start="20260922013000 +0200" stop="20260922023000 +0200" channel="DasErste.de">
            <title>News &amp; More</title><desc>A description</desc><category>News</category>
            <episode-num system="xmltv_ns">0.2.</episode-num><icon src="https://example.test/image"/></programme></tv>`;
        const data = await parseXmltv(Readable.from([xml]));
        const event = data.program['2026-09-21'][0];
        expect(data.channels[0].logoName).to.equal('ard');
        expect(data.channels[0].id).to.equal(event.channel);
        expect(event.title).to.equal('News & More');
        expect(event.content.texts.Long.value).to.equal('A description');
        expect(event.content.category).to.equal(data.categories[0].id);
        expect(data.genres).to.deep.equal(data.categories);
        expect(event.content.seasonNumber).to.equal(1);
        expect(event.content.episodeNumber).to.equal(3);
        expect(event.photo.url).to.equal('https://example.test/image');
    });

    it('rejects malformed XML without publishing a partial guide', async () => {
        let error;
        try {
            await parseXmltv(Readable.from(['<tv><channel id="broken">']));
        } catch (caught) {
            error = caught;
        }
        expect(error).to.be.instanceOf(Error);
    });

    it('provides a nonempty genre list when XMLTV has no categories', async () => {
        const xml =
            '<tv><channel id="one"><display-name>One</display-name></channel>' +
            '<programme start="20260922060000 +0000" stop="20260922070000 +0000" channel="one">' +
            '<title>Untitled category</title></programme></tv>';
        const data = await parseXmltv(Readable.from([xml]));
        expect(data.genres).to.have.length(1);
        expect(data.program['2026-09-22'][0].content.category).to.equal(null);
    });

    it('parses the supplied German fixture into daily packets', async function () {
        this.timeout(30000);
        const file = path.join(__dirname, '../docs/epg-de.xml.gz');
        if (!fs.existsSync(file)) {
            this.skip();
        }
        const zlib = require('node:zlib');
        const input = fs.createReadStream(file).pipe(zlib.createGunzip());
        input.setEncoding('utf8');
        const data = await parseXmltv(input);
        expect(data.channels.length).to.be.greaterThan(400);
        expect(Object.keys(data.program).length).to.be.greaterThan(5);
        expect(Object.values(data.program).reduce((sum, events) => sum + events.length, 0)).to.be.greaterThan(70000);
        const tvfFile = path.join(__dirname, '../docs/2026-09-21.json');
        if (fs.existsSync(tvfFile)) {
            const tvfEvent = JSON.parse(fs.readFileSync(tvfFile, 'utf8'))[0];
            const iptvEvent = Object.values(data.program)[0][0];
            expect(Object.keys(iptvEvent).sort()).to.deep.equal(Object.keys(tvfEvent).sort());
            expect(Object.keys(iptvEvent.content).sort()).to.deep.equal(Object.keys(tvfEvent.content).sort());
            expect(Number.isSafeInteger(iptvEvent.channel)).to.equal(true);
            expect(Number.isSafeInteger(iptvEvent.id)).to.equal(true);
        }
    });
});
