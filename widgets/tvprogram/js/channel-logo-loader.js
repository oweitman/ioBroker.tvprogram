/* JavaScript needs JSDoc types for checkJs; keep them when ESLint applies fixes. */
/* eslint jsdoc/check-tag-names: ["warn", {"typed": false}] */
/**
 * @typedef {HTMLImageElement & {logoRequest?: {url: string, fallback: {hidden: boolean}}}} ChannelLogo
 */

/**
 * Load visible dialog logos without retaining slots for detached page images.
 *
 * @param {HTMLElement} root - Dialog scroll container.
 * @param {Pick<typeof globalThis, 'IntersectionObserver' | 'setTimeout' | 'clearTimeout'>} browser - Browser APIs.
 * @returns {{refresh: () => void, close: () => void}} Page lifecycle hooks.
 */
export function createChannelLogoLoader(root, browser) {
    const active = new Map();
    const finished = new WeakSet();
    /** @type {ChannelLogo[]} */
    let queue = [];
    let closed = false;
    const pump = () => {
        while (!closed && active.size < 4 && queue.length) {
            const image = queue.shift();
            if (!image?.logoRequest || !root.contains(image) || finished.has(image) || active.has(image)) {
                continue;
            }
            const { fallback, url } = image.logoRequest;
            let retryTimer;
            let retries = 0;
            const release = () => {
                browser.clearTimeout(retryTimer);
                image.onload = image.onerror = null;
                active.delete(image);
            };
            const complete = success => {
                release();
                finished.add(image);
                image.hidden = !success;
                fallback.hidden = success;
                pump();
            };
            active.set(image, () => {
                release();
                image.removeAttribute('src');
            });
            image.onload = () => complete(true);
            image.onerror = () => {
                if (retries++ === 0) {
                    image.removeAttribute('src');
                    retryTimer = browser.setTimeout(() => {
                        image.src = url;
                    }, 1500);
                } else {
                    complete(false);
                }
            };
            image.src = url;
        }
    };
    const observer = browser.IntersectionObserver
        ? new browser.IntersectionObserver(
              entries => {
                  for (const entry of entries) {
                      if (entry.isIntersecting && root.contains(entry.target)) {
                          observer?.unobserve(entry.target);
                          queue.push(/** @type {ChannelLogo} */ (entry.target));
                      }
                  }
                  pump();
              },
              { root, rootMargin: '200px' },
          )
        : null;
    return {
        refresh() {
            observer?.disconnect();
            queue = [];
            for (const [image, cancel] of active) {
                if (!root.contains(image)) {
                    cancel();
                }
            }
            for (const image of /** @type {NodeListOf<ChannelLogo>} */ (root.querySelectorAll('.tvp-channel-logo'))) {
                if (!image.logoRequest || finished.has(image) || active.has(image)) {
                    continue;
                }
                if (observer) {
                    observer.observe(image);
                } else {
                    queue.push(image);
                }
            }
            pump();
        },
        close() {
            closed = true;
            observer?.disconnect();
            queue = [];
            for (const cancel of active.values()) {
                cancel();
            }
        },
    };
}
