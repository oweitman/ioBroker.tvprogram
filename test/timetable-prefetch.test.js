'use strict';

const { expect } = require('chai');

describe('Timetable day preloading', () => {
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
        const first = timetable.loadDay('tvprogram.0', 'widget1', '2026-09-23');
        const second = timetable.loadDay('tvprogram.0', 'widget2', '2026-09-23');
        expect(requests).to.equal(1);
        finishRequest([{ title: 'First' }]);
        await Promise.all([first, second]);
        expect(timetable.tvprogram['tvprogram.0:2026-09-23']).to.have.length(1);

        const pending = timetable.loadDay('tvprogram.0', 'widget1', '2026-09-24');
        timetable.cacheEpoch['tvprogram.0:2026-09-24'] = 1;
        finishRequest([{ title: 'Old' }]);
        await pending;
        expect(timetable.tvprogram).not.to.have.property('tvprogram.0:2026-09-24');
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
