'use strict';

const crypto = require('node:crypto');
const { SaxesParser } = require('saxes');

const countryCodes =
    'AL AR AM AU AT BS BY BE BO BA BR BG CA CL CO CR HR CW CZ DK DO EC EG SV FI FR GE DE GH GR GT HN HK HU IS IN ID IL IT JM JP LV LT LU MY MT MX ME NL NZ NI NG NO PA PY PE PL PT RO RU RS SG ZA KR ES SE CH TW TH TT TR UG UA GB US UY VE ZW'.split(
        ' ',
    );

/**
 * Validate an adapter source and country for cache separation.
 *
 * @param {string} source - Selected source.
 * @param {string} country - Selected IPTV-EPG country.
 * @returns {string} Cache identity.
 */
function sourceIdentity(source, country) {
    if (source !== 'iptv-epg') {
        return 'tvfueralle';
    }
    const code = String(country || 'DE').toUpperCase();
    if (!countryCodes.includes(code)) {
        throw new Error(`Unsupported IPTV-EPG country: ${code}`);
    }
    return `iptv-epg:${code}`;
}

/**
 * Legacy caches without source metadata belong to TV für alle.
 *
 * @param {string|undefined} previous - Cached source identity.
 * @param {string} selected - Configured source identity.
 * @returns {boolean} Whether cached data must be discarded.
 */
function sourceChanged(previous, selected) {
    return (previous || 'tvfueralle') !== selected;
}

/**
 * Return a stable, safe integer for an XMLTV identifier.
 *
 * @param {string} value - Source identifier.
 * @returns {number} Numeric identifier.
 */
function stableId(value) {
    return Number.parseInt(crypto.createHash('sha256').update(value).digest('hex').slice(0, 12), 16);
}

/**
 * Derive the user logo filename stem from a channel identifier.
 *
 * @param {string} sourceId - XMLTV channel ID.
 * @returns {string} Lowercase filename stem.
 */
function logoName(sourceId) {
    const stem = String(sourceId).replace(/\.[a-z]{2}$/i, '');
    return stem.toLowerCase() === 'daserste' ? 'ard' : stem.toLowerCase();
}

/**
 * Convert an XMLTV timestamp and explicit offset to ISO.
 *
 * @param {string} value - XMLTV timestamp.
 * @returns {string|null} ISO timestamp.
 */
function xmltvDate(value) {
    const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-])(\d{2})(\d{2})$/.exec(value || '');
    if (!match) {
        return null;
    }
    const [, year, month, day, hour, minute, second, sign, zoneHour, zoneMinute] = match;
    const offset = (Number(zoneHour) * 60 + Number(zoneMinute)) * (sign === '+' ? 1 : -1);
    const time = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second) - offset * 60000;
    return new Date(time).toISOString();
}

/**
 * Assign broadcasts before 05:00 to the previous local day.
 *
 * @param {string} date - ISO timestamp.
 * @returns {string} Local broadcast day.
 */
function broadcastDay(date) {
    const day = new Date(date);
    if (day.getHours() < 5) {
        day.setDate(day.getDate() - 1);
    }
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

/**
 * Check whether cached data can serve the current broadcast day.
 *
 * @param {object} data - Normalized guide data.
 * @param {Date} now - Current local time.
 * @returns {boolean} Whether usable guide data is present.
 */
function hasUsableGuide(data, now = new Date()) {
    if (!data || !Array.isArray(data.channels) || !data.channels.length) {
        return false;
    }
    if (!Array.isArray(data.categories) || !Array.isArray(data.genres)) {
        return false;
    }
    const day = broadcastDay(now.toISOString());
    return Array.isArray(data.program?.[day]) && data.program[day].length > 0;
}

/**
 * Compute the next local daily download including jitter.
 *
 * @param {Date} now - Current time.
 * @param {string} time - Configured HH:mm time.
 * @param {() => number} random - Random number supplier.
 * @returns {Date} Next execution time.
 */
function nextDownload(now, time, random = Math.random) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time || '03:30');
    if (!match) {
        throw new Error(`Invalid download time: ${time}`);
    }
    const next = new Date(now);
    next.setHours(+match[1], +match[2], 0, 0);
    next.setTime(next.getTime() + Math.floor(random() * 3600000));
    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

/**
 * Parse an XMLTV stream and normalize it for existing widgets.
 *
 * @param {import('node:stream').Readable} stream - XML stream.
 * @returns {Promise<object>} Normalized channel and daily programme data.
 */
