'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
    expiredProgrammeFiles,
    readSelectionFile,
    retentionCutoff,
    retainMissingProgramme,
    writeSelectionFile,
} = require('../lib/cache');

describe('Programme cache retention', () => {
    const now = new Date(2026, 8, 28, 12, 0, 0);

    it('retains exactly five local calendar days including today', () => {
        expect(retentionCutoff(now)).to.equal('2026-09-24');
        expect(retainMissingProgramme('2026-09-24', now)).to.equal(true);
        expect(retainMissingProgramme('2026-09-28', now)).to.equal(true);
        expect(retainMissingProgramme('2026-09-23', now)).to.equal(false);
        expect(retainMissingProgramme('2026-09-29', now)).to.equal(false);
    });

    it('handles retention across month boundaries', () => {
        expect(retentionCutoff(new Date(2026, 9, 2, 12, 0, 0))).to.equal('2026-09-28');
    });

    it('deletes only expired dated files', () => {
        expect(
            expiredProgrammeFiles(
                ['2026-09-22.json', '2026-09-23.json', '2026-09-24.json', '2026-09-28.json', 'metadata.json'],
                now,
            ),
        ).to.deep.equal(['2026-09-22.json', '2026-09-23.json']);
    });

    it('provides a writable cache reset button', () => {
        const reset = require('../io-package.json').instanceObjects.find(object => object._id === 'info.reset');
        expect(reset).to.include({ type: 'state' });
        expect(reset.common).to.include({ type: 'boolean', role: 'button', read: false, write: true, def: false });
    });

    it('stores channel selections by TV and source in the cache', async () => {
        const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'tvprogram-selection-'));
        const file = path.join(directory, 'selections', 'wohnzimmer.json');
        const selections = { 'iptv-epg:AT': [1, 2], 'iptv-epg:CH': [3, 4] };
        try {
            await writeSelectionFile(file, selections);
            expect(await readSelectionFile(file)).to.deep.equal(selections);
        } finally {
            await fs.promises.rm(directory, { recursive: true, force: true });
        }
    });
});
