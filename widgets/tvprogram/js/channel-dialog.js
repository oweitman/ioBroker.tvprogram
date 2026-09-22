/* global document, window */
import Sortable from 'sortablejs';
import { dialogTheme, inactiveOrder, matchingChannels, selectedOrder } from './channel-selection-model.js';

const labels = {
    de: {
        title: 'Sender auswählen',
        save: 'Auswahl speichern',
        cancel: 'Schließen ohne Speichern',
        search: 'Sender suchen',
        active: 'Aktive Sender',
        inactive: 'Weitere Sender',
        empty: 'Keine Sender gefunden',
        reorder: 'Zum Verschieben ziehen',
        selected: 'Sender deaktivieren',
        unselected: 'Sender aktivieren',
        sort: { native: 'Originale Reihenfolge', asc: 'Name A–Z', desc: 'Name Z–A' },
    },
    en: {
        title: 'Select channels',
        save: 'Save selection',
        cancel: 'Close without saving',
        search: 'Search channels',
        active: 'Selected channels',
        inactive: 'Other channels',
        empty: 'No channels found',
        reorder: 'Drag to reorder',
        selected: 'Remove channel',
        unselected: 'Add channel',
        sort: { native: 'Original order', asc: 'Name A–Z', desc: 'Name Z–A' },
    },
};

/**
 * Open the native channel dialog for one timetable widget.
 *
 * @param {object} options - Dialog settings and callbacks.
 * @returns {HTMLDialogElement} The opened dialog.
 */