function parseXmltv(stream) {
    return new Promise((resolve, reject) => {
        const parser = new SaxesParser();
        const channels = [];
        const programmes = {};
        const categoryNames = new Set();
        let channel = null;
        let programme = null;
        let content = '';
        let failed = false;
        const fail = error => {
            if (!failed) {
                failed = true;
                stream.destroy();
                reject(error);
            }
        };

        parser.on('opentag', tag => {
            content = '';
            if (tag.name === 'channel') {
                channel = { sourceId: tag.attributes.id, name: '', logo: '' };
            } else if (tag.name === 'programme') {
                programme = {
                    sourceId: tag.attributes.channel,
                    startTime: xmltvDate(tag.attributes.start),
                    endTime: xmltvDate(tag.attributes.stop),
                    title: '',
                    description: '',
                    category: '',
                    logo: '',
                    year: null,
                    seasonNumber: null,
                    episodeNumber: null,
                };
            } else if (tag.name === 'icon') {
                if (programme) {
                    programme.logo = tag.attributes.src || '';
                } else if (channel) {
                    channel.logo = tag.attributes.src || '';
                }
            }
        });
        parser.on('text', value => {
            content += value;
        });
        parser.on('cdata', value => {
            content += value;
        });
        parser.on('closetag', tag => {
            const name = tag.name;
            if (channel && name === 'display-name' && !channel.name) {
                channel.name = content.trim();
            }
            if (programme) {
                if (name === 'title' && !programme.title) {
                    programme.title = content.trim();
                }
                if (name === 'desc' && !programme.description) {
                    programme.description = content.trim();
                }
                if (name === 'category' && !programme.category) {
                    programme.category = content.trim();
                }
                if (name === 'date' && /^\d{4}/.test(content)) {
                    programme.year = content.slice(0, 4);
                }
                if (name === 'episode-num' && tag.attributes?.system === 'xmltv_ns') {
                    const numbers = content.trim().split('.');
                    if (/^\d+$/.test(numbers[0])) {
                        programme.seasonNumber = +numbers[0] + 1;
                    }
                    if (/^\d+$/.test(numbers[1])) {
                        programme.episodeNumber = +numbers[1] + 1;
                    }
                }
            }
            if (name === 'channel' && channel) {
                channels.push(channel);
                channel = null;
            }
            if (name === 'programme' && programme) {
                if (
                    programme.startTime &&
                    programme.endTime &&
                    programme.title &&
                    new Date(programme.endTime) > new Date(programme.startTime)
                ) {
                    const date = broadcastDay(programme.startTime);
                    if (!programmes[date]) {
                        programmes[date] = [];
                    }
                    programmes[date].push({
                        id: stableId(
                            `programme:${programme.sourceId}:${programme.startTime}:${programme.endTime}:${programme.title}`,
                        ),
                        channel: stableId(`channel:${programme.sourceId}`),
                        title: programme.title,
                        startTime: programme.startTime,
                        endTime: programme.endTime,
                        airDate: date,
                        content: {
                            category: programme.category ? stableId(`category:${programme.category}`) : null,
                            country: null,
                            year: programme.year,
                            episodeNumber: programme.episodeNumber,
                            seasonNumber: programme.seasonNumber,
                            texts: { VeryShort: { value: '' }, Long: { value: programme.description } },
                        },
                        photo: { url: programme.logo },
                    });
                    if (programme.category) {
                        categoryNames.add(programme.category);
                    }
                }
                programme = null;
            }
            content = '';
        });
        parser.on('error', fail);
        stream.on('data', chunk => {
            try {
                parser.write(chunk);
            } catch (error) {
                fail(error);
            }
        });
        stream.on('error', fail);
        stream.on('end', () => {
            if (failed) {
                return;
            }
            try {
                parser.close();
                const normalizedChannels = channels.map((ch, order) => ({
                    id: stableId(`channel:${ch.sourceId}`),
                    channelId: ch.sourceId,
                    name: ch.name,
                    order,
                    logo: ch.logo,
                    logoName: logoName(ch.sourceId),
                }));
                const categories = [...categoryNames]
                    .sort()
                    .map(title => ({ id: stableId(`category:${title}`), title }));
                if (!categories.length) {
                    categories.push({ id: stableId('category:Other'), title: 'Other' });
                }
                resolve({ channels: normalizedChannels, categories, genres: categories, program: programmes });
            } catch (error) {
                reject(error);
            }
        });
    });
}

module.exports = {
    countryCodes,
    sourceIdentity,
    sourceChanged,
    stableId,
    logoName,
    xmltvDate,
    broadcastDay,
    hasUsableGuide,
    nextDownload,
    parseXmltv,
};
