'use strict';

/**
 * Limit a programme packet to the channel IDs requested by a widget.
 *
 * @param {Array<object>} program Complete programme packet.
 * @param {Array<string | number> | undefined} channelfilter Requested channel IDs.
 * @returns {Array<object>} The filtered programme packet.
 */
function filterProgramByChannels(program, channelfilter) {
    if (!Array.isArray(channelfilter)) {
        return program;
    }
    const channels = new Set(channelfilter.map(String));
    return program.filter(event => channels.has(String(event.channel)));
}

module.exports = { filterProgramByChannels };
