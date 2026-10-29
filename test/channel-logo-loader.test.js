'use strict';
const { expect } = require('chai');

/**
 * Minimal image double; DOM assertions are confined to the loader boundary.
 *
 * @returns {{src: string | undefined, onload: null | (() => void), onerror: null | (() => void), logoRequest: {url: string, fallback: {hidden: boolean}}, removeAttribute: () => void}} Image double.
 */
function makeImage() {
    return {
        src: undefined,
        onload: null,
        onerror: null,
        logoRequest: { url: 'logo.png', fallback: { hidden: true } },
        removeAttribute() { this.src = undefined; },
    };
}

/**
 * Adapt partial browser doubles to the loader's DOM API boundary.
 *
 * @param {object} root Partial scroll container.
 * @param {object} browser Partial browser APIs.
 * @returns {Promise<ReturnType<typeof import('../widgets/tvprogram/js/channel-logo-loader.js').createChannelLogoLoader>>} Loader.
 */
async function makeLoader(root, browser) {
    const { createChannelLogoLoader } = await import('../widgets/tvprogram/js/channel-logo-loader.js');
    return createChannelLogoLoader(
        /** @type {HTMLElement} */ (root),
        /** @type {Pick<typeof globalThis, 'IntersectionObserver' | 'setTimeout' | 'clearTimeout'>} */ (browser),
    );
}

describe('Channel dialog logo loading', () => {
    it('observes returning page images again and cancels pending retries on page changes', async () => {
        let notify = entries => { throw new Error(`Observer not initialized: ${entries.length}`); };
        let observed = [];
        const timers = new Map();
        const image = makeImage();
        let visible = [image];
        const loader = await makeLoader(
            { contains: target => visible.includes(target), querySelectorAll: () => visible },
            {
                IntersectionObserver: class {
                    constructor(callback) { notify = callback; }
                    observe(target) { observed.push(target); }
                    unobserve() {}
                    disconnect() { observed = []; }
                },
                setTimeout(callback) { timers.set(1, callback); return 1; },
                clearTimeout(id) { timers.delete(id); },
            },
        );
        loader.refresh();
        expect(observed).to.deep.equal([image]);
        notify([{ target: image, isIntersecting: true }]);
        if (!image.onerror) { throw new Error('Image request was not started'); }
        image.onerror();
        expect(timers.size).to.equal(1);
        visible = [];
        loader.refresh();
        expect(timers.size).to.equal(0);
        visible = [image];
        loader.refresh();
        expect(observed).to.deep.equal([image]);
        notify([{ target: image, isIntersecting: true }]);
        expect(image.src).to.equal('logo.png');
        loader.close();
    });
    it('releases detached page requests, resumes returning logos and retains completed images', async () => {
        const images = Array.from({ length: 10 }, makeImage);
        let visible = images.slice(0, 5);
        const root = { contains: image => visible.includes(image), querySelectorAll: () => visible };
        const loader = await makeLoader(root, { clearTimeout() {}, setTimeout() {} });
        loader.refresh();
        expect(images.filter(image => image.src)).to.have.length(4);
        visible = images.slice(5);
        loader.refresh();
        expect(images[0].onload).to.equal(null);
        expect(images[5].src).to.equal('logo.png');
        if (!images[5].onload) { throw new Error('Image request was not started'); }
        images[5].onload();
        expect(images[9].src).to.equal('logo.png');
        visible = images.slice(0, 5);
        loader.refresh();
        expect(images[0].src).to.equal('logo.png');
        visible = images.slice(5);
        loader.refresh();
        expect(images[5].onload).to.equal(null);
        expect(images[5].src).to.equal('logo.png');
        expect(images[6].onload).to.be.a('function');
        loader.close();
        expect(images[6].onload).to.equal(null);
    });
});