export function openChannelDialog(options) {
    const { host, widget, channels, selectedIds: initialIds, getLogo, onSave, widthPercent, heightPercent } = options;
    const lang = (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
    const text = labels[lang];
    const locale = navigator.language || 'en';
    const byId = new Map(channels.map(channel => [String(channel.id), channel]));
    let selectedIds = selectedOrder(channels, initialIds).map(channel => channel.id);
    let sortMode = 'native';

    const previous = host.querySelector('dialog');
    if (previous?.open) {
        previous.close();
    }
    host.replaceChildren();
    const dialog = document.createElement('dialog');
    dialog.className = 'tvp-channel-dialog';
    dialog.setAttribute('aria-label', text.title);
    dialog.style.width = `${Math.max(760, Math.round(widget.clientWidth * widthPercent))}px`;
    dialog.style.height = `${Math.max(560, Math.round(widget.clientHeight * heightPercent))}px`;
    const computed = window.getComputedStyle(widget);
    const theme = dialogTheme(computed.color, options.background);
    dialog.style.setProperty('--tvp-dialog-bg', theme.background);
    dialog.style.setProperty('--tvp-dialog-fg', theme.foreground);
    dialog.style.colorScheme = theme.colorScheme;
    dialog.style.fontFamily = computed.fontFamily;
    dialog.style.fontSize = computed.fontSize;

    const header = document.createElement('header');
    header.className = 'tvp-channel-toolbar';
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'tvp-channel-action';
    saveButton.textContent = '✓';
    saveButton.title = text.save;
    saveButton.setAttribute('aria-label', text.save);
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'tvp-channel-action';
    cancelButton.textContent = '✕';
    cancelButton.title = text.cancel;
    cancelButton.setAttribute('aria-label', text.cancel);
    const title = document.createElement('strong');
    title.className = 'tvp-channel-title';
    title.textContent = text.title;
    header.append(saveButton, cancelButton, title);

    const controls = document.createElement('div');
    controls.className = 'tvp-channel-controls';
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'tvp-channel-search';
    search.placeholder = text.search;
    search.setAttribute('aria-label', text.search);
    const sortButton = document.createElement('button');
    sortButton.type = 'button';
    sortButton.className = 'tvp-channel-sort';
    sortButton.setAttribute('aria-label', text.sort.native);
    controls.append(search, sortButton);

    const content = document.createElement('div');
    content.className = 'tvp-channel-content';
    const activeHeading = document.createElement('h3');
    const activeList = document.createElement('ul');
    activeList.className = 'tvp-channel-grid tvp-channel-active';
    const inactiveHeading = document.createElement('h3');
    const inactiveList = document.createElement('ul');
    inactiveList.className = 'tvp-channel-grid tvp-channel-inactive';
    const empty = document.createElement('p');
    empty.className = 'tvp-channel-empty';
    empty.textContent = text.empty;
    content.append(activeHeading, activeList, inactiveHeading, inactiveList, empty);
    const fullscreenButton = document.createElement('button');
    fullscreenButton.type = 'button';
    fullscreenButton.className = 'tvp-channel-action tvp-channel-fullscreen';
    const updateFullscreenButton = () => {
        const expanded = dialog.classList.contains('is-fullscreen');
        fullscreenButton.textContent = expanded ? '❐' : '□';
        fullscreenButton.title = expanded
            ? lang === 'de'
                ? 'Ursprüngliche Dialoggröße'
                : 'Restore dialog size'
            : lang === 'de'
              ? 'Vollbild'
              : 'Fullscreen';
        fullscreenButton.setAttribute('aria-label', fullscreenButton.title);
    };
    updateFullscreenButton();
    header.append(fullscreenButton);
    dialog.append(header, controls, content);
    host.append(dialog);

    const cards = new Map();
    const imageQueue = [];
    let imageLoads = 0;
    let closed = false;
    const loadImages = () => {
        while (!closed && imageLoads < 4 && imageQueue.length) {
            const { image, fallback, url } = imageQueue.shift();
            imageLoads++;
            let attempts = 0;
            const complete = success => {
                if (!success) {
                    image.hidden = true;
                    fallback.hidden = false;
                }
                imageLoads--;
                loadImages();
            };
            image.onload = () => complete(true);
            image.onerror = () => {
                if (++attempts === 1 && !closed) {
                    image.removeAttribute('src');
                    window.setTimeout(() => {
                        if (closed) {
                            complete(false);
                        } else {
                            image.src = url;
                        }
                    }, 1500);
                } else {
                    complete(false);
                }
            };
            image.src = url;
        }
    };
    const observer =
        typeof window.IntersectionObserver === 'undefined'
            ? null
            : new window.IntersectionObserver(
                  entries => {
                      for (const entry of entries) {
                          if (entry.isIntersecting) {
                              observer.unobserve(entry.target);
                              imageQueue.push(entry.target.logoRequest);
                          }
                      }
                      loadImages();
                  },
                  { root: content, rootMargin: '200px' },
              );
    const makeCard = (channel, selected) => {
        const card = document.createElement('li');
        card.className = `tvp-channel-card${selected ? ' is-selected' : ''}`;
        card.dataset.id = String(channel.id);
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'tvp-channel-toggle';
        toggle.dataset.action = 'toggle';
        toggle.setAttribute('aria-pressed', String(selected));
        toggle.setAttribute(
            'aria-label',
            `${selected ? `${text.selected}: ${channel.name}. ${text.reorder}` : `${text.unselected}: ${channel.name}`}`,
        );
        const logoSurface = document.createElement('span');
        logoSurface.className = 'tvp-channel-logo-surface';
        const image = document.createElement('img');
        image.className = 'tvp-channel-logo';
        image.alt = '';
        image.loading = 'lazy';
        image.draggable = false;
        const fallback = document.createElement('span');
        fallback.className = 'tvp-channel-logo-fallback';
        fallback.textContent = (channel.name || '?').slice(0, 3).toUpperCase();
        fallback.hidden = true;
        const url = getLogo(channel);
        if (url) {
            image.logoRequest = { image, fallback, url };
            if (observer) {
                observer.observe(image);
            } else {
                imageQueue.push(image.logoRequest);
                loadImages();
            }
        } else {
            image.hidden = true;
            fallback.hidden = false;
        }
        logoSurface.append(image, fallback);
        const name = document.createElement('span');
        name.className = 'tvp-channel-name';
        name.textContent = channel.name || channel.channelId || String(channel.id);
        toggle.append(logoSurface, name);
        card.append(toggle);
        return card;
    };

    const getCard = (channel, selected) => {
        const key = String(channel.id);
        let card = cards.get(key);
        if (!card) {
            card = makeCard(channel, selected);
            cards.set(key, card);
        } else {
            card.classList.toggle('is-selected', selected);
            const toggle = card.querySelector('.tvp-channel-toggle');
            toggle.setAttribute('aria-pressed', String(selected));
            toggle.setAttribute(
                'aria-label',
                `${selected ? `${text.selected}: ${channel.name}. ${text.reorder}` : `${text.unselected}: ${channel.name}`}`,
            );
        }
        return card;
    };
    const updateSortButton = () => {
        sortButton.textContent = { native: '↕', asc: '↑', desc: '↓' }[sortMode];
        sortButton.title = text.sort[sortMode];
        sortButton.setAttribute('aria-label', text.sort[sortMode]);
    };
    let dragFinishedAt = 0;
    const sortable = new Sortable(activeList, {
        animation: 150,
        delayOnTouchOnly: true,
        delay: 180,
        touchStartThreshold: 5,
        onEnd: () => {
            dragFinishedAt = Date.now();
            selectedIds = [...activeList.children].map(card => byId.get(card.dataset.id).id);
        },
    });
    const render = () => {
        const query = search.value;
        sortable.option('disabled', Boolean(query.trim()));
        activeHeading.textContent = `${text.active} (${selectedIds.length})`;
        const active = matchingChannels(selectedOrder(channels, selectedIds), query);
        const inactive = matchingChannels(inactiveOrder(channels, selectedIds, sortMode, locale), query);
        inactiveHeading.textContent = `${text.inactive} (${channels.length - selectedIds.length})`;
        const activeCards = document.createDocumentFragment();
        const inactiveCards = document.createDocumentFragment();
        for (const channel of active) {
            activeCards.append(getCard(channel, true));
        }
        for (const channel of inactive) {
            inactiveCards.append(getCard(channel, false));
        }
        activeList.replaceChildren(activeCards);
        inactiveList.replaceChildren(inactiveCards);
        empty.hidden = active.length + inactive.length > 0;
        updateSortButton();
    };
    const toggleChannel = event => {
        if (event.currentTarget === activeList && Date.now() - dragFinishedAt < 350) {
            event.preventDefault();
            return;
        }
        const button = event.target.closest('[data-action="toggle"]');
        if (!button) {
            return;
        }
        const channel = byId.get(button.closest('[data-id]').dataset.id);
        if (!channel) {
            return;
        }
        const index = selectedIds.findIndex(id => String(id) === String(channel.id));
        if (index < 0) {
            selectedIds.push(channel.id);
        } else {
            selectedIds.splice(index, 1);
        }
        render();
    };
    activeList.addEventListener('click', toggleChannel);
    inactiveList.addEventListener('click', toggleChannel);
    search.addEventListener('input', render);
    sortButton.addEventListener('click', () => {
        sortMode = { native: 'asc', asc: 'desc', desc: 'native' }[sortMode];
        render();
    });
    fullscreenButton.addEventListener('click', () => {
        dialog.classList.toggle('is-fullscreen');
        updateFullscreenButton();
    });
    saveButton.addEventListener('click', () => {
        onSave(selectedIds);
        dialog.close();
    });
    cancelButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener(
        'close',
        () => {
            closed = true;
            observer?.disconnect();
            imageQueue.length = 0;
            sortable.destroy();
            if (host.contains(dialog)) {
                dialog.remove();
            }
        },
        { once: true },
    );
    render();
    dialog.showModal();
    search.focus();
    return dialog;
}
