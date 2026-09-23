/* global vis, $, window, document */
export default {
    checkStyle: function (attr, str) {
        return str
            .split(';')
            .reduce((acc, el) => (el.split(':')[0].trim() == attr ? el.split(':')[1].trim() : acc), '');
    },
    realBackgroundColor: function (elem) {
        const transparent = 'rgba(0, 0, 0, 0)';
        const transparentIE11 = 'transparent';
        if (!elem) {
            return transparent;
        }

        const bg = window.getComputedStyle(elem).backgroundColor;
        if (bg === transparent || bg === transparentIE11) {
            return this.realBackgroundColor(elem.parentElement);
        }
        return bg;
    },
    onclickBroadcast: async function (evt) {
        const el = evt.currentTarget ? evt.currentTarget : evt;
        const eventid = el.dataset.eventid || 0;
        const widgetID = el.dataset.widgetid || 0;
        const viewdate = el.dataset.viewdate || 0;
        const instance = el.dataset.instance || '';
        const tvprogram_oid = el.dataset.dp || '';
        if (eventid == 0 || widgetID == 0) {
            return;
        }
        const event = await this.getServerBroadcastAsync(instance, eventid, viewdate);
        const measures = $(`#${widgetID}broadcastdlg`).data();
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        const category = event.content.category ? this.categories.find(el => el.id == event.content.category) : null;
        const channel = event.channel ? this.channels.find(el => el.id == event.channel) : null;
        let channeltime = '';
        channeltime += channel ? `${channel.name} ` : '';
        channeltime += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
        channeltime += ' - ';
        channeltime += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
        let meta = '';
        meta += event.content.country ? `${event.content.country} ` : '';
        meta += event.content.year ? `${event.content.year} ` : '';
        meta += category ? `${category.title} ` : '';
        let season = '',
            episode = '';
        if (event.content.seasonNumber) {
            season = event.content.seasonNumber;
            season = season < 100 ? `S${`0${season}`.slice(-2)}` : `S${season}`;
        }
        if (event.content.episodeNumber) {
            episode = event.content.episodeNumber;
            episode = episode < 100 ? `E${`0${episode}`.slice(-2)}` : `E${episode}`;
        }
        meta += season || episode ? `${season + episode} ` : '';
        const content = event.content.texts.Long.value
            ? event.content.texts.Long.value
            : event.content.texts.VeryShort.value
              ? event.content.texts.VeryShort.value
              : '';
        const photourl = event.photo.url
            ? this.getProgrammeImage(event.photo.url)
            : 'https://tvfueralle.de/tv-logo-no-image.svg';
        const favorites = this.getConfigFavorites(tvprogram_oid);
        const favhighlight = favorites.indexOf(event.title) > -1;

        const layout =
            $(`#${widgetID}`).width() * measures.dialogwidthpercent >
            $(`#${widgetID}`).height() * measures.dialogheightpercent
                ? ' tv-dlg-row'
                : ' tv-dlg-col';
        let width = $(`#${widgetID}`).width() * measures.dialogwidthpercent;
        let height = $(`#${widgetID}`).height() * measures.dialogheightpercent;
        //let { top: elTop, left: elLeft } = $(`#${widgetID}`).position();
        let { top: elTop, left: elLeft } = $(`#${widgetID}`).offset();
        let top = elTop + ($(`#${widgetID}`).height() - height) / 2;
        let left = elLeft + ($(`#${widgetID}`).width() - width) / 2;
        let text = '';
        text += `<dialog class="${widgetID}broadcastdialog" style="margin:0;width:${width}px;height:${height}px;top:${top}px;left:${left}px">`;
        text += `  <div class="event-container${layout}" data-eventid="${event.id}">`;
        text += `    <div class="event-picture dialogcolumn${layout}">`;
        text += `    <img src="${photourl}">`;
        text += '    </div>';
        text += `    <div class="event-data dialogcolumn${layout}">`;
        text += '      <div class="buttoncontainer">';
        text += `          <div class="record button" 
                                data-viewdate="${viewdate}" 
                                data-eventid="${event.id}" 
                                data-instance="${instance}" 
                                data-dp="${tvprogram_oid}" 
                                onclick="return vis.binds.tvprogram.onclickRecord(this,event)">
                                <svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg></div>`;
        text += `          <div class="copy button" 
                                data-widgetid="${widgetID}" 
                                onclick="return vis.binds.tvprogram.onclickCopy(this,event)">
                            <svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg></div>`;
        text += `          <div class="star button ${favhighlight ? 'selected' : ''}" 
                                data-viewdate="${viewdate}" 
                                data-eventid="${event.id}" 
                                data-instance="${instance}" 
                                data-dp="${tvprogram_oid}" 
                                onclick="return vis.binds.tvprogram.onclickFavorite(this,event)">
                            <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
        if (startTime < new Date() && new Date() < endTime) {
            text += `        <div class="channelselect button" 
                                data-instance="${instance}" 
                                data-dp="${tvprogram_oid}" 
                                data-channelid="${channel.channelId}"
                                onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">
                            <svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg></div>`;
        }
        text += '      </div>';
        text += `      <div style="padding: 0px 0px 5px;">${channeltime}</div>`;
        text += `      <div style="font-weight: bold;padding: 0px 0px 5px;">${event.title}</div>`;
        text += `      <div style="padding: 0px 0px 5px;">${meta}</div>`;
        text += `      <div>${content}</div>`;
        text += '    </div>';
        text += '  </div>';
        text += '  </div>';
        text += `</dialog">`;
        $(`#${widgetID}broadcastdlg`).html(text);
        this.copyStyles('font', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg dialog`).get(0));
        this.copyStyles('color', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg dialog`).get(0));
        this.copyStyles('background-color', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg dialog`).get(0));
        let dialog = document.querySelector(`#${widgetID}broadcastdlg dialog`);
        $(`#${widgetID}broadcastdlg`).click(function () {
            dialog.close();
        });
        dialog.showModal();
    },
    onclickRecord: async function (el, evt) {
        const instance = el.dataset.instance || '';
        const tvprogram_oid = el.dataset.dp || '';
        const eventid = el.dataset.eventid || 0;
        const viewdate = el.dataset.viewdate || 0;
        if (eventid == 0 || viewdate == 0) {
            return;
        }
        evt.stopPropagation();
        const event = await this.getServerBroadcastAsync(instance, eventid, viewdate);
        const channel = event.channel ? this.channels.find(el => el.id == event.channel) : null;
        const record = {
            startTime: event.startTime,
            endTime: event.endTime,
            title: event.title,
            channel: event.channel,
            channelid: channel.channelId,
            channelname: channel.name,
            eventid: event.id,
        };
        this.setValueAckAsync(instance, `${tvprogram_oid}.record`, JSON.stringify(record));
    },
    onclickCopy: function (el, evt) {
        const widgetID = el.dataset.widgetid || '';
        const aux = document.createElement('textarea');
        aux.value = $(`#${widgetID}broadcastdlg .event-data`).get(0).outerText;
        document.body.appendChild(aux);
        aux.focus();
        aux.select();
        document.execCommand('copy');
        document.body.removeChild(aux);
        evt.stopPropagation();
    },
    copyStyles: function (startsWith, from, to) {
        const cssFrom = window.getComputedStyle(from);
        const cssTo = window.getComputedStyle(to);
        for (let i = cssFrom.length; i--; ) {
            if (cssFrom[i].startsWith(startsWith)) {
                if (cssFrom.getPropertyValue(cssFrom[i]) != cssTo.getPropertyValue(cssFrom[i])) {
                    to.style.setProperty(cssFrom[i], cssFrom.getPropertyValue(cssFrom[i]));
                }
            }
        }
    },
    colorToRGBA: function (color, alpha = 1) {
        const cvs = document.createElement('canvas');
        cvs.height = 1;
        cvs.width = 1;
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const carr = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${carr[0]},${carr[1]},${carr[2]},${alpha})`;
    },
    onclickChannelSwitch: function (el, evt) {
        const channelid = el.dataset.channelid || '';
        const tvprogram_oid = el.dataset.dp || '';
        const instance = el.dataset.instance || '';
        this.setValueAckAsync(instance, `${tvprogram_oid}.selectchannel`, channelid);
        evt.stopPropagation();
    },
    onclickFavorite: async function (el, evt) {
        const tvprogram_oid = el.dataset.dp || '';
        const instance = el.dataset.instance || '';
        const eventid = el.dataset.eventid || 0;
        const viewdate = el.dataset.viewdate || 0;
        evt.stopPropagation();
        if (eventid == 0 || viewdate == 0) {
            return;
        }
        const event = await this.getServerBroadcastAsync(instance, eventid, viewdate);
        const favorites = this.getConfigFavorites(tvprogram_oid);
        const index = favorites.indexOf(event.title);
        if (index > -1) {
            favorites.splice(index, 1);
            if ($(el).hasClass('button')) {
                $(el).removeClass('selected');
            }
        } else {
            favorites.push(event.title);
            if ($(el).hasClass('button')) {
                $(el).addClass('selected');
            }
        }
        this.setConfigFavorites(instance, tvprogram_oid, favorites);
    },
    getConfig: function (tvprogram_oid) {
        let config;
        const attr = vis.states.attr(`${tvprogram_oid}.config.val`);
        if (typeof attr !== 'undefined' && attr !== 'null' && attr !== '') {
            config = JSON.parse(attr);
        } else {
            config = {};
        }
        return config;
    },
    getConfigFavorites: function (tvprogram_oid) {
        let favorites;
        const attr = vis.states.attr(`${tvprogram_oid}.favorites.val`);
        if (typeof attr !== 'undefined' && attr !== 'null' && attr !== '') {
            favorites = JSON.parse(attr);
        } else {
            favorites = [];
        }
        return favorites;
    },
    getOptChannelLogoPath: function (tvprogram_oid) {
        let logopath;
        const attr = vis.states.attr(`${tvprogram_oid}.optchnlogopath.val`);
        if (typeof attr !== 'undefined' && attr !== 'null' && attr !== '') {
            logopath = attr;
        } else {
            logopath = '';
        }
        return logopath;
    },
    getChannelLogo: function (channel, tvprogram_oid) {
        if (!channel) {
            return '';
        }
        const path = this.getOptChannelLogoPath(tvprogram_oid);
        if (path) {
            return `${path.replace(/\/?$/, '/')}${channel.logoName || channel.channelId}.png`;
        }
        return this.getOriginalChannelLogo(channel);
    },
    getOriginalChannelLogo: function (channel) {
        if (!channel) {
            return '';
        }
        return channel.logo || `https://tvfueralle.de/channel-logos/${channel.channelId}.png`;
    },
    getProgrammeImage: function (url) {
        return /^https?:\/\//i.test(url) ? url : `https://tvfueralle.de${url}`;
    },
    setConfigFavorites: function (instance, tvprogram_oid, favorites) {
        this.setValueAckAsync(instance, `${tvprogram_oid}.favorites`, JSON.stringify(favorites));
    },
    getConfigChannelfilter: function (tvprogram_oid) {
        let channelfilter;
        const attr = vis.states.attr(`${tvprogram_oid}.channelfilter.val`);
        if (typeof attr !== 'undefined' && attr !== 'null' && attr !== '') {
            channelfilter = JSON.parse(attr);
        } else {
            channelfilter = [];
        }
        return channelfilter;
    },
    setConfigChannelfilter: function (instance, tvprogram_oid, channelfilter) {
        this.setValueAckAsync(instance, `${tvprogram_oid}.channelfilter`, JSON.stringify(channelfilter));
    },
    getConfigShow: function (tvprogram_oid) {
        let show;
        const attr = vis.states.attr(`${tvprogram_oid}.show.val`);
        if (typeof attr !== 'undefined' && attr !== 'null' && attr !== '') {
            show = JSON.parse(attr);
        } else {
            show = 1;
        }
        return show;
    },
    setConfigShow: function (instance, tvprogram_oid, show) {
        this.setValueAckAsync(instance, `${tvprogram_oid}.show`, JSON.stringify(show));
    },
    toggleShow: function (instance, tvprogram_oid) {
        let show = this.getConfigShow(tvprogram_oid);
        if (show == undefined) {
            show = 0;
        }
        show = show == 1 ? 0 : 1;
        this.setConfigShow(instance, tvprogram_oid, show);
    },
    getServerBroadcast: function (instance, eventid, viewdate, callback) {
        console.log(`getServerBroadcast request ${eventid}.${viewdate}`);
        vis.conn.sendTo(
            instance,
            'getServerBroadcast',
            { eventid: eventid, viewdate: viewdate },
            function (data) {
                if (data != 'error' && data != 'nodata') {
                    console.log(`getServerBroadcast received ok ${instance}.${viewdate}.${eventid}`);
                } else {
                    console.log(`getServerBroadcast received ${data}`);
                }
                if (callback) {
                    callback(data);
                }
            }.bind(this),
        );
    },
    getServerBroadcastAsync: async function (instance, eventid, viewdate) {
        console.log(`getServerBroadcast request ${eventid}.${viewdate}`);
        return await this.sendToAsync(instance, 'getServerBroadcast', { eventid: eventid, viewdate: viewdate });
    },
    events: {},
    serverdata: {},
    getServerData: function (instance, widgetID, dataname, callback) {
        const dataid = instance + dataname;
        if (Object.prototype.hasOwnProperty.call(this.serverdata, dataid)) {
            callback(this.serverdata[dataid]);
        }
        if (!Object.prototype.hasOwnProperty.call(this.events, dataid)) {
            this.events[dataid] = [];
        }
        const obj = this.events[dataid];
        if (!obj.find(el => el.key == widgetID)) {
            obj.push({ key: widgetID, cb: callback });
        }
        vis.conn.sendTo(instance, 'getServerData', dataname, data => {
            if (data != 'error' && data != 'nodata') {
                console.log(`getServerData received ${instance}.${dataname} ${JSON.stringify(data).substring(0, 100)}`);
            } else {
                console.log(`getServerData received err ${data}`);
            }
            this.serverdata[dataid] = data;
            if (!Object.prototype.hasOwnProperty.call(this.events, dataid)) {
                return;
            }
            const obj = this.events[dataid];
            for (let i = 0; i < obj.length; i++) {
                obj[i].cb(data);
            }
            delete this.events[dataid];
        });
    },
    getServerDataAsync: async function (instance, widgetID, dataname) {
        console.log(`getServerData ${dataname}`);
        const dataid = instance + dataname;
        if (!Object.prototype.hasOwnProperty.call(this.events, dataid)) {
            this.events[dataid] = [];
        }
        return await this.sendToAsync(instance, 'getServerData', dataname);
    },
    getServerTVProgram: function (instance, widgetID, dataname, callback) {
        const name = `${instance}program.${dataname}`;
        if (Object.prototype.hasOwnProperty.call(this.serverdata, name)) {
            callback(this.serverdata[name]);
        }
        if (Object.prototype.hasOwnProperty.call(this.events, name)) {
            if (!this.events[name].find(el => el.key == widgetID)) {
                this.events[name].push({ key: widgetID, cb: callback });
            }
            return;
        }
        this.events[name] = [{ key: widgetID, cb: callback }];

        vis.conn.sendTo(
            instance,
            'getServerTVProgram',
            dataname,
            function (data) {
                if (data != 'error' && data != 'nodata') {
                    console.log(`getServerTVProgram received ${instance}.${dataname}nodata`);
                } else {
                    console.log(`getServerTVProgram received ${instance}.${dataname} ok`);
                    this.serverdata[name] = data;
                }
                if (!Object.prototype.hasOwnProperty.call(this.events, name)) {
                    return;
                }
                for (let i = 0; i < this.events[name].length; i++) {
                    this.events[name][i].cb(data);
                }
                delete this.events[name];
            }.bind(this),
        );
    },
    getServerTVProgramAsync: async function (instance, widgetID, dataname) {
        console.log(`getServerTVProgram ${dataname}`);
        return await this.sendToAsync(instance, 'getServerTVProgram', dataname);
    },
    getFavoritesData: function (instance, favorites = [], callback) {
        console.log(`getFavoritesData request ${instance}.favorites`);
        vis.conn.sendTo(instance, 'getFavoritesData', favorites, data => {
            if (data != 'error' && data != 'nodata') {
                console.log(`getFavoritesData received ok ${data.length}`);
            } else {
                console.log(`getFavoritesData received ${instance}.favorites`);
            }
            if (callback) {
                callback(data);
            }
        });
    },
    getFavoritesDataAsync: async function (instance, favorites = []) {
        console.log(`getFavoritesData request ${instance}.favorites`);
        return await this.sendToAsync(instance, 'getFavoritesData', favorites);
    },
    getServerInfo: function (instance, callback) {
        console.log('getServerInfo request ');
        vis.conn.sendTo(instance, 'getServerInfo', {}, data => {
            console.log('getServerInfo received ok ');
            if (callback) {
                callback(data);
            }
        });
    },
    getServerInfoAsync: async function (instance) {
        console.log('getServerInfo request ');
        return await this.sendToAsync(instance, 'getServerInfo', {});
    },
    getServerBroadcastNow: function (instance, channelfilter, callback) {
        console.log('getServerBroadcastNow request ');
        vis.conn.sendTo(
            instance,
            'getServerBroadcastNow',
            channelfilter,
            function (data) {
                if (data != 'error' && data != 'nodata') {
                    console.log(`getServerBroadcastNow received ok ${data.length}`);
                } else {
                    console.log('getServerBroadcastNow received ');
                }
                if (callback) {
                    callback(data);
                }
            }.bind(this),
        );
    },
    getServerBroadcastNowAsync: async function (instance, channelfilter) {
        console.log('getServerBroadcastNow request ');
        return await this.sendToAsync(instance, 'getServerBroadcastNow', channelfilter);
    },
    getServerBroadcastRangeAsync: async function (instance, channelfilter, startdate, enddate) {
        console.log('getServerBroadcastRange request ');
        return await this.sendToAsync(instance, 'getServerBroadcastRange', { channelfilter, startdate, enddate });
    },
    getServerBroadcastDate: function (instance, channelfilter, date, callback) {
        console.log('getServerBroadcastDate request ');
        vis.conn.sendTo(
            instance,
            'getServerBroadcastDate',
            { channelfilter: channelfilter, date: date },
            function (data) {
                if (data != 'error' && data != 'nodata') {
                    console.log(`getServerBroadcastDate received ok ${data.length}`);
                } else {
                    console.error(`getServerBroadcastDate received ${data}`);
                }
                if (callback) {
                    callback(data);
                }
            }.bind(this),
        );
    },
    getServerBroadcastDateAsync: async function (instance, channelfilter, date) {
        console.log('getServerBroadcastDate request ');
        return await this.sendToAsync(instance, 'getServerBroadcastDate', { channelfilter: channelfilter, date: date });
    },
    getServerBroadcastFind: function (instance, obj, callback) {
        console.log('getServerBroadcastFind request ');
        vis.conn.sendTo(
            instance,
            'getServerBroadcastFind',
            obj,
            function (data) {
                if (data != 'error' && data != 'nodata') {
                    console.log(`getServerBroadcastFind received ok ${data.length}`);
                } else {
                    console.log('getServerBroadcastFind received ');
                }
                const serverdata = [];
                data.map(ch => {
                    ch.events.map(event => serverdata.push(event));
                });
                data = serverdata.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                if (callback) {
                    callback(data);
                }
            }.bind(this),
        );
    },
    getServerBroadcastFindAsync: async function (instance, obj) {
        console.log('getServerBroadcastFind request ');
        let data = await this.sendToAsync(instance, 'getServerBroadcastFind', obj);
        const serverdata = [];
        data.map(ch => {
            ch.events.map(event => serverdata.push(event));
        });
        data = serverdata.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        return data;
    },
    setValueAck: function (instance, id, value) {
        console.log('setValueAck request ');
        vis.conn.sendTo(instance, 'setValueAck', { id: id, value: value });
    },
    setValueAckAsync: async function (instance, id, value) {
        console.log('setValueAck request ');
        return await this.sendToAsync(instance, 'setValueAck', { id: id, value: value });
    },
    sendToAsync: async function (instance, command, sendData) {
        console.log(`sendToAsync ${command} ${sendData}`);
        return new Promise((resolve, reject) => {
            try {
                vis.conn.sendTo(instance, command, sendData, function (receiveData) {
                    resolve(receiveData);
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    loadServerInfosAsync: async function (instance) {
        this.infos = [];
        return await this.getServerInfoAsync(instance);
    },
    loadCategories: async function (instance, widgetID) {
        console.log('loadCategories');
        return await this.getServerDataAsync(instance, widgetID, 'categories');
    },
    loadChannels: async function (instance, widgetID) {
        console.log('loadChannels');
        return await this.getServerDataAsync(instance, widgetID, 'channels');
    },
    loadGenres: async function (instance, widgetID) {
        console.log('loadGenres');
        return await this.getServerDataAsync(instance, widgetID, 'genres');
    },
    loadProgram: async function (instance, widgetID, datestring) {
        console.log(`loadProgram ${datestring}`);
        return await this.getServerTVProgramAsync(instance, widgetID, datestring);
    },
    calcDate: function (datum) {
        const d = new Date(datum);
        const time = d.getHours() + d.getMinutes() / 60;
        if (time >= 0 && time < 5) {
            d.setDate(d.getDate() - 1);
        }
        return d;
    },
    getDate: function (d, add) {
        const d1 = new Date(d);
        d1.setDate(d1.getDate() + add);
        return `${d1.getFullYear()}-${`0${d1.getMonth() + 1}`.slice(-2)}-${`0${d1.getDate()}`.slice(-2)}`;
    },
    compareDate: function (adate, bdate) {
        return (
            adate.getDate() == bdate.getDate() &&
            adate.getMonth() == bdate.getMonth() &&
            adate.getYear() == bdate.getYear()
        );
    },
    getTvprogramId: function (tvprogram_oid) {
        let idParts = tvprogram_oid.split('.');
        if (idParts.length < 2) {
            return '';
        }
        idParts = idParts.slice(0, 3);
        return idParts.join('.');
    },
    getInstance: function (tvprogram_oid) {
        let idParts = tvprogram_oid.split('.');
        if (idParts.length < 2) {
            return '';
        }
        idParts = idParts.slice(0, 2);
        return idParts.join('.');
    },
    getInstanceInfo: function (tvprogram_oid) {
        console.log('getInstanceInfo');
        let idParts = tvprogram_oid.trim().split('.');
        if (idParts.length < 2) {
            return [null, null];
        }
        return [
            idParts.slice(0, 2).join('.'), // instance
            idParts.slice(0, 3).join('.'), // tvprogram id
        ];
    },
    bindStates: function (elem, bound, change_callback) {
        console.log('bindStates');
        const $div = $(elem);
        const boundstates = $div.data('bound');
        if (boundstates) {
            for (let i = 0; i < boundstates.length; i++) {
                vis.states.unbind(boundstates[i], change_callback);
            }
        }
        $div.data('bound', null);
        $div.data('bindHandler', null);

        vis.conn.gettingStates = 0;
        vis.conn.getStates(
            bound,
            function (error, states) {
                vis.conn.subscribe(bound);
                for (let i = 0; i < bound.length; i++) {
                    bound[i] = `${bound[i]}.val`;
                    vis.states.bind(bound[i], change_callback);
                }
                vis.binds['tvprogram'].updateStates(states);
                $div.data('bound', bound);
                $div.data('bindHandler', change_callback);
            }.bind({ change_callback }),
        );
    },
    updateStates: function (states) {
        for (const id in states) {
            if (!Object.prototype.hasOwnProperty.call(states, id)) {
                continue;
            }
            const obj = states[id];
            try {
                if (vis.editMode) {
                    vis.states[`${id}.val`] = obj.val;
                    vis.states[`${id}.ts`] = obj.ts;
                    vis.states[`${id}.ack`] = obj.ack;
                    vis.states[`${id}.lc`] = obj.lc;
                    if (obj.q !== undefined && obj.q !== null) {
                        vis.states[`${id}.q`] = obj.q;
                    }
                } else {
                    const oo = {};
                    oo[`${id}.val`] = obj.val;
                    oo[`${id}.ts`] = obj.ts;
                    oo[`${id}.ack`] = obj.ack;
                    oo[`${id}.lc`] = obj.lc;
                    if (obj.q !== undefined && obj.q !== null) {
                        oo[`${id}.q`] = obj.q;
                    }
                    vis.states.attr(oo);
                }
            } catch (e) {
                console.error(`Error: can't create states object for ${id}(${e})`);
            }
        }
    },
};
