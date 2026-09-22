/**
 * Return channels in their original provider order without changing the input.
 *
 * @param {object[]} channels - Provider channels.
 * @returns {object[]} Channels in provider order.
 */
export function nativeOrder(channels) {
    return channels
        .map((channel, index) => ({ channel, index }))
        .sort((a, b) => {
            const orderA = Number.isFinite(Number(a.channel.order)) ? Number(a.channel.order) : a.index;
            const orderB = Number.isFinite(Number(b.channel.order)) ? Number(b.channel.order) : b.index;
            return orderA - orderB || a.index - b.index;
        })
        .map(entry => entry.channel);
}

/**
 * Keep the user's selected order and discard IDs absent from the guide.
 *
 * @param {object[]} channels - Provider channels.
 * @param {Array<number|string>} selectedIds - Saved channel IDs.
 * @returns {object[]} Selected channels.
 */
export function selectedOrder(channels, selectedIds) {
    const byId = new Map(channels.map(channel => [String(channel.id), channel]));
    return selectedIds.map(id => byId.get(String(id))).filter(Boolean);
}

/**
 * Preserve an explicitly empty selection because an empty array means default channels in older views.
 *
 * @param {Array<number|string>} selectedIds - Selected channel IDs.
 * @returns {Array<number|string>} IDs suitable for the existing data point.
 */
export function persistedSelection(selectedIds) {
    return selectedIds.length ? selectedIds : ['__none__'];
}

/**
 * Sort only inactive channels; selected channels are handled separately.
 *
 * @param {object[]} channels - Provider channels.
 * @param {Array<number|string>} selectedIds - Saved channel IDs.
 * @param {string} mode - Native, ascending or descending order.
 * @param {string} locale - Browser locale.
 * @returns {object[]} Inactive channels.
 */
export function inactiveOrder(channels, selectedIds, mode, locale = 'en') {
    const selected = new Set(selectedIds.map(String));
    const inactive = nativeOrder(channels).filter(channel => !selected.has(String(channel.id)));
    if (mode === 'asc' || mode === 'desc') {
        const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
        const direction = mode === 'asc' ? 1 : -1;
        inactive.sort((a, b) => direction * collator.compare(a.name || '', b.name || ''));
    }
    return inactive;
}

/**
 * Filter names and source IDs without affecting the saved selection.
 *
 * @param {object[]} channels - Channels to display.
 * @param {string} query - Search text.
 * @returns {object[]} Matching channels.
 */
export function matchingChannels(channels, query) {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) {
        return channels;
    }
    return channels.filter(channel =>
        `${channel.name || ''} ${channel.channelId || ''}`.toLocaleLowerCase().includes(needle),
    );
}

/**
 * Keep a readable widget text color when the configured colors lack contrast.
 *
 * @param {string} foreground - Widget text color.
 * @param {string} background - Widget background color.
 * @returns {{background: string, foreground: string, colorScheme: string}} Dialog colors.
 */
export function dialogTheme(foreground, background) {
    const parse = value => {
        const match = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\s*\)/i.exec(value || '');
        return match
            ? { rgb: match.slice(1, 4).map(Number), alpha: match[4] === undefined ? 1 : Number(match[4]) }
            : null;
    };
    const parsedBackground = parse(background);
    const surface = parsedBackground && parsedBackground.alpha === 1 ? background : '#ffffff';
    const backgroundRgb = parsedBackground && parsedBackground.alpha === 1 ? parsedBackground.rgb : [255, 255, 255];
    const luminance = rgb =>
        rgb
            .map(component => {
                const value = component / 255;
                return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, component, index) => sum + component * [0.2126, 0.7152, 0.0722][index], 0);
    const backgroundLight = luminance(backgroundRgb);
    const parsedForeground = parse(foreground);
    const foregroundLight = parsedForeground ? luminance(parsedForeground.rgb) : null;
    const ratio =
        foregroundLight === null
            ? 0
            : (Math.max(backgroundLight, foregroundLight) + 0.05) / (Math.min(backgroundLight, foregroundLight) + 0.05);
    return {
        background: surface,
        foreground: ratio >= 4.5 ? foreground : backgroundLight > 0.18 ? '#111111' : '#ffffff',
        colorScheme: backgroundLight > 0.18 ? 'light' : 'dark',
    };
}
