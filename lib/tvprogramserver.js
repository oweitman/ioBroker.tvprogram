/* eslint-disable jsdoc/no-types */
const utils = require('@iobroker/adapter-core');
const fs = require('fs');
const axiosbase = require('axios').default;
const https = require('https');
const axios = axiosbase.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    }),
});
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
        optchnlogopath: {
            name: 'optchnlogopath',
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

    /**
     * Initialization function that sets the connection state to true, checks the local filesystem and starts observing state changes.
     */
    this.init = function () {
        this.setState('connection', true, 'info');
        this.checkFilesystem();
        this.doObserver();
    };
    /**
     * Observes changes in TV data points and triggers updates.
     *
     * This function logs its execution, retrieves TV data points, processes new data points,
     * and sets a timeout to invoke itself periodically every hour.
     */
    this.doObserver = async function () {
        this.logdebug('doObserver');
        //this.getTVDatapoints(tvs => this.newTVDatapoints(tvs, this.getData.bind(this)));
        let tvs = await this.getTVDatapointsAsync();
        await this.newTVDatapointsAsync(tvs);
        await this.getDataAsync(tvs);
        this.setTimeout('doObserver', this.doObserver.bind(this), 3 * 60 * 60 * 1000);
    };
    /**
     * Removes files older than 5 days from the 'program' directory.
     *
     * This function reads the files in the 'program' directory and deletes
     * those that are older than 5 days based on the date derived from the
     * file name. It uses synchronous file deletion for each file that meets
     * the criteria.
     */
    this.removeFiles = function () {
        fs.readdir(`${dataDir}program/`, (err, files) => {
            files.forEach(file => {
                if ((+new Date() - +new Date(file.split('.')[0])) / (1000 * 60 * 60 * 24) > 5) {
                    fs.unlinkSync(`${dataDir}program/${file}`);
                }
            });
        });
    };
    /**
     * Creates the data directory if it does not exist.
     *
     * This function checks if the data directory specified in the adapter configuration
     * exists. If it does not, it creates it using the synchronous mkdirSync method.
     * It also creates the 'program' subdirectory if it does not exist.
     */
    this.checkFilesystem = function () {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        if (!fs.existsSync(`${dataDir}program/`)) {
            fs.mkdirSync(`${dataDir}program/`);
        }
    };

    /**
     * Process messages from the adapter.
     *
     * This function is called when a message is received from the adapter.
     * It checks the command in the message and calls the respective function
     * to handle the message.
     *
     * The following commands are supported:
     * - getServerData
     * - getServerTVProgram
     * - getServerBroadcast
     * - getServerTest
     * - getFavoritesData
     * - getServerBroadcastNow
     * - getServerBroadcastDate
     * - getServerBroadcastRange
     * - getServerBroadcastFind
     * - getServerTVs
     * - getServerInfo
     * - setValueAck
     *
     * @param msg Message data
     */
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
    /**
     * This function is called by the ioBroker adapter system if a subscribed state changed
     *
     * @param id The subscribed ID
     * @param state The new state
     */
    this.doStateChange = function (id, state) {
        this.logdebug('doStateChange');
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
    /**
     * Handles state change of name
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeName = function (idParts, state) {
        this.logdebug('doStateChangeName');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '', idParts[0]);
        }
    };
    /**
     * Handles state change of config
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeConfig = function (idParts, state) {
        this.logdebug('doStateChangeConfig');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '', idParts[0]);
        }
    };
    /**
     * Handles state change of favorites
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeFavorites = function (idParts, state) {
        this.logdebug('doStateChangeFavorites');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '[]', idParts[0]);
        }
    };
    /**
     * Handles state change of channelfilter
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeChannelfilter = function (idParts, state) {
        this.logdebug('doStateChangeChannelfilter');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '[]', idParts[0]);
        }
    };
    /**
     * Handles state change of show
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeShow = function (idParts, state) {
        this.logdebug('doStateChangeShow');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '1', idParts[0]);
        }
    };
    /**
     * Handles state change for selecting a channel.
     *
     * @param idParts {array} - Parts of the ID representing the state path.
     * @param state {ioBroker.State} - The new state containing the channel selection value.
     */
    this.doStateChangeSelectChannel = function (idParts, state) {
        this.logdebug('doStateChangeSelectChannel');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val || '', idParts[0]);
        }
    };
    /**
     * Handles state change of commands.
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeCmd = function (idParts, state) {
        this.logdebug('doStateChangeCmd');
        if (typeof state.val === 'string' && state.val !== '') {
            this.setState(idParts[1], '', idParts[0]);
        }
    };
    /**
     * Handles state change of record.
     *
     * @param idParts {array} parts of the ID
     * @param state {ioBroker.State} new state
     */
    this.doStateChangeRecord = function (idParts, state) {
        this.logdebug('doStateChangeRecord');
        if (typeof state.val === 'string') {
            this.setState(idParts[1], state.val, idParts[0]);
        }
    };

    /**
     * Handles the 'getServerData' command by retrieving data from the tvdata object.
     *
     * This function checks if the message contains a valid string key, and if so,
     * attempts to fetch the corresponding data from the tvdata object. If the key
     * does not exist, 'nodata' is returned; otherwise, the specific data is returned.
     * If the message is invalid, 'error1' is returned.
     *
     * Logs the result and sends the data back to the sender using the adapter,
     * if a callback is provided.
     *
     * @param msg - The message object containing the command details.
     * msg.message - The key to retrieve data from the tvdata object.
     * msg.from - sending instance
     * msg.command - command
     * [msg.callback] - The callback function to send the response to.
     */
    this.getServerDataMsg = function (msg) {
        this.logdebug('getServerDataMsg ');
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
    /**
     * Handles the 'getServerTVProgram' command by retrieving the corresponding data from the tvdata object.
     *
     * This function checks if the message contains a valid string key, and if so,
     * attempts to fetch the corresponding data from the tvdata object. If the key
     * does not exist, 'nodata' is returned; otherwise, the specific data is returned.
     * If the message is invalid, 'error1' is returned.
     *
     * Logs the result and sends the data back to the sender using the adapter,
     * if a callback is provided.
     *
     * @param msg - The message object containing the command details.
     * msg.message - The key to retrieve data from the tvdata object.
     * [msg.callback] - The callback function to send the response to.
     */
    this.getServerTVProgramMsg = function (msg) {
        this.logdebug('getServerTVProgramMsg ');
        let data = 'error';
        let shrinkedData;
        if (typeof msg.message === 'string' && msg.message !== '') {
            const datum = msg.message;
            if (this.tvdata['program'][datum]) {
                let shrinkData = JSON.parse(JSON.stringify(this.tvdata['program'][datum]));
                shrinkedData = this.shrinkTVProgramNoText(shrinkData);
            } else {
                data = 'nodata';
            }
        }
        this.logdebug(
            `getServerDataMsg send${msg.from} ${msg.command} ${JSON.stringify(data).substring(0, 100)} ${msg.callback}`,
        );
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, shrinkedData ? shrinkedData : data, msg.callback);
        }
    };
    /**
     * Handles the 'getServerTVs' command by sending an error response to the sender.
     *
     * This function logs the result and sends the data back to the sender using the adapter,
     * if a callback is provided.
     *
     * @param msg - The message object containing the command details.
     * [msg.callback] - The callback function to send the response to.
     */
    this.getServerTVsMsg = function (msg) {
        this.logdebug('getServerTVsMsg ');
        const data = 'error';
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    /**
     * Handles the 'getServerBroadcastRange' command by retrieving broadcast events within a specified date range.
     *
     * This function processes a message object containing a channel filter and a date range.
     * It iterates over the date range, filtering broadcast events based on the specified channels
     * and ensuring that the events fall within the start and end dates. The filtered events are
     * accumulated into an array and sent back to the sender.
     *
     * @param msg - The message object containing the command details.
     * msg.message - The key to retrieve data from the tvdata object.
     * msg.message.channelfilter - An array of channel IDs to filter broadcasts.
     * msg.message.startdate - The start date of the broadcast range.
     * msg.message.enddate - The end date of the broadcast range.
     */
    this.getServerBroadcastRangeMsg = function (msg) {
        this.logdebug('getServerBroadcastRangeMsg ');
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
    /**
     * Handles the 'getServerBroadcastNow' command by retrieving broadcasts currently airing.
     *
     * This function processes a message object containing a channel filter. It iterates over
     * a date range, checking for broadcasts that are currently airing on the specified channels.
     * The filtered broadcasts are accumulated into an array and sent back to the sender.
     *
     * @param msg - The message object containing the command details.
     * msg.message - The key to retrieve data from the tvdata object.
     * [msg.callback] - The callback function to send the response to.
     */
    this.getServerBroadcastNowMsg = function (msg) {
        this.logdebug('getServerBroadcastNowMsg ');
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
    /**
     * Handles the 'getServerBroadcastFind' command by retrieving broadcasts matching the given search criteria.
     *
     * This function processes a message object containing a set of search criteria. It iterates over
     * a date range, checking for broadcasts that match the channel filter, category filter, and text filter.
     * The filtered broadcasts are accumulated into an array and sent back to the sender.
     *
     * @param  msg - The message object containing command details.
     * channelfilter - An array of channel IDs to filter broadcasts.
     * categoryfilter - An array of category IDs to filter broadcasts.
     * textfilter - A string to filter broadcasts by matching against the title, long text, and very short text.
     * datefrom - A date string in ISO format representing the start of the date range.
     * datetill - A date string in ISO format representing the end of the date range.
     * maxresults - The maximum number of results to return.
     * from - sending instance
     * command - command
     * [callback] - The callback function to send the response to.
     */
    this.getServerBroadcastFindMsg = function (msg) {
        this.logdebug('getServerBroadcastFindMsg ');
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
    /**
     * Handles the 'getServerBroadcastDate' command by retrieving broadcasts at a specified date.
     *
     * This function processes a message object containing a channel filter and a date.
     * It iterates over the date range, checking for broadcasts that are currently airing on the specified channels.
     * The filtered broadcasts are accumulated into an array and sent back to the sender.
     *
     * @param  msg - The message object containing command details.
     * channelfilter - An array of channel IDs to filter broadcasts.
     * date - A string to filter broadcasts by matching against the title, long text, and very short text.
     * from - sending instance
     * command - command
     * [callback] - The callback function to send the response to.     *
     */
    this.getServerBroadcastDateMsg = function (msg) {
        this.logdebug('getServerBroadcastDateMsg ');
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
    /**
     * Handles the 'getFavoritesData' command by retrieving favorite broadcasts over the next 5 days.
     *
     * This function processes a message object containing an array of favorite titles. It iterates
     * over the date range, checking for broadcasts that match the specified favorite titles. The
     * filtered broadcasts are accumulated, with additional information such as channel ID and name,
     * and are sorted by start time before being sent back to the sender.
     *
     * @param  msg - The message object containing command details.
     */
    this.getFavoritesDataMsg = function (msg) {
        this.logdebug('getFavoritesDataMsg ');
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
    /**
     * Handles the 'getServerTest' command by retrieving a specific broadcast event.
     *
     * This function processes a message object containing a `viewdate` and an `eventid`.
     * It checks if the program data for the provided `viewdate` exists and attempts to
     * find a broadcast event with the matching `eventid` within that data.
     *
     * If a matching event is found, it is returned to the caller; otherwise, 'error' is returned.
     *
     * @param msg - The message object containing command details.
     * msg.message - An object with the following properties:
     * msg.message.viewdate - The date of the broadcast (in `YYYY-MM-DD` format).
     * msg.message.eventid - The ID of the broadcast event to retrieve.
     * msg.from - The sender of the message.
     * msg.command - The command being executed.
     * [msg.callback] - The optional callback function to send the response to.
     */
    this.getServerTestMsg = function (msg) {
        this.logdebug('getServerTestMsg ');
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
    /**
     * Handles the 'setValueAck' command by setting a state value and sending an ack back to the sender.
     *
     * This function processes a message object containing an id and a value.
     * It attempts to set the state value using the Adapter's setState function.
     * If the message is invalid, 'error1' is returned.
     * If a callback is provided, the response is sent back to the sender using the Adapter.
     *
     * @param msg - The message object containing command details.
     * msg.message - An object containing the id and value.
     * msg.message.id - id
     * msg.message.value - value
     * msg.from - The sender of the message.
     * msg.command - The command being executed.
     * [msg.callback] - The callback function to send the response to.
     */
    this.setValueAckMsg = function (msg) {
        this.logdebug('setValueAckMsg ');
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
    /**
     * Handles the 'getServerInfo' command by retrieving available broadcast dates.
     *
     * This function processes a message object and retrieves the keys from the
     * tvdata's program object, which represent available broadcast dates. The dates
     * are sorted and returned as an array.
     *
     * @param {object} msg - The message object containing command details.
     * msg.from - The sender of the message.
     * msg.command - The command being executed.
     * [msg.callback] - The callback function to send the response to.
     */
    this.getServerInfoMsg = function (msg) {
        this.logdebug('getServerInfoMsg ');
        const data = {};
        data.tvprogram = Object.keys(this.tvdata['program']).sort();
        if (msg.callback) {
            this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
        }
    };
    /**
     * Handles the 'getServerBroadcast' command by retrieving a single broadcast event.
     *
     * This function processes a message object containing a viewdate and an eventid.
     * It iterates over the date range, checking for broadcasts that match the specified eventid.
     * The filtered broadcasts are accumulated into an array and sent back to the sender.
     *
     * @param {object} msg - The message object containing command details.
     * msg.message - An object containing some more data
     * msg.message.viewdate - The date of the broadcast range.
     * msg.message.eventid - The eventid of the broadcast.
     * msg.from - sending instance
     * msg.command - command
     * [msg.callback] - The callback function to send the response to.
     */
    this.getServerBroadcastMsg = function (msg) {
        this.logdebug('getServerBroadcastMsg ');
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
    /**
     * Retrieves all datapoints for TV devices.
     *
     * @param callback - The callback function to send the response to.
     */
    this.getTVDatapoints = function (callback) {
        this.logdebug('getTVDatapoints ');
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
    this.getTVDatapointsAsync = async function () {
        return new Promise(resolve => {
            this.logdebug('getTVDatapointsAsync ');
            const id = this.adapter.namespace;
            const options = { startkey: `${id}.`, endkey: `${id}.\u9999`, include_docs: true };
            this.adapter.getObjectViewAsync('system', 'state', options).then(objects => {
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
                resolve(tvs);
            });
        });
    };
    /**
     * Creates missing datapoints for TV devices. If the number of datapoints found does not match the number of devices set in the adapter config,
     * new datapoints are created. The datapoints are created in the order of tv1, tv2 etc.
     *
     * @param tvs - An array of strings. Each string is the name of a datapoint that should be checked.
     * @param callback - The callback function to send the response to. The callback is called with one parameter which is an array of strings.
     * The array contains the names of all datapoints that exist after the function call.
     */
    this.newTVDatapoints = function (tvs, callback) {
        this.logdebug('newTVDatapoints ');
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
    /**
     * Creates missing datapoints for TV devices. If the number of datapoints found does not match the number of devices set in the adapter config,
     * new datapoints are created. The datapoints are created in the order of tv1, tv2 etc.
     *
     * @param tvs - An array of strings. Each string is the name of a datapoint that should be checked.
     * @returns A Promise that resolves with an array of strings. The array contains the names of all datapoints that exist after the function call.
     */
    this.newTVDatapointsAsync = async function (tvs) {
        this.logdebug('newTVDatapointsAsync ');

        for (let i = 1; i <= this.adapter.config.tvcount; i++) {
            await this.createDevice(`tv${i}`);
            await this.createDatapointsPathAsync(`tv${i}`);
            tvs.push(`tv${i}`);
        }
    };
    /**
     * Reduces the size of the tvprogram array by removing all properties from its elements except
     * id, channel, title, startTime, endTime, airDate and a few content properties.
     * The content properties are texts.VeryShort.value, texts.Long.value, category, country, year, episodeNumber and seasonNumber.
     * The photo property is also kept, but only if it has a url.
     *
     * @param {Array} tvprogram - The array with the full tv program objects.
     * @returns {Array} The reduced array with the same elements as the input array, but with fewer properties.
     */
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
    /**
     * Reduces the size of the tvprogram array by removing all properties from its elements except
     * id, channel, title, startTime, endTime, airDate, and photo properties.
     * The photo property is kept only if it has a url.
     *
     * @param {Array} tvprogram - The array containing full tv program objects.
     * @returns {Array} The reduced array with the same elements as the input array, but with fewer properties.
     */
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
    /**
     * Creates all datapoints for the given path if they do not exist.
     * Calls the callback function when all datapoints are created.
     *
     * @param {string} path - The path of the datapoints to create.
     * @param {Function} callback - The callback function to call when all datapoints are created.
     */
    this.createDatapointsPath = function (path, callback) {
        const pName = new Promise(resolve => {
            const stateTemplatename = JSON.parse(JSON.stringify(this.stateTemplate['name']));
            this.createObjectNotExist(stateTemplatename, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplatename.name, path, path);
                    resolve(true);
                }
            });
        });
        const pConfig = new Promise(resolve => {
            const stateTemplateconfig = JSON.parse(JSON.stringify(this.stateTemplate['config']));
            this.createObjectNotExist(stateTemplateconfig, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplateconfig.name, '{}', path);
                    resolve(true);
                }
            });
        });
        const pFavorites = new Promise(resolve => {
            const stateTemplatefavorites = JSON.parse(JSON.stringify(this.stateTemplate['favorites']));
            this.createObjectNotExist(stateTemplatefavorites, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplatefavorites.name, '[]', path);
                    resolve(true);
                }
            });
        });
        const pChannelfilter = new Promise(resolve => {
            const stateTemplatechannelfilter = JSON.parse(JSON.stringify(this.stateTemplate['channelfilter']));
            this.createObjectNotExist(stateTemplatechannelfilter, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplatechannelfilter.name, '[]', path);
                    resolve(true);
                }
            });
        });
        const pShow = new Promise(resolve => {
            const stateTemplateshow = JSON.parse(JSON.stringify(this.stateTemplate['show']));
            this.createObjectNotExist(stateTemplateshow, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplateshow.name, '1', path);
                    resolve(true);
                }
            });
        });
        const pChannel = new Promise(resolve => {
            const stateTemplateselch = JSON.parse(JSON.stringify(this.stateTemplate['selectchannel']));
            this.createObjectNotExist(stateTemplateselch, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplateselch.name, '', path);
                    resolve(true);
                }
            });
        });
        const pCmd = new Promise(resolve => {
            const stateTemplateselcmd = JSON.parse(JSON.stringify(this.stateTemplate['cmd']));
            this.createObjectNotExist(stateTemplateselcmd, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplateselcmd.name, '', path);
                    resolve(true);
                }
            });
        });
        const pRecord = new Promise(resolve => {
            const stateTemplateselrecord = JSON.parse(JSON.stringify(this.stateTemplate['record']));
            this.createObjectNotExist(stateTemplateselrecord, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplateselrecord.name, '', path);
                    resolve(true);
                }
            });
        });
        const pLogoPath = new Promise(resolve => {
            const stateTemplatesellogopath = JSON.parse(JSON.stringify(this.stateTemplate['optchnlogopath']));
            this.createObjectNotExist(stateTemplatesellogopath, path, '', (err, obj) => {
                if (obj) {
                    this.setState(stateTemplatesellogopath.name, '', path);
                    resolve(true);
                }
            });
        });
        Promise.all([pName, pConfig, pFavorites, pChannelfilter, pShow, pChannel, pCmd, pRecord, pLogoPath]).then(
            () => {
                if (callback) {
                    callback();
                }
            },
        );
    };
    this.createDatapointsPathAsync = async function (path) {
        let state;

        const stateTemplatename = JSON.parse(JSON.stringify(this.stateTemplate['name']));
        await this.createObjectNotExistAsync(stateTemplatename, path, '');
        state = await this.getStateAsync(stateTemplatename.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplatename.name, path, path);
        }
        const stateTemplateconfig = JSON.parse(JSON.stringify(this.stateTemplate['config']));
        await this.createObjectNotExistAsync(stateTemplateconfig, path, '');
        state = await this.getStateAsync(stateTemplateconfig.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplateconfig.name, '{}', path);
        }
        const stateTemplatefavorites = JSON.parse(JSON.stringify(this.stateTemplate['favorites']));
        await this.createObjectNotExistAsync(stateTemplatefavorites, path, '');
        state = await this.getStateAsync(stateTemplatefavorites.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplatefavorites.name, '[]', path);
        }
        const stateTemplatechannelfilter = JSON.parse(JSON.stringify(this.stateTemplate['channelfilter']));
        await this.createObjectNotExistAsync(stateTemplatechannelfilter, path, '');
        state = await this.getStateAsync(stateTemplatechannelfilter.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplatechannelfilter.name, '[]', path);
        }
        const stateTemplateshow = JSON.parse(JSON.stringify(this.stateTemplate['show']));
        await this.createObjectNotExistAsync(stateTemplateshow, path, '');
        state = await this.getStateAsync(stateTemplateshow.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplateshow.name, '', path);
        }
        const stateTemplateselch = JSON.parse(JSON.stringify(this.stateTemplate['selectchannel']));
        await this.createObjectNotExistAsync(stateTemplateselch, path, '');
        state = await this.getStateAsync(stateTemplateselch.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplateselch.name, '', path);
        }
        const stateTemplateselcmd = JSON.parse(JSON.stringify(this.stateTemplate['cmd']));
        await this.createObjectNotExistAsync(stateTemplateselcmd, path, '');
        state = await this.getStateAsync(stateTemplateselcmd.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplateselcmd.name, '', path);
        }
        const stateTemplateselrecord = JSON.parse(JSON.stringify(this.stateTemplate['record']));
        await this.createObjectNotExistAsync(stateTemplateselrecord, path, '');
        state = await this.getStateAsync(stateTemplateselrecord.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplateselrecord.name, '', path);
        }
        const stateTemplatesellogopath = JSON.parse(JSON.stringify(this.stateTemplate['optchnlogopath']));
        await this.createObjectNotExistAsync(stateTemplatesellogopath, path, '');
        state = await this.getStateAsync(stateTemplatesellogopath.name, path);
        if (!state) {
            await this.setStateAsync(stateTemplatesellogopath.name, '', path);
        }
    };
    /**
     * Asynchronously retrieves and updates TV program data.
     *
     * This function fetches categories, channels, and genres data, comparing each with
     * the stored data. If changes are detected, it updates the local storage and state.
     * It also retrieves and processes TV program events for a defined date range,
     * storing them locally and updating the state if there are changes.
     *
     * @param {Array} tvs - An array of TV identifiers used to update the state.
     */
    this.getData = async function (tvs) {
        this.logdebug('getData');
        let catresponse = await this.getCategoriesAsync();
        if (JSON.stringify(this.tvdata.categories) !== JSON.stringify(catresponse.data.category)) {
            this.logdebug('getData first request or changed data categories');
            this.writeFile('categories.json', catresponse.data.category);
            this.tvdata.categories = catresponse.data.category;
            tvs.map(tv => this.setState('cmd', 'new|categories', tv));
        }
        let chnresponse = await this.getChannelsAsync();
        if (JSON.stringify(this.tvdata.channels) !== JSON.stringify(chnresponse.data.channels)) {
            this.logdebug('getData first request or changed data channels');
            this.writeFile('channels.json', chnresponse.data.channels);
            this.tvdata.channels = chnresponse.data.channels;
            tvs.map(tv => this.setState('cmd', 'new|channels', tv));
        }
        let genresponse = await this.getGenresAsync();
        if (JSON.stringify(this.tvdata.genres) !== JSON.stringify(genresponse.data.genres)) {
            this.logdebug('getData first request or changed data genres');
            this.writeFile('genres.json', genresponse.data.genres);
            this.tvdata.genres = genresponse.data.genres;
            tvs.map(tv => this.setState('cmd', 'new|genres', tv));
        }
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
    this.getDataAsync = async function (tvs) {
        return new Promise(resolve => {
            (async () => {
                this.logdebug('getDataAsync');
                let catresponse = await this.getCategoriesAsync();
                if (JSON.stringify(this.tvdata.categories) !== JSON.stringify(catresponse.data.category)) {
                    this.logdebug('getDataAsync first request or changed data categories');
                    this.writeFile('categories.json', catresponse.data.category);
                    this.tvdata.categories = catresponse.data.category;
                    tvs.map(tv => this.setState('cmd', 'new|categories', tv));
                }
                let chnresponse = await this.getChannelsAsync();
                if (JSON.stringify(this.tvdata.channels) !== JSON.stringify(chnresponse.data.channels)) {
                    this.logdebug('getDataAsync first request or changed data channels');
                    this.writeFile('channels.json', chnresponse.data.channels);
                    this.tvdata.channels = chnresponse.data.channels;
                    tvs.map(tv => this.setState('cmd', 'new|channels', tv));
                }
                let genresponse = await this.getGenresAsync();
                if (JSON.stringify(this.tvdata.genres) !== JSON.stringify(genresponse.data.genres)) {
                    this.logdebug('getDataAsync first request or changed data genres');
                    this.writeFile('genres.json', genresponse.data.genres);
                    this.tvdata.genres = genresponse.data.genres;
                    tvs.map(tv => this.setState('cmd', 'new|genres', tv));
                }
                let dstart = new Date();
                dstart.setDate(dstart.getDate() - 5);
                let dend = new Date();
                dend.setDate(dend.getDate() + 5);
                while (dstart <= dend) {
                    let response = await this.getProgramAsync(dstart);
                    let datum = this.formatedDate(dstart);
                    let events = this.shrinkTVProgramWithText(response.data.events);
                    if (JSON.stringify(this.tvdata.program[datum]) !== JSON.stringify(events)) {
                        this.logdebug(`getDataAsync first request or changed data events ${datum}`);
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
                resolve(true);
            })();
        });
    };
    /**
     * Asynchronously retrieves the TV program data for a specific date.
     *
     * This function constructs a request URL using the provided date,
     * formatted to a specific pattern, and sends the request to fetch
     * the TV program data using an HTTP GET request.
     *
     * @param {Date} datum - The date for which to retrieve the program data.
     * @returns {Promise} - A promise that resolves to the response data from the HTTP request.
     */
    this.getProgramAsync = async function (datum) {
        this.logdebug('getProgramAsync');
        const options = {
            '%DATE%': this.formatedDate(datum),
        };
        return await axios.get(this.getUrlFromTemplate(options, api_program));
    };
    /**
     * Formats a given date into a 'YYYY-MM-DD' string.
     *
     * This function takes a Date object and returns a string
     * representing the date in the format 'YYYY-MM-DD',
     * where 'YYYY' is the four-digit year, 'MM' is the two-digit
     * month, and 'DD' is the two-digit day.
     *
     * @param {Date} datum - The date to format.
     * @returns {string} - The formatted date string.
     */
    this.formatedDate = function (datum) {
        return `${datum.getFullYear()}-${`0${datum.getMonth() + 1}`.slice(-2)}-${`0${datum.getDate()}`.slice(-2)}`;
    };
    /**
     * Adjusts the given date to account for broadcast timeframes.
     *
     * This function takes a date, and if the time is between midnight and 4:59 AM,
     * it decrements the date by one day to align with the previous day's broadcast.
     *
     * @param {Date|string} datum - The date or date string to adjust.
     * @returns {Date} - The adjusted date.
     */
    this.calcDate = function (datum) {
        const d = new Date(datum);
        const time = d.getHours() + d.getMinutes() / 60;
        if (time >= 0 && time < 5) {
            d.setDate(d.getDate() - 1);
        }
        return d;
    };
    /**
     * Retrieves the list of categories asynchronously.
     *
     * This function sends a request to the API to retrieve the list of categories.
     * The response is returned as a promise.
     *
     * @returns {Promise} - A promise that resolves to the response from the API.
     */
    this.getCategoriesAsync = async function () {
        this.logdebug('getCategoriesAsync');
        return await axios.get(api_categories);
    };
    /**
     * Retrieves the list of channels asynchronously.
     *
     * This function sends a request to the API to retrieve the list of channels.
     * The response is returned as a promise.
     *
     * @returns {Promise} - A promise that resolves to the response from the API.
     */
    this.getChannelsAsync = async function () {
        this.logdebug('getChannelsAsync');
        return await axios.get(api_channels);
    };

    /**
     * Asynchronously retrieves the list of genres.
     *
     * This function sends a request to the API to fetch the list of genres.
     * The response is returned as a promise that resolves to the data from the API.
     *
     * @returns {Promise} - A promise that resolves to the response from the API.
     */
    this.getGenresAsync = async function () {
        this.logdebug('getGenresAsync');
        return await axios.get(api_genres);
    };
    /**
     * Replaces placeholders in a URL template with corresponding values from the options object.
     *
     * This function takes a URL template string, where placeholders are denoted by a percent sign
     * followed by a word (e.g., '%DATE%'). It replaces each placeholder with the value from the
     * options object that corresponds to the placeholder's key. If a placeholder does not have
     * a corresponding value in the options object, it is left unchanged.
     *
     * @param {object} options - An object containing key-value pairs for replacing placeholders.
     * @param {string} urltemplate - The URL template string containing placeholders to be replaced.
     * @returns {string} - The resulting URL with placeholders replaced by corresponding values.
     */
    this.getUrlFromTemplate = function (options, urltemplate) {
        return urltemplate.replace(/%\w+%/g, function (option) {
            return options[option] || option;
        });
    };
    /**
     * Creates an object in the adapter's database if it does not already exist.
     *
     * This function constructs an object name from the provided path segments and
     * state template, then checks if an object with this name already exists. If
     * it does not exist, the object is created using the state template. If it
     * does exist, the callback function is executed without creating a new object.
     *
     * @param {object} stateTemplate - The template defining the common properties of the state.
     * @param {string} level1path - The first level path segment for the object name.
     * @param {string} level2path - The second level path segment for the object name.
     * @param {Function} callback - The function to call after attempting to create the object.
     */
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
    /**
     * Creates an object in the adapter's database if it does not already exist.
     *
     * This function constructs an object name from the provided path segments and
     * state template, then attempts to create the object in the database using
     * `setObjectNotExists`. If the object already exists, no action is taken.
     * If a callback is provided, it is executed after the creation attempt.
     *
     * @param {object} stateTemplate - The template defining the common properties of the state.
     * @param {string} level1path - The first level path segment for the object name.
     * @param {string} level2path - The second level path segment for the object name.
     * @param {Function} callback - The function to call after attempting to create the object.
     */
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
    this.createObjectNotExistAsync = async function (stateTemplate, level1path, level2path) {
        this.logdebug(`createObjectNotExist ${stateTemplate.name}`);
        const name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + stateTemplate.name;
        const newobj = {
            type: 'state',
            common: stateTemplate,
            native: {},
        };
        await this.adapter.setObjectNotExistsAsync(name, newobj);
    };
    /**
     * Creates a device in the adapter's database if it does not already exist.
     *
     * This function takes a device name and up to two path segments, and
     * attempts to create a device with the given name in the adapter's
     * database. If the device already exists, no action is taken.
     *
     * @param {string} devicename - The name of the device to create.
     * @param {string} [level1path] - The first level path segment for the device name.
     * @param {string} [level2path] - The second level path segment for the device name.
     */
    this.createDevice = async function (devicename, level1path, level2path) {
        const id = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + devicename;
        this.logdebug(`createDevice ${id}`);
        if (await this.existsObjectAsync(id)) {
            this.logdebug(`Device exists: ${id}`);
        } else {
            const obj = {
                type: 'device',
                common: {
                    name: devicename,
                },
                native: {},
            };
            await this.adapter.setObjectAsync(id, obj);
        }
    };
    /**
     * Checks if an object with the given id exists in the adapter's database.
     *
     * The id is prefixed with the adapter's namespace before checking existence.
     * Resolves with true if the object exists, or false if it does not.
     * Rejects with an error if there is an issue during the check.
     *
     * @param {string} id - The id of the object to check for existence.
     * @returns {Promise<boolean>} A promise that resolves with true if the object exists, otherwise false.
     */
    this.existsObjectAsync = function (id) {
        return new Promise((resolve, reject) => {
            id = `${this.adapter.namespace}.${id}`;

            this.adapter.getForeignObject(id, (err, obj) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!obj);
                }
            });
        });
    };
    /**
     * Retrieves the value of a state in the adapter's database.
     *
     * The object name is constructed from the provided path segments and id.
     * The callback function is executed with the state object as its argument.
     *
     * @param {string} id - The id of the state to retrieve.
     * @param {string} level1path - The first level path segment for the object name.
     * @param {string} level2path - The second level path segment for the object name.
     * @param {Function} callback - The function to call with the retrieved state object.
     */
    this.getState = function (id, level1path, level2path, callback) {
        this.logdebug(`getState ${id}`);
        const name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + id;
        this.adapter.getState(name, callback);
    };
    this.getStateAsync = function (id, level1path, level2path) {
        this.logdebug(`getState ${id}`);
        const name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + id;
        return this.adapter.getStateAsync(name);
    };
    /**
     * Sets the value of a state in the adapter's database.
     *
     * The object name is constructed from the provided path segments and name.
     * The callback function is executed with the error object from the set operation,
     * or null if the set was successful. If the `ack` parameter is not provided,
     * it is set to true.
     *
     * @param {string} name - The name of the state to set.
     * @param {string|number|boolean} value - The new value of the state.
     * @param {string} level1path - The first level path segment for the object name.
     * @param {string} level2path - The second level path segment for the object name.
     * @param {object} callback - The function to call after the set operation.
     */
    this.setState = function (name, value, level1path = '', level2path = '', callback = undefined) {
        name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + name;
        this.logdebug(`setState name: ${name}` /*+ ' value: ' + value*/);
        callback ? this.adapter.setState(name, value, true, callback) : this.adapter.setState(name, value, true);
    };
    this.setStateAsync = function (name, value, level1path = '', level2path = '') {
        name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + name;
        this.logdebug(`setState name: ${name}` /*+ ' value: ' + value*/);
        return this.adapter.setStateAsync(name, value, true);
    };
    /**
     * Sets the value of a state in the adapter's database without acknowledgment.
     *
     * The object name is constructed from the provided path segments and name.
     * The callback function is executed with the error object from the set operation,
     * or null if the set was successful. The `ack` parameter is set to false.
     *
     * @param {string} name - The name of the state to set.
     * @param {string|number|boolean} value - The new value of the state.
     * @param {string} level1path - The first level path segment for the object name.
     * @param {string} level2path - The second level path segment for the object name.
     * @param {object} callback - The function to call after the set operation.
     */

    this.setStateNoAck = function (name, value, level1path, level2path, callback) {
        name = (level1path ? `${level1path}.` : '') + (level2path ? `${level2path}.` : '') + name;
        this.logdebug(`setStateNoAck name: ${name}` /*+ ' value: ' + value*/);
        callback ? this.adapter.setState(name, value, false, callback) : this.adapter.setState(name, value, false);
    };
    /**
     * Writes a file to the data directory.
     *
     * If the data is not a string, it is converted to a JSON string using
     * `JSON.stringify`. The callback function is called with the error object
     * from the write operation, or null if the write was successful.
     *
     * @param {string} filename - The name of the file to write.
     * @param {string|object} data - The data to write to the file.
     * @param {object} callback - The function to call after the write operation.
     */
    this.writeFile = function (filename, data, callback = undefined) {
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
    /**
     * Synchronously reads a file.
     *
     * This function reads a file given by filename and attempts to parse its contents as JSON.
     * If the file does not exist or is not valid JSON, it returns 'error'.
     *
     * @param {string} filename - The name of the file to read.
     * @returns {string | object} The contents of the file or 'error' if it could not be read.
     */
    this.readFileSync = function (filename) {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataDir + filename).toString());
        } catch {
            data = 'error';
        }
        return data;
    };
    /**
     * Sets a timeout for a specific observer, replacing any existing timeout for the observer.
     *
     * This function first clears any previous timeout associated with the given observer ID,
     * then sets a new timeout, ensuring that only one timeout is active per observer at any time.
     *
     * @param {string} id - The identifier of the observer whose timeout should be set.
     * @param {Function} callback - The function to be executed after the timeout period.
     * @param {number} time - The number of milliseconds to wait before executing the callback.
     */
    this.setTimeout = function (id, callback, time) {
        this.clearTimeout(id);
        this.observers[id] = setTimeout(callback.bind(this), time);
    };
    /**
     * Clears a timeout for a specific observer and removes it from the observers list.
     *
     * @param {string} id - The identifier of the observer whose timeout should be cleared.
     */
    this.clearTimeout = function (id) {
        if (this.observers[id]) {
            clearTimeout(this.observers[id]);
        }
        delete this.observers[id];
    };
    /**
     * Deletes all observer timers, used when shutting down the adapter.
     */
    this.deleteObservers = function () {
        this.logdebug('deleteObservers');
        this.clearTimeout('doObserver');
    };
    /**
     * Deletes all observer timers and stops the adapter from further actions.
     */
    this.closeConnections = function () {
        this.log.debug('closeConnections');
        this.deleteObservers();
    };

    /**
     * Logs a message at the 'silly' log level if the 'islogsilly' flag is enabled.
     *
     * @param {string} s - The message to be logged.
     */
    this.logsilly = function (s) {
        if (this.islogsilly) {
            this.adapter.log.silly(s);
        }
    };
    /**
     * Logs a debug-level message if debug logging is enabled.
     *
     * @param {string} s - The message to be logged.
     */
    this.logdebug = function (s) {
        if (this.islogdebug) {
            this.adapter.log.debug(s);
        }
    };
    /**
     * Write a message to the error log
     *
     * @param s message to write
     */
    this.logerror = function (s) {
        this.adapter.log.error(s);
    };
    /**
     * Write a message to the info log
     *
     * @param s message to write
     */
    this.loginfo = function (s) {
        this.adapter.log.info(s);
    };

    this.init.bind(this)();
}
module.exports = tvprogramclass;
