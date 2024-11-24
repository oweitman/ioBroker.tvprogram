/* eslint-disable jsdoc/check-tag-names */
const http = require('https');
const utils = require('@iobroker/adapter-core');
const fs = require('fs');
const axios = require('axios').default;
/**
 * A class for managing TV program data and interactions.
 *
 * @param adapter - The adapter instance used for communication with the ioBroker system.
 *
 * This class initializes and manages TV program data, including channels, categories, genres, and broadcast events.
 * It provides methods for interacting with the data, processing messages, handling state changes, and managing the
 * filesystem. The class uses various APIs to fetch TV program data and stores it locally. It supports observing
 * state changes and responding to specific commands.
 */
function tvprogramclass(adapter) {
    const api_channels = 'https://tvfueralle.de/api/channels';
    const api_categories = 'https://tvfueralle.de/api/categories';
    const api_genres = 'https://tvfueralle.de/api/genres';
    const api_program = 'https://tvfueralle.de/api/broadcasts/%DATE%';

    const dataDir = `${utils.getAbsoluteDefaultDataDir() + adapter.name}/`;

    this.stateTemplate = {
        selectchannel: {
            name: 'selectchannel',
            read: true,
            write: true,
            type: 'string',
            role: 'value',
        },
        name: {
            name: 'name',
            read: true,
            write: true,
            type: 'string',
            role: 'value',
        },
        config: {
            name: 'config',
            read: true,
            write: false,
            type: 'string',
            role: 'value',
        },
        favorites: {
            name: 'favorites',
            read: true,
            write: false,
            type: 'string',
            role: 'value',
        },
        channelfilter: {
            name: 'channelfilter',
            read: true,
            write: false,
            type: 'string',
            role: 'value',
        },
        show: {
            name: 'show',
            read: true,
            write: false,
            type: 'string',
            role: 'value',
        },
        cmd: {
            name: 'cmd',
            read: true,
            write: false,
            type: 'string',
            role: 'value',
        },
        record: {
            name: 'record',
            read: true,
            write: true,
            type: 'string',
            role: 'value',
        },
    };

    this.adapter = adapter;
    this.log = {};
    this.islogsilly = true;
    this.islogdebug = true;
    this.observers = [];
    this.tvdata = {};
    this.tvdata.program = {};

    this.init = function () {
        this.setState('connection', true, 'info');
        this.checkFilesystem();
        this.doObserver();
    };
    this.doObserver = function () {
        this.logsilly('doObserver');
        this.getTVDatapoints(tvs => this.newTVDatapoints(tvs, this.getData.bind(this)));
        this.setTimeout('doObserver', this.doObserver.bind(this), 60 * 60 * 1000);
    };
    this.removeFiles = function () {
        fs.readdir(`${dataDir}program/`, (err, files) => {
            files.forEach(file => {
                if ((+new Date() - +new Date(file.split('.')[0])) / (1000 * 60 * 60 * 24) > 5) {
                    fs.unlinkSync(`${dataDir}program/${file}`);
                }
            });
        });
    };
    this.checkFilesystem = function () {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        if (!fs.existsSync(`${dataDir}program/`)) {
            fs.mkdirSync(`${dataDir}program/`);
        }
    };

    this.processMessages = function (msg) {
        this.logdebug(`processMessages ${JSON.stringify(msg)}`);
        if (msg.command === 'getServerData') {
            this.logdebug('send getServerData');
            this.getServerDataMsg(msg);
        }
        if (msg.command === 'getServerTVProgram') {
            this.logdebug('send getServerData');
            this.getServerTVProgramMsg(msg);
        }
        if (msg.command === 'getServerBroadcast') {
            this.logdebug('send getServerBroadcast');
            this.getServerBroadcastMsg(msg);
        }
        if (msg.command === 'getServerTest') {
            this.logdebug('send getServerTest');
            this.getServerTestMsg(msg);
        }
        if (msg.command === 'getFavoritesData') {
            this.logdebug('send getFavoritesData');
            this.getFavoritesDataMsg(msg);
        }
        if (msg.command === 'getServerBroadcastNow') {
            this.logdebug('send getServerBroadcastNow');
            this.getServerBroadcastNowMsg(msg);
        }
        if (msg.command === 'getServerBroadcastDate') {
            this.logdebug('send getServerBroadcastDate');
            this.getServerBroadcastDateMsg(msg);
        }
        if (msg.command === 'getServerBroadcastRange') {
            this.logdebug('send getServerBroadcastRange');
            this.getServerBroadcastRangeMsg(msg);
        }

        if (msg.command === 'getServerBroadcastFind') {
            this.logdebug('send getServerBroadcastFind');
            this.getServerBroadcastFindMsg(msg);
        }
        if (msg.command === 'getServerTVs') {
            this.logdebug('send getServerTVs');
            this.getServerTVsMsg(msg);
        }
        if (msg.command === 'getServerInfo') {
            this.logdebug('send getServerInfo');
            this.getServerInfoMsg(msg);
        }
        if (msg.command === 'setValueAck') {
            this.logdebug('send setValueAck');
            this.setValueAckMsg(msg);
        }
    };
    this.doStateChange = function (id, state) {
        this.logsilly('doStateChange');
        // Warning, state can be null if it was deleted
        if (!id || !state) {
            return;
        }
        const idParts = id.split('.');
        idParts.shift();
        idParts.shift();
        if (state.ack && idParts[1] === 'cmd') {
            if (idParts[1] === 'cmd') {
                this.doStateChangeCmd(idParts, state);
            }
        } else {
            return;
        }
        if (idParts[1] === 'selectchannel') {
            this.doStateChangeSelectChannel(idParts, state);
        }
        if (idParts[1] === 'name') {
            this.doStateChangeName(idParts, state);
        }
        if (idParts[1] === 'config') {
            this.doStateChangeConfig(idParts, state);
        }
        if (idParts[1] === 'favorites') {
            this.doStateChangeFavorites(idParts, state);
        }
        if (idParts[1] === 'channelfilter') {
            this.doStateChangeChannelfilter(idParts, state);
        }
        if (idParts[1] === 'show') {
            this.doStateChangeShow(idParts, state);
        }
        if (idParts[1] === 'record') {
            this.doStateChangeRecord(idParts, state);
        }
    };
    this.doStateChangeName = function (idParts, state) {
        this.logdebug('doStateChangeName');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '', idParts[0]);
        }
    };
    this.doStateChangeConfig = function (idParts, state) {
        this.logdebug('doStateChangeConfig');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '', idParts[0]);
        }
    };
    this.doStateChangeFavorites = function (idParts, state) {
        this.logdebug('doStateChangeFavorites');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '[]', idParts[0]);
        }
    };
    this.doStateChangeChannelfilter = function (idParts, state) {
        this.logdebug('doStateChangeChannelfilter');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '[]', idParts[0]);
        }
    };
    this.doStateChangeShow = function (idParts, state) {
        this.logdebug('doStateChangeShow');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '1', idParts[0]);
        }
    };
    this.doStateChangeSelectChannel = function (idParts, state) {
        this.logdebug('doStateChangeSelectChannel');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '', idParts[0]);
        }
    };
    this.doStateChangeCmd = function (idParts, state) {
        this.logdebug('doStateChangeCmd');
        if (typeof state.val === 'string' && state.val !== '') {
            this.setState(idParts[1], '', idParts[0]);
        }
    };
    this.doStateChangeRecord = function (idParts, state) {
        this.logdebug('doStateChangeRecord');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val, idParts[0]);
        }
    };

    this.getServerDataMsg = function (msg) {
        this.logsilly('getServerDataMsg ');
        let data = 'error1';
        if (typeof msg.message === 'string' && msg.message !== '') {
            if (this.tvdata[msg.message]) {
                data = this.tvdata[msg.message];
            } else {
                data = 'nodata';
            }
        }
        this.logdebug(
            `getServerDataMsg send${msg.from} ${msg.command} ${JSON.stringify(data).substring(0, 100)} ${msg.callback}`,
        );
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerTVProgramMsg = function (msg) {
        this.logsilly('getServerTVProgramMsg ');
        let data = 'error';
        if (typeof msg.message === 'string' && msg.message !== '') {
            const datum = msg.message;
            if (this.tvdata['program'][datum]) {
                data = JSON.parse(JSON.stringify(this.tvdata['program'][datum]));
                data = this.shrinkTVProgramNoText(data);
            } else {
                data = 'nodata';
            }
        }
        this.logdebug(
            `getServerDataMsg send${msg.from} ${msg.command} ${JSON.stringify(data).substring(0, 100)} ${msg.callback}`,
        );
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerTVsMsg = function (msg) {
        this.logsilly('getServerTVsMsg ');
        const data = 'error';
        /*
        if (typeof msg.message==="object") {
            this.adapter.getForeignObjects
        }
*/
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerBroadcastRangeMsg = function (msg) {
        this.logsilly('getServerBroadcastRangeMsg ');
        let data = [];
        if (typeof msg.message === 'object') {
            const channelfilter = msg.message.channelfilter;
            const dstart = new Date(msg.message.startdate);
            const dend = new Date(msg.message.enddate);
            while (dstart <= dend) {
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    data = data.concat(
                        this.tvdata.program[datum].reduce((acc, el) => {
                            let i;
                            if (
                                (i = channelfilter.indexOf(el.channel)) > -1 &&
                                new Date(el.startTime) <= dstart &&
                                new Date(el.endTime) > dend
                            ) {
                                if (!acc[i]) {
                                    acc[i] = {};
                                }
                                if (!acc[i].events) {
                                    acc[i].events = [];
                                }
                                acc[i].channel = el.channel;
                                acc[i].events.push(el);
                            }
                            return acc;
                        }, []),
                    );
                }
                dstart.setDate(dstart.getDate() + 1);
            }
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerBroadcastNowMsg = function (msg) {
        this.logsilly('getServerBroadcastNowMsg ');
        let data = [];
        if (typeof msg.message === 'object') {
            const channelfilter = msg.message;
            const dstart = new Date();
            const dend = new Date();
            dstart.setDate(dstart.getDate() - 1);
            dend.setDate(dend.getDate() + 1);
            while (dstart <= dend) {
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    data = data.concat(
                        this.tvdata.program[datum].reduce((acc, el) => {
                            let i;
                            if (
                                (i = channelfilter.indexOf(el.channel)) > -1 &&
                                new Date(el.startTime) <= new Date() &&
                                new Date(el.endTime) > new Date()
                            ) {
                                if (!acc[i]) {
                                    acc[i] = {};
                                }
                                if (!acc[i].events) {
                                    acc[i].events = [];
                                }
                                acc[i].channel = el.channel;
                                acc[i].events.push(el);
                            }
                            return acc;
                        }, []),
                    );
                }
                dstart.setDate(dstart.getDate() + 1);
            }
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerBroadcastFindMsg = function (msg) {
        this.logsilly('getServerBroadcastFindMsg ');
        let data = [];
        if (typeof msg.message === 'object') {
            const channelfilter = msg.message.channelfilter || [];
            const categoryfilter = msg.message.categoryfilter || [];
            let textfilter = msg.message.textfilter || '';
            textfilter = textfilter.trim().toLowerCase();
            const dstart = new Date(msg.message.datefrom);
            const dend = new Date(msg.message.datetill);
            const dstartfind = new Date(msg.message.datefrom);
            const dendfind = new Date(msg.message.datetill);
            const maxresults = msg.message.maxresults || 10;
            dstart.setDate(dstart.getDate() - 1);
            dend.setDate(dend.getDate() + 1);
            while (dstart <= dend) {
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    data = data.concat(
                        this.tvdata.program[datum].reduce((acc, el) => {
                            let i,
                                count = 0;
                            if (
                                (i = channelfilter.indexOf(el.channel)) > -1 &&
                                new Date(el.startTime) >= dstartfind &&
                                new Date(el.endTime) <= dendfind &&
                                (categoryfilter.length === 0 || categoryfilter.includes(el.content.category)) &&
                                (textfilter === ''
                                    ? true
                                    : (
                                          el.title + el.content.texts.Long.value ||
                                          `${el.content.texts.VeryShort.value}` ||
                                          ''
                                      )
                                          .toLowerCase()
                                          .includes(textfilter))
                            ) {
                                if (count < maxresults) {
                                    if (!acc[i]) {
                                        acc[i] = {};
                                    }
                                    if (!acc[i].events) {
                                        acc[i].events = [];
                                    }
                                    acc[i].channel = el.channel;
                                    acc[i].events.push(el);
                                    count++;
                                }
                            }
                            return acc;
                        }, []),
                    );
                }
                dstart.setDate(dstart.getDate() + 1);
            }
            data = data.filter(el => el != null);
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerBroadcastDateMsg = function (msg) {
        this.logsilly('getServerBroadcastDateMsg ');
        let data = null;
        if (typeof msg.message === 'object') {
            const channelfilter = msg.message.channelfilter;
            const date = new Date(msg.message.date);
            const dstart = new Date(date);
            const dend = new Date(date);
            dstart.setDate(dstart.getDate() - 1);
            dend.setDate(dend.getDate() + 1);
            while (dstart <= dend) {
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    this.tvdata.program[datum].forEach(el => {
                        if (!Array.isArray(data)) {
                            data = [];
                        }
                        let i;
                        if (
                            (i = channelfilter.indexOf(el.channel)) > -1 &&
                            new Date(el.startTime) <= date &&
                            new Date(el.endTime) > date
                        ) {
                            if (!data[i]) {
                                data[i] = {};
                            }
                            if (!data[i].events) {
                                data[i].events = [];
                            }
                            data[i].channel = el.channel;
                            data[i].events.push(el);
                        }
                    });
                }
                dstart.setDate(dstart.getDate() + 1);
            }
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data == null ? 'error' : data, msg.callback);
        }
    };
    this.getFavoritesDataMsg = function (msg) {
        this.logsilly('getFavoritesDataMsg ');
        let data = [];
        if (typeof msg.message === 'object') {
            const favorites = msg.message;
            let result = [];
            const dstart = new Date();
            const dend = new Date();
            const channels = this.tvdata.channels;
            dend.setDate(dend.getDate() + 5);
            while (dstart <= dend) {
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    result = result.concat(
                        this.tvdata.program[datum]
                            .filter(el => favorites.includes(el.title))
                            .map(
                                function (channels, el) {
                                    const channel = channels.find(ch => ch.id === el.channel);
                                    el.viewdate = datum;
                                    el.channelid = channel.channelId || '';
                                    el.channelname = channel.name || '';
                                    return el;
                                }.bind(this, channels),
                            ),
                    );
                }
                dstart.setDate(dstart.getDate() + 1);
            }
            data = result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerTestMsg = function (msg) {
        this.logsilly('getServerTestMsg ');
        let data = 'error';
        let events;
        if (typeof msg.message === 'object') {
            if (this.tvdata['program'][msg.message.viewdate]) {
                events = this.tvdata['program'][msg.message.viewdate];
            }
            if (events) {
                data = events.find(el => el.id === msg.message.eventid);
            }
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.setValueAckMsg = function (msg) {
        this.logsilly('setValueAckMsg ');
        const data = {};
        if (typeof msg.message === 'object') {
            const id = msg.message.id;
            const value = msg.message.value;
            this.setState(id, value);
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerInfoMsg = function (msg) {
        this.logsilly('getServerInfoMsg ');
        const data = {};
        data.tvprogram = Object.keys(this.tvdata['program']).sort();
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getServerBroadcastMsg = function (msg) {
        this.logsilly('getServerBroadcastMsg ');
        let data = 'error';
        let events;
        if (typeof msg.message === 'object') {
            msg.message.eventid = parseInt(msg.message.eventid);
            if (this.tvdata['program'][msg.message.viewdate]) {
                events = this.tvdata['program'][msg.message.viewdate];
            }
            if (events) {
                data = events.find(el => el.id === msg.message.eventid);
            }
        }
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    this.getTVDatapoints = function (callback) {
        this.logsilly('getTVDatapoints ');
        const id = this.adapter.namespace;
        const options = { startkey: `${id}.`, endkey: `${id}.\u9999`, include_docs: true };
        this.adapter.getObjectView('system', 'state', options).then(objects => {
            const _objects = {};
            if (objects && objects.rows) {
                for (let i = 0; i < objects.rows.length; i++) {
                    _objects[objects.rows[i].id] = objects.rows[i].value;
                }
            }
            objects = _objects;
            const tvs = [];
            for (const prop in objects) {
                if (prop.split('.')[3] === 'config') {
                    tvs.push(prop.split('.')[2]);
                }
            }
            tvs.sort();
            callback(tvs);
        });
    };
    this.newTVDatapoints = function (tvs, callback) {
        this.logsilly('newTVDatapoints ');
        const promises = [];
        if (this.adapter.config.tvcount !== tvs.length) {
            for (let i = 1; tvs.length < this.adapter.config.tvcount; i++) {
                if (!tvs.includes(`tv${i}`)) {
                    promises.push(new Promise(resolve => this.createDatapointsPath(`tv${i}`, resolve)));
                    tvs.push(`tv${i}`);
                }
            }
        }
        Promise.all(promises).then(() => {
            if (callback) {
                callback(tvs);
            }
        });
    };
    this.shrinkTVProgramWithText = function (tvprogram) {
        tvprogram.forEach((el, index) => {
            tvprogram[index] = (({
                id,
                channel,
                title,
                startTime,
                endTime,
                airDate,
                content: {
                    category,
                    country,
                    year,
                    episodeNumber,
                    seasonNumber,
                    texts: { VeryShort: { value: valuevs = undefined } = {}, Long: { value: valuel = undefined } = {} },
                },
                photo: { url = undefined } = {},
            }) => ({
                id: id,
                channel: channel,
                title,
                startTime: startTime,
                endTime: endTime,
                airDate: airDate,
                content: {
                    category: category,
                    country: country,
                    year: year,
                    episodeNumber: episodeNumber,
                    seasonNumber: seasonNumber,
                    texts: {
                        VeryShort: {
                            value: valuevs,
                        },
                        Long: {
                            value: valuel,
                        },
                    },
                },
                photo: {
                    url: url,
                },
            }))(el);
        });
        return tvprogram;
    };
    this.shrinkTVProgramNoText = function (tvprogram) {
        tvprogram.forEach((el, index) => {
            tvprogram[index] = (({
                id,
                channel,
                title,
                startTime,
                endTime,
                airDate,
                photo: { url = undefined } = {},
            }) => ({
                id: id,
                channel: channel,
                title,
                startTime: startTime,
                endTime: endTime,
                airDate: airDate,
                photo: {
                    url: url,
                },
            }))(el);
        });
        return tvprogram;
    };
    this.createDatapointsPath = function (path, callback) {
        const pName = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplatename = JSON.parse(JSON.stringify(this.stateTemplate['name']));
                this.createObjectNotExist(stateTemplatename, path, null, () => {
                    this.setState(stateTemplatename.name, path, path);
                    resolve();
                });
            })
        );
        const pConfig = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplateconfig = JSON.parse(JSON.stringify(this.stateTemplate['config']));
                this.createObjectNotExist(stateTemplateconfig, path, null, () => {
                    this.setState(stateTemplateconfig.name, '{}', path);
                    resolve();
                });
            })
        );
        const pFavorites = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplatefavorites = JSON.parse(JSON.stringify(this.stateTemplate['favorites']));
                this.createObjectNotExist(stateTemplatefavorites, path, null, () => {
                    this.setState(stateTemplatefavorites.name, '[]', path);
                    resolve();
                });
            })
        );
        const pChannelfilter = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplatechannelfilter = JSON.parse(JSON.stringify(this.stateTemplate['channelfilter']));
                this.createObjectNotExist(stateTemplatechannelfilter, path, null, () => {
                    this.setState(stateTemplatechannelfilter.name, '[]', path);
                    resolve();
                });
            })
        );
        const pShow = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplateshow = JSON.parse(JSON.stringify(this.stateTemplate['show']));
                this.createObjectNotExist(stateTemplateshow, path, null, () => {
                    this.setState(stateTemplateshow.name, '1', path);
                    resolve();
                });
            })
        );
        const pChannel = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplateselch = JSON.parse(JSON.stringify(this.stateTemplate['selectchannel']));
                this.createObjectNotExist(stateTemplateselch, path, null, () => {
                    this.setState(stateTemplateselch.name, '', path);
                    resolve();
                });
            })
        );
        const pCmd = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplateselcmd = JSON.parse(JSON.stringify(this.stateTemplate['cmd']));
                this.createObjectNotExist(stateTemplateselcmd, path, null, () => {
                    this.setState(stateTemplateselcmd.name, '', path);
                    resolve();
                });
            })
        );
        const pRecord = /** @type {Promise<void>} */ (
            new Promise(resolve => {
                const stateTemplateselrecord = JSON.parse(JSON.stringify(this.stateTemplate['record']));
                this.createObjectNotExist(stateTemplateselrecord, path, null, () => {
                    this.setState(stateTemplateselrecord.name, '', path);
                    resolve();
                });
            })
        );
        Promise.all([pName, pConfig, pFavorites, pChannelfilter, pShow, pChannel, pCmd, pRecord]).then(() => {
            if (callback) {
                callback();
            }
        });
    };
    this.getData = async function (tvs) {
        this.logsilly('getData');
        let catresponse = await this.getCategoriesAsync();
        if (JSON.stringify(this.tvdata.categories) !== JSON.stringify(catresponse.data.category)) {
            this.logdebug('getData first request or changed data categories');
            this.writeFile('categories.json', catresponse.data.category);
            this.tvdata.categories = catresponse.data.category;
            tvs.map(tv => this.setState('cmd', 'new|categories', tv));
        }
        /* this.getCategories(data => {
            if (data === 'error') {
                data = this.readFileSync('categories.json');
                if (data === 'error') {
                    data = { category: [] };
                }
            }
            if (JSON.stringify(this.tvdata.categories) !== JSON.stringify(data.category)) {
                this.logdebug('getData first request or changed data categories');
                this.writeFile('categories.json', data.category);
                this.tvdata.categories = data.category;
                tvs.map(tv => this.setState('cmd', 'new|categories', tv));
            }
        }); */
        let chnresponse = await this.getChannelsAsync();
        if (JSON.stringify(this.tvdata.channels) !== JSON.stringify(chnresponse.data.channels)) {
            this.logdebug('getData first request or changed data channels');
            this.writeFile('channels.json', chnresponse.data.channels);
            this.tvdata.channels = chnresponse.data.channels;
            tvs.map(tv => this.setState('cmd', 'new|channels', tv));
        }
        /*this.getChannels(data => {
            if (data === 'error') {
                data = this.readFileSync('channels.json');
                if (data === 'error') {
                    data = { channels: [] };
                }
            }
            if (JSON.stringify(this.tvdata.channels) !== JSON.stringify(data.channels)) {
                this.logdebug('getData first request or changed data channels');
                this.writeFile('channels.json', data.channels);
                this.tvdata.channels = data.channels;
                tvs.map(tv => this.setState('cmd', 'new|channels', tv));
            }
        }); */
        let genresponse = await this.getGenresAsync();
        if (JSON.stringify(this.tvdata.genres) !== JSON.stringify(genresponse.data.genres)) {
            this.logdebug('getData first request or changed data genres');
            this.writeFile('genres.json', genresponse.data.genres);
            this.tvdata.genres = genresponse.data.genres;
            tvs.map(tv => this.setState('cmd', 'new|genres', tv));
        }
        /*this.getGenres(data => {
            if (data === 'error') {
                data = this.readFileSync('genres.json');
                if (data === 'error') {
                    data = { genres: [] };
                }
            }
            // convert the genres data object. it ist a object with many numeric properties that hold a genre object. please convert this object to an array of genres objects
            if (JSON.stringify(this.tvdata.genres) !== JSON.stringify(data.genres)) {
                this.logdebug('getData first request or changed data genres');
                data.genres = Object.values(data.genres);
                this.writeFile('genres.json', data.genres);
                this.tvdata.genres = data.genres;
                tvs.map(tv => this.setState('cmd', 'new|genres', tv));
            }
        }); */
        let dstart = new Date();
        dstart.setDate(dstart.getDate() - 5);
        let dend = new Date();
        dend.setDate(dend.getDate() + 5);
        while (dstart <= dend) {
            let response = await this.getProgramAsync(dstart);
            let datum = this.formatedDate(dstart);
            let events = this.shrinkTVProgramWithText(response.data.events);
            if (JSON.stringify(this.tvdata.program[datum]) !== JSON.stringify(events)) {
                this.logdebug(`getData first request or changed data events ${datum}`);
                this.writeFile(`program/${datum}.json`, events);
                this.tvdata.program[datum] = events;
                tvs.map(tv => this.setState('cmd', `new|program|${datum}`, tv));
            }

            dstart.setDate(dstart.getDate() + 1);
        }
        dstart = new Date();
        dstart.setDate(dstart.getDate() - 5);
        dend = new Date();
        dend.setDate(dend.getDate() + 5);
        while (dstart >= dend) {
            const data = this.readFileSync(`program/${this.formatedDate(dstart)}.json`);
            if (data === 'error') {
                dstart.setDate(dstart.getDate() - 1);
                continue;
            }
            this.tvdata.program[this.formatedDate(dstart)] = data.events;
            dstart.setDate(dstart.getDate() - 1);
        }
        this.removeFiles();
    };
    this.getProgram = function (datum, callback) {
        this.logsilly('getProgram');
        if (!(datum && datum.getUTCDate())) {
            return '';
        }
        const options = {
            '%DATE%': this.formatedDate(datum),
        };
        return this.request(this.getUrlFromTemplate(options, api_program), callback);
    };
    this.getProgramAsync = async function (datum) {
        this.logsilly('getProgram');
        const options = {
            '%DATE%': this.formatedDate(datum),
        };
        return await axios.get(this.getUrlFromTemplate(options, api_program));
    };
    this.formatedDate = function (datum) {
        return `${datum.getFullYear()}-${`0${datum.getMonth() + 1}`.slice(-2)}-${`0${datum.getDate()}`.slice(-2)}`;
    };
    this.calcDate = function (datum) {
        const d = new Date(datum);
        const time = d.getHours() + d.getMinutes() / 60;
        if (time >= 0 && time < 5) {
            d.setDate(d.getDate() - 1);
        }
        return d;
    };
    this.getCategories = function (callback) {
        this.logsilly('getCategories');
        return this.request(api_categories, callback);
    };
    this.getCategoriesAsync = async function () {
        this.logsilly('getCategories');
        return await axios.get(api_categories);
    };
    this.getChannels = function (callback) {
        this.logsilly('getChannels');
        return this.request(api_channels, callback);
    };
    this.getChannelsAsync = async function () {
        this.logsilly('getChannels');
        return await axios.get(api_channels);
    };
    this.getGenres = function (callback) {
        this.logsilly('getData');
        return this.request(api_genres, callback);
    };
    this.getGenresAsync = async function () {
        this.logsilly('getData');
        return await axios.get(api_genres);
    };
    this.getUrlFromTemplate = function (options, urltemplate) {
        return urltemplate.replace(/%\w+%/g, function (option) {
            return options[option] || option;
        });
    };
    this.request = function (url, callback) {
        this.logdebug(`request url ${url}`);
        http.get(url, res => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error(
                    // @ts-expect-error no type for servername
                    `Request Failed.\n` + `Status Code: ${statusCode} ${res.connection.servername}${res.req.path}`,
                );
            } else if (!/^application\/json/.test(contentType || '')) {
                error = new Error(
                    `Invalid content-type.\n` +
                        `Expected application/json but received ${contentType} ${
                            // @ts-expect-error no type for servername
                            res.connection.servername
                            // @ts-expect-error no type for path
                        }${res.req.path}`,
                );
            }
            if (error) {
                this.logerror(error.message);
                res.resume();
                callback('error');
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', chunk => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    this.logsilly('request rawData');
                    const parsedData = JSON.parse(rawData);
                    callback(parsedData);
                } catch (e) {
                    // @ts-expect-error no type
                    this.logerror(e.message);
                }
            });
        }).on('error', e => {
            // @ts-expect-error no type
            switch (e.code) {
                case 'ECONNRESET':
                    // @ts-expect-error no type for hostname
                    this.logerror(`Server didnt Respond: ${e.hostname} Please try again later. ${e.message}`);
                    break;
                case 'ENOTFOUND':
                    // @ts-expect-error no type for hostname
                    this.logerror(`Address not found: ${e.hostname} ${e.message}`);
                    break;
                default:
                    this.logerror(e.message);
                    break;
            }
            callback('error');
        });
    };
    this.createObject = function (stateTemplate, level1path, level2path, callback) {
        this.logdebug(`createObject ${stateTemplate.name}`);
        const name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + stateTemplate.name;
        this.adapter.getObject(name, (err, obj) => {
            const newobj = {
                type: 'state',
                common: stateTemplate,
                native: {},
            };
            if (!obj) {
                callback ? this.adapter.setObject(name, newobj, callback) : this.adapter.setObject(name, newobj);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    };
    this.createObjectNotExist = function (stateTemplate, level1path, level2path, callback) {
        this.logdebug(`createObjectNotExist ${stateTemplate.name}`);
        const name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + stateTemplate.name;
        const newobj = {
            type: 'state',
            common: stateTemplate,
            native: {},
        };
        callback
            ? this.adapter.setObjectNotExists(name, newobj, callback)
            : this.adapter.setObjectNotExists(name, newobj);
    };
    this.getState = function (id, level1path, level2path, callback) {
        this.logdebug(`getState ${id}`);
        const name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + id;
        this.adapter.getState(name, callback);
    };
    this.setState = function (name, value, level1path, level2path, callback) {
        this.logdebug(`setState ${name}`);
        name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + name;
        this.logdebug(`setState name: ${name}` /*+ ' value: ' + value*/);
        callback ? this.adapter.setState(name, value, true, callback) : this.adapter.setState(name, value, true);
    };
    this.setStateNoAck = function (name, value, level1path, level2path, callback) {
        this.logdebug(`setState ${name}`);
        name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + name;
        this.logdebug(`setState name: ${name}` /*+ ' value: ' + value*/);
        callback ? this.adapter.setState(name, value, false, callback) : this.adapter.setState(name, value, false);
    };
    this.writeFile = function (filename, data, callback) {
        if (typeof data != 'string') {
            data = JSON.stringify(data);
        }
        fs.writeFile(dataDir + filename, data, err => {
            if (err) {
                this.logdebug(`Error saving file ${filename}! ${err.message}`);
            } else {
                this.logdebug(`The file ${filename} has been saved!`);
            }
            if (callback) {
                callback(err);
            }
        });
    };
    this.readFile = function (filename, callback) {
        fs.readFile(dataDir + filename, (err, data) => {
            if (err) {
                this.logdebug(`Error loading file ${filename}! ${err.message}`);
                callback('error');
            } else {
                this.logdebug(`The file ${filename} has been loaded!`);
                try {
                    callback(JSON.parse(data.toString()));
                } catch {
                    callback(data);
                }
            }
        });
    };
    this.readFileSync = function (filename) {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataDir + filename).toString());
        } catch {
            data = 'error';
        }
        return data;
    };
    this.setTimeout = function (id, callback, time) {
        this.clearTimeout(id);
        this.observers[id] = setTimeout(callback.bind(this), time);
    };
    this.clearTimeout = function (id) {
        if (this.observers[id]) {
            clearTimeout(this.observers[id]);
        }
        delete this.observers[id];
    };
    this.deleteObservers = function () {
        this.logdebug('deleteObservers');
        this.clearTimeout('doObserver');
    };
    this.closeConnections = function () {
        this.log.debug('closeConnections');
        this.deleteObservers();
    };

    this.logsilly = function (s) {
        if (this.islogsilly) {
            this.adapter.log.silly(s);
        }
    };
    this.logdebug = function (s) {
        if (this.islogdebug) {
            this.adapter.log.debug(s);
        }
    };
    this.logerror = function (s) {
        this.adapter.log.error(s);
    };
    this.loginfo = function (s) {
        this.adapter.log.info(s);
    };

    this.init.bind(this)();
}
module.exports = tvprogramclass;
