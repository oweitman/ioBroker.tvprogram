'use strict';

/**
 * Convert a user-facing TV name into a valid ioBroker object ID segment.
 *
 * @param {unknown} value User-facing name.
 * @param {string} fallback Value used if the name contains no usable characters.
 * @returns {string} Stable lowercase ID containing letters and digits only.
 */
function dataPointId(value, fallback = 'tv') {
    const id = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    return id || fallback;
}

/**
 * Normalize the current per-TV configuration and legacy global settings.
 *
 * @param {object} config Adapter configuration.
 * @returns {Array<object>} Normalized TV configurations.
 */
function tvConfigs(config) {
    const configured = Array.isArray(config.tvconfigs) ? config.tvconfigs : [];
    if (configured.length) {
        return configured.map((entry, index) => ({
            // Derive missing persistent IDs from the user-facing name. The
            // index is only a last resort for empty legacy configurations.
            tv: dataPointId(entry.datapoint || entry.name, `tv${index + 1}`),
            name: entry.name || `TV ${index + 1}`,
            source: entry.source || 'tvfueralle',
            country: entry.country || 'DE',
        }));
    }
    const count = Number(config.tvcount) || 1;
    return Array.from({ length: count }, (_, index) => ({
        tv: `tv${index + 1}`,
        name: `TV ${index + 1}`,
        source: config.source || 'tvfueralle',
        country: config.country || 'DE',
    }));
}

/**
 * Save the current channel selection and restore the selection for a new source.
 *
 * @param {string} previous Previous source identity.
 * @param {string} identity New source identity.
 * @param {Array<string | number>} current Current channel selection.
 * @param {object} stored Stored selections by source identity.
 * @param {Array<string | number>} defaults Default channel IDs for a source without a saved selection.
 * @returns {object} Updated selection state.
 */
function switchSelection(previous, identity, current, stored = {}, defaults = []) {
    const selections = { ...stored };
    const selectionOrDefault = selection => (Array.isArray(selection) && selection.length ? selection : defaults);
    if (!previous) {
        const selected = selectionOrDefault(current);
        selections[identity] = selected;
        return { selections, selected, changed: JSON.stringify(selected) !== JSON.stringify(current) };
    }
    if (previous === identity) {
        const selected = selectionOrDefault(current);
        selections[identity] = selected;
        return { selections, selected, changed: JSON.stringify(selected) !== JSON.stringify(current) };
    }
    selections[previous] = current;
    const selected = selectionOrDefault(selections[identity]);
    selections[identity] = selected;
    return { selections, selected, changed: true };
}

/**
 * Decide whether widgets must reload their source data.
 *
 * A running widget can retain data across an adapter restart. Therefore every
 * TV needs one source notification per adapter process, even when the source
 * state already contains the configured identity.
 *
 * @param {string} previous Source identity stored in the data point.
 * @param {string} identity Configured source identity.
 * @param {string | undefined} notified Source identity already announced by this process.
 * @returns {boolean} Whether a source command must be sent.
 */
function sourceNotificationRequired(previous, identity, notified) {
    return previous !== identity || notified !== identity;
}

/**
 * Compare configured TV keys with existing adapter TV devices.
 *
 * @param {Array<object>} configured Normalized TV configurations.
 * @param {string[]} existing Existing TV device keys.
 * @returns {object} Desired, missing and obsolete TV keys.
 */
function tvDeviceDiff(configured, existing) {
    const desired = configured.map(entry => entry.tv);
    return {
        desired,
        missing: desired.filter(tv => !existing.includes(tv)),
        obsolete: existing.filter(tv => !desired.includes(tv)),
    };
}

/**
 * Resolve a configured TV device from a state or message object ID.
 *
 * @param {unknown} oid Object ID or TV device name.
 * @param {string} namespace Adapter namespace.
 * @param {string[]} configured Configured TV device names.
 * @returns {string | undefined} Matching TV device name.
 */
function tvFromOid(oid, namespace, configured) {
    const value = String(oid || '');
    const relative = value.startsWith(`${namespace}.`) ? value.slice(`${namespace}.`.length) : value;
    const candidate = relative.split('.')[0];
    return configured.includes(candidate) ? candidate : undefined;
}

module.exports = { dataPointId, switchSelection, sourceNotificationRequired, tvConfigs, tvDeviceDiff, tvFromOid };
