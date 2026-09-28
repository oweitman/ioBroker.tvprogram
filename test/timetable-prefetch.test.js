'use strict';

const { expect } = require('chai');

describe('Timetable day preloading', () => {
    it('skips programme rows whose channel is not part of the active source', async () => {
        const timetable = (await import('../widgets/tvprogram/js/time1.js')).default;
        timetable.visTvprogram = { channels: [] };

        const result = timetable.getBroadcasts4Channel(
            { channel: 42, events: [{ title: 'Stale programme' }] },
            'widget1',
            'view1',
            '2026-09-28',
            'tvprogram.0.tv1',
            'tvprogram.0',
        );

        expect(result).to.deep.equal([]);
    });

    it('reloads the changed TV source and retains caches of other TVs', async () => {
        const timetable = (await import('../widgets/tvprogram/js/time1.js')).default;
        const originalWindow = global.window;
        const invalidated = [];
        const originalCreateWidget = timetable.createWidget;
        timetable.tvprogram = {
            'tvprogram.0.tv1:tvprogram.0:2026-09-28:1': [{ title: 'Old source' }],
            'tvprogram.0.tv2:tvprogram.0:2026-09-28:2': [{ title: 'Other TV' }],
        };
        timetable.pending = {
            'tvprogram.0.tv1:tvprogram.0:2026-09-29:1': { promise: Promise.resolve([]), epoch: 0 },
        };
        timetable.cacheEpoch = {
            'tvprogram.0.tv1:tvprogram.0:2026-09-29:1': 0,
        };
        timetable.visTvprogram = {
            invalidateSourceData: oid => invalidated.push(oid),
            getInstanceInfo: () => ['tvprogram.0', 'tvprogram.0.tv1'],
        };
        timetable.prefetchSchedule = {};
        timetable.sourceRevision = { 'tvprogram.0.tv1': 4 };
        global.window = { clearTimeout: () => {} };
        let reloads = 0;
        timetable.createWidget = async () => {
            reloads++;
        };

        try {
            await timetable.onChange(
                'widget1',
                'view1',
                { tvprogram_oid: 'tvprogram.0.tv1.cmd' },
                {},
                'tvprogram.0',
                { type: 'tvprogram.0.tv1.cmd.val' },
                'new|source|iptv-epg:de',
            );

            expect(invalidated).to.deep.equal(['tvprogram.0.tv1']);
            expect(timetable.sourceRevision['tvprogram.0.tv1']).to.equal(5);
            expect(reloads).to.equal(1);
            expect(timetable.tvprogram).not.to.have.property('tvprogram.0.tv1:tvprogram.0:2026-09-28:1');
            expect(timetable.tvprogram).to.have.property('tvprogram.0.tv2:tvprogram.0:2026-09-28:2');
            expect(timetable.pending).not.to.have.property('tvprogram.0.tv1:tvprogram.0:2026-09-29:1');
            expect(timetable.cacheEpoch['tvprogram.0.tv1:tvprogram.0:2026-09-29:1']).to.equal(1);
        } finally {
            timetable.createWidget = originalCreateWidget;
            global.window = originalWindow;
        }
    });

    it('shares an active day request and caches only current data', async () => {
        const timetable = (await import('../widgets/tvprogram/js/time1.js')).default;
        timetable.tvprogram = {};
        timetable.pending = {};
        timetable.cacheEpoch = {};
        let finishRequest;
        let requests = 0;
        timetable.visTvprogram = {
            loadProgram: () => {
                requests++;
                return new Promise(resolve => {
                    finishRequest = resolve;
                });
            },
        };
        const first = timetable.loadDay('tvprogram.0', 'widget1', '2026-09-23', [1, 2]);
        const second = timetable.loadDay('tvprogram.0', 'widget2', '2026-09-23', [1, 2]);
        expect(requests).to.equal(1);
        finishRequest([{ title: 'First' }]);
        await Promise.all([first, second]);
        expect(timetable.tvprogram['tvprogram.0:2026-09-23:1,2']).to.have.length(1);

        const pending = timetable.loadDay('tvprogram.0', 'widget1', '2026-09-24', [1, 2]);
        timetable.cacheEpoch['tvprogram.0:2026-09-24:1,2'] = 1;
        finishRequest([{ title: 'Old' }]);
        await pending;
        expect(timetable.tvprogram).not.to.have.property('tvprogram.0:2026-09-24:1,2');
    });

    it('keeps different channel selections in separate caches', async () => {
        const timetable = (await import('../widgets/tvprogram/js/time1.js')).default;
        const requests = [];
        timetable.tvprogram = {};
        timetable.pending = {};
        timetable.cacheEpoch = {};
        timetable.visTvprogram = {
            loadProgram: async (_instance, _widgetID, _date, channels) => {
                requests.push(channels);
                return channels.map(channel => ({ channel }));
            },
        };

        await timetable.loadDay('tvprogram.0', 'widget1', '2026-09-23', [1]);
        await timetable.loadDay('tvprogram.0', 'widget2', '2026-09-23', [2]);

        expect(requests).to.deep.equal([[1], [2]]);
        expect(timetable.tvprogram['tvprogram.0:2026-09-23:1']).to.deep.equal([{ channel: 1 }]);
        expect(timetable.tvprogram['tvprogram.0:2026-09-23:2']).to.deep.equal([{ channel: 2 }]);
    });

    it('prefetches only the two following programme days in sequence', async () => {
        const timetable = (await import('../widgets/tvprogram/js/time1.js')).default;
        const originalDocument = global.document;
        const originalWindow = global.window;
        const requests = [];
        global.document = { getElementById: () => ({}) };
        global.window = { setTimeout: callback => callback() };
        timetable.tvprogram = {};
        timetable.pending = {};
        timetable.cacheEpoch = {};
        timetable.visTvprogram = {
            getDate: (date, offset) => {
                const result = new Date(date);
                result.setDate(result.getDate() + offset);
                return result.toISOString().slice(0, 10);
            },
            loadProgram: async (_instance, _widgetID, date) => {
                requests.push(date);
                return [{ title: date }];
            },
        };
        try {
            await timetable.prefetchNextDays('tvprogram.0', 'widget1', new Date('2026-09-22T12:00:00Z'));
            expect(requests).to.deep.equal(['2026-09-23', '2026-09-24']);
        } finally {
            global.document = originalDocument;
            global.window = originalWindow;
        }
    });

    it('waits for visible images before starting the background requests', async () => {
        const timetable = (await import('../widgets/tvprogram/js/time1.js')).default;
        const originalDocument = global.document;
        const originalWindow = global.window;
        const originalVis = global.vis;
        const scheduled = [];
        let loading = true;
        let started = 0;
        const originalPrefetch = timetable.prefetchNextDays;
        global.document = {
            getElementById: () => ({ querySelectorAll: () => [{ complete: !loading }] }),
        };
        global.window = {
            setTimeout: (callback, delay) => {
                scheduled.push({ callback, delay });
                return scheduled.length;
            },
            clearTimeout: () => {},
        };
        global.vis = { editMode: false };
        timetable.prefetchSchedule = {};
        timetable.visTvprogram = {
            calcDate: date => date,
            getDate: () => '2026-09-22',
        };
        timetable.prefetchNextDays = () => {
            started++;
        };
        try {
            timetable.schedulePrefetch('widget1', 'tvprogram.0');
            expect(scheduled[0].delay).to.equal(10000);
            scheduled[0].callback();
            expect(started).to.equal(0);
            expect(scheduled[1].delay).to.equal(3000);
            loading = false;
            scheduled[1].callback();
            expect(started).to.equal(1);
        } finally {
            timetable.prefetchNextDays = originalPrefetch;
            global.document = originalDocument;
            global.window = originalWindow;
            global.vis = originalVis;
        }
    });
});
