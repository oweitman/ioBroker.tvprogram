'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Return the oldest of the retained local calendar days.
 * Today counts as the first retained day.
 *
 * @param {Date} now Current time.
 * @param {number} days Number of calendar days to retain.
 * @returns {string} Date in YYYY-MM-DD format.
 */
function retentionCutoff(now = new Date(), days = 5) {
    const cutoff = new Date(now);
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Math.max(0, days - 1));
    const year = cutoff.getFullYear();
    const month = `${cutoff.getMonth() + 1}`.padStart(2, '0');
    const day = `${cutoff.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Decide whether cached programme data missing from a provider response may be retained.
 *
 * @param {string} date Programme date in YYYY-MM-DD format.
 * @param {Date} now Current time.
 * @param {number} days Number of calendar days to retain.
 * @returns {boolean} True for today and the retained historical days.
 */
function retainMissingProgramme(date, now = new Date(), days = 5) {
    const today = retentionCutoff(now, 1);
    return date >= retentionCutoff(now, days) && date <= today;
}

/**
 * Select dated programme files that fall outside the retention window.
 *
 * @param {string[]} files Cache directory entries.
 * @param {Date} now Current time.
 * @param {number} days Number of calendar days to retain.
 * @returns {string[]} Expired programme file names.
 */
function expiredProgrammeFiles(files, now = new Date(), days = 5) {
    const cutoff = retentionCutoff(now, days);
    return files.filter(file => /^\d{4}-\d{2}-\d{2}\.json$/.test(file) && file.slice(0, 10) < cutoff);
}

/**
 * Read selections from a cache file.
 *
 * @param {string} file Cache file path.
 * @returns {Promise<object | null>} Parsed selections or null for a missing/invalid file.
 */
async function readSelectionFile(file) {
    try {
        const selections = JSON.parse(await fs.promises.readFile(file, 'utf8'));
        return selections && typeof selections === 'object' && !Array.isArray(selections) ? selections : null;
    } catch {
        return null;
    }
}

/**
 * Persist selections after ensuring that their cache directory exists.
 *
 * @param {string} file Cache file path.
 * @param {object} selections Selections by source identity.
 */
async function writeSelectionFile(file, selections) {
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, JSON.stringify(selections));
}

module.exports = {
    expiredProgrammeFiles,
    readSelectionFile,
    retentionCutoff,
    retainMissingProgramme,
    writeSelectionFile,
};
