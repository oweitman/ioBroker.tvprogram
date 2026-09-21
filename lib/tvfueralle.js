'use strict';

const https = require('node:https');
const axios = require('axios').default;

const baseUrl = 'https://tvfueralle.de/api';
const client = axios.create({ timeout: 120000 });
const expiredCertificateAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Retry only an expired TV für alle certificate. All other TLS failures stay fatal.
 *
 * @param {string} url - API URL.
 * @returns {Promise<import('axios').AxiosResponse>} HTTP response.
 */
async function get(url) {
    try {
        return await client.get(url);
    } catch (error) {
        if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'CERT_HAS_EXPIRED') {
            throw error;
        }
        return client.get(url, { httpsAgent: expiredCertificateAgent });
    }
}

/** @returns {Promise<import('axios').AxiosResponse>} Categories. */
function getCategories() {
    return get(`${baseUrl}/categories`);
}

/** @returns {Promise<import('axios').AxiosResponse>} Channels. */
function getChannels() {
    return get(`${baseUrl}/channels`);
}

/** @returns {Promise<import('axios').AxiosResponse>} Genres. */
function getGenres() {
    return get(`${baseUrl}/genres`);
}

/**
 * @param {string} date - Local YYYY-MM-DD date.
 * @returns {Promise<import('axios').AxiosResponse>} Broadcasts.
 */
function getProgram(date) {
    return get(`${baseUrl}/broadcasts/${date}`);
}

module.exports = { get, getCategories, getChannels, getGenres, getProgram };
