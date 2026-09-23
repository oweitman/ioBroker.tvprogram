/* global window */
const observers = new WeakMap();

const imageUrl = image => image.dataset.logoUrl || image.dataset.programmeUrl;
const imageKey = image =>
    `${image.className}:${image.dataset.imageId || image.dataset.channelid || image.dataset.eventid}:${imageUrl(image)}`;

/**
 * Replace widget markup while retaining loaded logos and programme images.
 *
 * @param {object} $container - jQuery wrapper for the widget content.
 * @param {string} markup - New widget markup.
 * @param {string} scrollSelector - Selector for the scroll container.
 */
export function replaceWidgetContentWithImages($container, markup, scrollSelector) {
    const container = $container[0];
    if (!container) {
        return;
    }
    const previousImages = new Map();
    for (const image of container.querySelectorAll('.channel-logo, .broadcastimage')) {
        previousImages.set(imageKey(image), image);
        image.remove();
    }
    observers.get(container)?.disconnect();
    $container.html(markup);

    const queue = [];
    let active = 0;
    const pump = () => {
        while (active < 4 && queue.length) {
            const image = queue.shift();
            if (image.isConnected) {
                active++;
                load(image);
            }
        }
    };
    const load = image => {
        let retries = 0;
        let finished = false;
        const complete = () => {
            if (finished) {
                return;
            }
            finished = true;
            active--;
            pump();
        };
        image.onload = complete;
        image.onerror = () => {
            if (retries++ === 0 && image.isConnected) {
                image.removeAttribute('src');
                window.setTimeout(() => {
                    if (image.isConnected) {
                        image.src = imageUrl(image);
                    } else {
                        complete();
                    }
                }, 1500);
            } else {
                image.dataset.imageFailed = 'true';
                image.style.display = 'none';
                complete();
            }
        };
        image.src = imageUrl(image);
    };
    const root = container.querySelector(scrollSelector) || container;
    const observer = window.IntersectionObserver
        ? new window.IntersectionObserver(
              entries => {
                  for (const entry of entries) {
                      if (entry.isIntersecting) {
                          observer.unobserve(entry.target);
                          queue.push(entry.target);
                      }
                  }
                  pump();
              },
              { root, rootMargin: '150px' },
          )
        : null;
    observers.set(container, observer);
    for (const image of container.querySelectorAll('.channel-logo, .broadcastimage')) {
        const previous = previousImages.get(imageKey(image));
        if (previous?.hasAttribute('src') && !previous.dataset.imageFailed) {
            image.replaceWith(previous);
        } else if (!imageUrl(image)) {
            image.remove();
        } else if (observer) {
            observer.observe(image);
        } else {
            queue.push(image);
        }
    }
    pump();
}
