/*
    ioBroker.vis tvprogram Widget-Set

    Copyright 2020 oweitman oweitman@gmx.de
*/
'use strict';
//import axios from 'axios';

/* global vis, $, systemDictionary, window, document, jQuery */

// add translations for edit mode

import { version as pkgVersion } from '../../../package.json';
const dayjs = require('dayjs');

fetch('widgets/tvprogram/i18n/translations.json').then(async res => {
    const i18n = await res.json();

    $.extend(true, systemDictionary, i18n);
});
$.extend(true, systemDictionary, {
    // Add your translations here, e.g.:
    // "size": {
    // 	"en": "Size",
    // 	"de": "Größe",
    // 	"ru": "Размер",
    // 	"pt": "Tamanho",
    // 	"nl": "Grootte",
    // 	"fr": "Taille",
    // 	"it": "Dimensione",
    // 	"es": "Talla",
    // 	"pl": "Rozmiar",
    // 	"zh-cn": "尺寸"
    // }
});

// this code can be placed directly in tvprogram.html
vis.binds['tvprogram'] = {
    version: pkgVersion,
    showVersion: function () {
        if (vis.binds['tvprogram'].version) {
            console.log(`Version tvprogram: ${vis.binds['tvprogram'].version}`);
            vis.binds['tvprogram'].version = null;
        }
    },
    pending: {},
    categories: null,
    channels: null,
    genres: null,
    tvprogram: [],
    infos: null,
    requests: [],
    search: {
        visTvprogram: null,
        bound: {},
        searchdata: [],
        searchresult: [],
        createWidget: async function (widgetID, view, data, style) {
            const $div = $(`#${widgetID}`);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds['tvprogram'].search.createWidget(widgetID, view, data, style);
                }, 100);
            }
            console.log('createWidget start');

            this.visTvprogram = vis.binds['tvprogram'];
            if (!data.tvprogram_oid || data.tvprogram_oid == '') {
                return;
            }
            let [instance, tvprogram_oid] = this.visTvprogram.getInstanceInfo(data.tvprogram_oid);
            if (!tvprogram_oid && !instance) {
                return;
            }

            const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
            if (this.visTvprogram.checkStyle('background-color', $(`#${widgetID}`)[0].style.cssText) == '') {
                $(`#${widgetID}`).css('background-color', backgroundColor);
            }

            const maxresults = parseInt(data.tvprogram_maxresults) || 10;
            const heightrow = parseInt(data.tvprogram_heightRow) || 35;
            const broadcastfontpercent = parseInt(data.tvprogram_broadcastfontpercent) || 75;
            const highlightcolor = data.tvprogram_highlightcolor || 'yellow';
            const showpictures = data.tvprogram_showpictures || false;

            const dialogwidthpercent = data.tvprogram_dialogwidthpercent / 100 || 0.9;
            const dialogheightpercent = data.tvprogram_dialogheightpercent / 100 || 0.9;

            if (!this.searchresult[tvprogram_oid]) {
                this.searchresult[tvprogram_oid] = {};
            }
            if (!this.searchresult[tvprogram_oid][widgetID]) {
                this.searchresult[tvprogram_oid][widgetID] = [];
            }

            if (!this.searchdata[tvprogram_oid]) {
                this.searchdata[tvprogram_oid] = {};
            }
            if (!this.searchdata[tvprogram_oid][widgetID]) {
                this.searchdata[tvprogram_oid][widgetID] = {
                    datefrom: new Date().toISOString().split('T')[0],
                    categoryfilter: '',
                    textfilter: '',
                    maxresults: maxresults || 10,
                };
            }

            if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
            }
            if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
            }

            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                    this.bound[tvprogram_oid][widgetID] = true;
                    vis.binds['tvprogram'].bindStates(
                        $div,
                        [`${tvprogram_oid}.config`, `${tvprogram_oid}.favorites`, `${tvprogram_oid}.channelfilter`],
                        this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid),
                    );
                }
            }
            if (!this.visTvprogram.infos) {
                this.visTvprogram.infos = await this.visTvprogram.loadServerInfosAsync(instance);
            }
            if (!this.visTvprogram.categories) {
                this.visTvprogram.categories = await this.visTvprogram.loadCategories(instance, widgetID);
            }
            if (!this.visTvprogram.channels) {
                this.visTvprogram.channels = await this.visTvprogram.loadChannels(instance, widgetID);
            }

            if (
                this.visTvprogram.infos == null ||
                !Object.prototype.hasOwnProperty.call(this.visTvprogram.infos, 'tvprogram')
            ) {
                return;
            }
            if (this.visTvprogram.categories.length == 0) {
                return;
            }
            if (this.visTvprogram.channels.length == 0) {
                return;
            }
            let categoriesoptions = this.visTvprogram.categories.map(
                cat =>
                    `<option value="${cat.id}" ${
                        this.searchdata[tvprogram_oid][widgetID].categoryfilter == cat.id ? ' selected' : ''
                    }>${cat.title}</option>`,
            );
            categoriesoptions = `<option value="" ${
                this.searchdata[tvprogram_oid][widgetID].categoryfilter == '' ? ' selected' : ''
            }></option>${categoriesoptions}`;

            $(`#${widgetID}broadcastdlg`).data({
                dialogwidthpercent: dialogwidthpercent,
                dialogheightpercent: dialogheightpercent,
            });

            let text = '';
            text += '<style> \n';

            text += `#${widgetID} * {\n`;
            text += '   box-sizing: border-box; \n';
            text += '} \n';

            text += `#${widgetID} .tv-search {\n`;
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   white-space:nowrap; \n';
            text += '   display:flex; \n';
            text += '   flex-direction: column; \n';
            text += '} \n';

            text += `#${widgetID} .tv-form {\n`;
            text += '   padding: 5px 0px; \n';
            text += '} \n';

            text += `#${widgetID} .tv-result {\n`;
            text += '   overflow: hidden; \n';
            text += '   overflow-y: auto; \n';
            text += '} \n';

            text += `#${widgetID} .tv-row {\n`;
            text += '   margin: 0px; \n';
            text += '   padding: 0px; \n';
            text += '   width: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .tv-search .tv-row:nth-child(odd) {\n`;
            text += '   background-color: rgba(128,127,127,.65); \n';
            text += '   padding: 0px; \n';
            text += '} \n';

            text += `#${widgetID} .tv-search .tv-row:nth-child(even) {\n`;
            text += '   background-color: rgba(128,127,127,.55); \n';
            text += '   padding: 0px; \n';
            text += '} \n';

            text += `#${widgetID} .tv-item {\n`;
            text += '   display: inline-block; \n';
            text += '   vertical-align: middle; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width:1px 0px 0px 1px; \n';
            text += '} \n';

            text += `#${widgetID} .channel {\n`;
            text += `   width: ${heightrow}px; \n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 1px; \n';
            text += `   background-color: ${backgroundColor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcast {\n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 3px; \n';
            text += `   font-size: ${broadcastfontpercent}%; \n`;
            text += '   overflow: hidden; \n';
            text += '   width: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement {\n`;
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   display: table-cell; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement .star  {\n`;
            text += '   display: inline-block; \n';
            text += '   margin: 0px 2px; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement .star svg {\n`;
            text += '   height: 1em; \n';
            text += '   width: 1em; \n';
            text += '   position: relative; \n';
            text += '   top: .125em; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected .star svg path {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcastimage {\n`;
            text += `   height: ${heightrow - 7}px; \n`;
            text += '   padding-right: 3px; \n';
            text += '   float: left; \n';
            text += '} \n';

            text += `.${widgetID}.no-titlebar .ui-dialog-titlebar {\n`;
            text += '   display:none; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg  {\n`;
            text += '   z-index:12; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-container.tv-dlg-row {\n`;
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:row; \n';
            text += '   overflow:hidden; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-container.tv-dlg-col {\n`;
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:column; \n';
            text += '   overflow:hidden; \n';
            text += '   font-size:75%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-row {\n`;
            text += '   width:50%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-col {\n`;
            text += '   height:30%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-data {\n`;
            text += '   overflow-y:auto; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture img {\n`;
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture img {\n`;
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';
            text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-row {\n`;
            text += '   flex:1; \n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-col {\n`;
            text += '   padding:5px; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .button {\n`;
            text += '   display:inline-block; \n';
            text += '   width: 35px; \n';
            text += '   height: 35px; \n';
            text += '   vertical-align: middle; \n';
            text += '   position: relative; \n';
            text += '   float: right; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .star.selected svg  {\n`;
            text += '   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected .star svg path, #${
                widgetID
            }broadcastdlg .star.selected {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += '</style> \n';

            text += '  <div class="svgcontainer">';
            text +=
                '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg>
            text += '  </div>';

            text += `  <form data-instance="${instance}" data-dp="${tvprogram_oid}" data-widgetid="${
                widgetID
            }" data-maxresults="${maxresults}" >`;
            text += '    <label for="tvsearch">Search:';
            text += `      <input name="tvsearch" type="text" id="tvsearch" value="${
                this.searchdata[tvprogram_oid][widgetID].textfilter
            }" placeholder="Search">`;
            text += '    </label>';
            text += '    <label for="tvfrom">From:';
            text += `      <input name="tvfrom" autocomplete="off"  type="date" id="tvfrom" min="${
                this.visTvprogram.infos.tvprogram[0]
            }" max="${this.visTvprogram.infos.tvprogram[this.visTvprogram.infos.tvprogram.length - 1]}" value="${
                this.searchdata[tvprogram_oid][widgetID].datefrom
            }">`;
            text += '    </label>';
            text += '    <label for="tvcategory">Category:';
            text += '      <select name="tvcategory" id="tvcategory" >';
            text += categoriesoptions;
            text += '      </select>';
            text += '    </label>';
            text += '  <button>Search</Search>';
            text += '  </form>';

            $(`#${widgetID} .tv-form`).html(text);
            $(`#${widgetID} .tv-form form`).submit(this.onSubmitSearch.bind(this, widgetID, view, data, style));

            let favhighlight, viewdate;
            text = '';
            const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
            this.searchresult[tvprogram_oid][widgetID].map((event, i) => {
                if (i + 1 > maxresults) {
                    return;
                }
                const channel = this.visTvprogram.channels.find(ch => ch.id == event.channel);
                favhighlight = favorites.indexOf(event.title) > -1;
                viewdate = event.airDate;
                text += '    <ul class="tv-row">';
                text += '       <li class="tv-item channel">';
                text += `          <img width="100%" height="100%" data-channelid="${channel.channelId}" data-dp="${
                    tvprogram_oid
                }" data-instance="${instance}" src="https://tvfueralle.de/channel-logos/${
                    channel.channelId
                }.png" alt="" class="channel-logo"  onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
                text += '       </li>';
                text += '       <li class="tv-item broadcast">';
                text += `             <div class="broadcastelement ${favhighlight ? 'selected' : ''}" data-widgetid="${
                    widgetID
                }" data-eventid="${event.id}" data-viewdate="${viewdate}" data-instance="${instance}" data-dp="${
                    tvprogram_oid
                }" data-view="" >`;
                if (event.photo.url && showpictures) {
                    text +=
                        `<div><img class="broadcastimage" src="` + `https://tvfueralle.de${event.photo.url}"></div>`;
                }
                text += '                 <div class="broadcasttitle">';
                text += `                     ${event.title}`;
                text += `                     <div class="star" data-viewdate="${viewdate}" data-eventid="${
                    event.id
                }" data-instance="${instance}" data-dp="${
                    tvprogram_oid
                }" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
                text += '                 </div>';
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                text += '                 <div class="broadcasttime">';
                text += `${`0${startTime.getDate()}`.slice(-2)}.${`0${parseInt(startTime.getMonth() + 1)}`.slice(
                    -2,
                )}.${`0${startTime.getFullYear()}`.slice(-4)} `;
                text += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
                text += ' - ';
                text += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
                text += '                 </div>';
                text += '             </div>';
                text += '       </li>';
                text += '    </ul>';
            });
            $(`#${widgetID} .tv-result`).html(text);
            $(`#${widgetID} .tv-result .broadcastelement`).click(
                vis.binds.tvprogram.onclickBroadcast.bind(this.visTvprogram),
            );
        },
        onSubmitSearch: async function (widgetID, view, data, style, evt) {
            const el = evt.target;
            const instance = el.dataset.instance || '';
            const tvprogram_oid = el.dataset.dp || '';
            //const maxresults = el.dataset.maxresults||10;
            evt.preventDefault();
            const isearch = $(el).find('[name="tvsearch"]').val();
            const icategory = $(el).find('[name="tvcategory"]').val();
            const ifrom = $(el).find('[name="tvfrom"]').val();
            if (!this.parseDatestring(ifrom)) {
                return false;
            }
            let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
            if (channelfilter.length == 0) {
                channelfilter = this.visTvprogram.channels.reduce((acc, el, i) => {
                    if (i < 4) {
                        acc.push(el.id);
                    }
                    return acc;
                }, []);
            }

            if (!this.searchdata[tvprogram_oid]) {
                this.searchdata[tvprogram_oid] = {};
            }
            this.searchdata[tvprogram_oid][widgetID] = Object.assign(this.searchdata[tvprogram_oid][widgetID], {
                datefrom: ifrom,
                categoryfilter: [icategory],
                textfilter: isearch,
            });
            const today = new Date();
            const dFrom = this.parseDatestring(ifrom);
            if (
                today.getDate() == dFrom.getDate() &&
                today.getMonth() == dFrom.getMonth() &&
                today.getFullYear() == dFrom.getFullYear()
            ) {
                dFrom.setHours(today.getHours());
                dFrom.setMinutes(today.getMinutes());
                dFrom.setSeconds(today.getSeconds());
            } else {
                dFrom.setHours(0);
                dFrom.setMinutes(0);
                dFrom.setSeconds(0);
            }
            const dTill = new Date(today);
            dTill.setDate(dTill.getDate() + 10);

            const obj = {
                channelfilter: channelfilter,
                datefrom: dFrom,
                datetill: dTill,
                categoryfilter: icategory == '' ? [] : [parseInt(icategory)],
                textfilter: isearch,
                maxresults: this.searchdata[tvprogram_oid][widgetID].maxresults,
            };
            if (isearch == '' && icategory == '') {
                return false;
            }
            this.searchresult[tvprogram_oid][widgetID] = await this.visTvprogram.getServerBroadcastFindAsync(
                instance,
                obj,
            );
            this.createWidget(widgetID, view, data, style);
        },
        parseDatestring: function (datestring) {
            const b = datestring.split(/\D/);
            const d = new Date(b[0], --b[1], b[2]);
            return d && d.getMonth() == b[1] ? d : false;
        },
        onChange: function (widgetID, view, data, style, tvprogram_oid, e, newVal) {
            const dp = e.type.split('.');
            if (
                (dp[3] == 'config' || dp[3] == 'favorites' || dp[3] == 'channelfilter' || dp[3] == 'show') &&
                dp[4] == 'val'
            ) {
                console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                this.createWidget(widgetID, view, data, style);
            }
        },
    },
    control: {
        visTvprogram: null,
        bound: {},
        programdata: {},

        favorites: undefined,
        timer: {},
        createWidget: async function (widgetID, view, data, style) {
            const $div = $(`#${widgetID}`);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds['tvprogram'].control.createWidget(widgetID, view, data, style);
                }, 100);
            }
            console.log('createWidget control start');
            this.visTvprogram = vis.binds['tvprogram'];
            if (!data.tvprogram_oid || data.tvprogram_oid == '') {
                return;
            }
            let [instance, tvprogram_oid] = this.visTvprogram.getInstanceInfo(data.tvprogram_oid);
            if (!tvprogram_oid && !instance) {
                return;
            }
            this.visTvprogram.categories = await this.visTvprogram.loadCategories(instance, widgetID);
            this.visTvprogram.channels = await this.visTvprogram.loadChannels(instance, widgetID);
            if (this.visTvprogram.channels.length == 0 || this.visTvprogram.categories.length == 0) {
                return;
            }
            const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
            if (this.visTvprogram.checkStyle('background-color', $(`#${widgetID}`)[0].style.cssText) == '') {
                $(`#${widgetID}`).css('background-color', backgroundColor);
            }

            let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
            if (channelfilter.length == 0) {
                channelfilter = this.visTvprogram.channels.reduce((acc, el, i) => {
                    if (i < 4) {
                        acc.push(el.id);
                    }
                    return acc;
                }, []);
            }

            //const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);

            const time = data.tvprogram_time || '';

            if (!this.programdata[tvprogram_oid]) {
                this.programdata[tvprogram_oid] = {};
            }
            let startDate = this.parseTime(time);
            this.programdata[tvprogram_oid][widgetID] = await this.visTvprogram.getServerBroadcastRangeAsync(
                instance,
                channelfilter,
                startDate,
                startDate,
            );

            if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
            }
            if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
            }

            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                    this.bound[tvprogram_oid][widgetID] = true;
                    vis.binds['tvprogram'].bindStates(
                        $div,
                        [`${tvprogram_oid}.config`, `${tvprogram_oid}.favorites`, `${tvprogram_oid}.channelfilter`],
                        this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid),
                    );
                }
            }

            const heightrow = parseInt(data.tvprogram_heightRow) || 35;
            const broadcastfontpercent = parseInt(data.tvprogram_broadcastfontpercent) || 75;
            const highlightcolor = data.tvprogram_highlightcolor || 'yellow';
            const showpictures = data.tvprogram_showpictures || false;

            const dialogwidthpercent = data.tvprogram_dialogwidthpercent / 100 || 0.9;
            const dialogheightpercent = data.tvprogram_dialogheightpercent / 100 || 0.9;
            $(`#${widgetID}broadcastdlg`).data({
                dialogwidthpercent: dialogwidthpercent,
                dialogheightpercent: dialogheightpercent,
            });

            let text = '';
            text += '<style> \n';

            text += `#${widgetID} * {\n`;
            text += '   box-sizing: border-box; \n';
            text += '} \n';

            text += `#${widgetID} .tv-control {\n`;
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   white-space:nowrap; \n';
            text += '   display:flex; \n';
            text += '   flex-direction: column; \n';
            text += '   overflow: hidden; \n';
            text += '   overflow-y: auto; \n';
            text += '} \n';

            text += `#${widgetID} .tv-row {\n`;
            text += '   margin: 0px; \n';
            text += '   padding: 0px; \n';
            text += '   width: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .tv-control .tv-row:nth-child(odd) {\n`;
            text += '   background-color: rgba(128,127,127,.65); \n';
            text += '   padding: 0px; \n';
            text += '} \n';

            text += `#${widgetID} .tv-control .tv-row:nth-child(even) {\n`;
            text += '   background-color: rgba(128,127,127,.55); \n';
            text += '   padding: 0px; \n';
            text += '} \n';

            text += `#${widgetID} .tv-item {\n`;
            text += '   display: inline-block; \n';
            text += '   vertical-align: middle; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width:1px 0px 0px 1px; \n';
            text += '} \n';

            text += `#${widgetID} .channel {\n`;
            text += `   width: ${heightrow}px; \n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 1px; \n';
            text += `   background-color: ${backgroundColor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcast {\n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 3px; \n';
            text += `   font-size: ${broadcastfontpercent}%; \n`;
            text += '   overflow: hidden; \n';
            text += '   width: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement {\n`;
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   display: table-cell; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement .star  {\n`;
            text += '   display: inline-block; \n';
            text += '   margin: 0px 2px; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement .star svg {\n`;
            text += '   height: 1em; \n';
            text += '   width: 1em; \n';
            text += '   position: relative; \n';
            text += '   top: .125em; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected .star svg path {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcastimage {\n`;
            text += `   height: ${heightrow - 7}px; \n`;
            text += '   padding-right: 3px; \n';
            text += '   float: left; \n';
            text += '} \n';

            text += `.${widgetID}.no-titlebar .ui-dialog-titlebar {\n`;
            text += '   display:none; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg  {\n`;
            text += '   z-index:12; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-container.tv-dlg-row {\n`;
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:row; \n';
            text += '   overflow:hidden; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-container.tv-dlg-col {\n`;
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:column; \n';
            text += '   overflow:hidden; \n';
            text += '   font-size:75%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-row {\n`;
            text += '   width:50%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-col {\n`;
            text += '   height:30%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-data {\n`;
            text += '   overflow-y:auto; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture img {\n`;
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture img {\n`;
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';
            text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-row {\n`;
            text += '   flex:1; \n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-col {\n`;
            text += '   padding:5px; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .button {\n`;
            text += '   display:inline-block; \n';
            text += '   width: 35px; \n';
            text += '   height: 35px; \n';
            text += '   vertical-align: middle; \n';
            text += '   position: relative; \n';
            text += '   float: right; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .star.selected svg  {\n`;
            text += '   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected .star svg path, #${
                widgetID
            }broadcastdlg .star.selected {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += '</style> \n';

            text += '  <div class="svgcontainer">';
            text +=
                '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg>
            text += '  </div>';

            let favhighlight;
            const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);

            this.programdata[tvprogram_oid][widgetID].map(ch => {
                ch.events.map(event => {
                    let viewdate = this.visTvprogram.getDate(event.startTime, 0);
                    const channel = this.visTvprogram.channels.find(ch => ch.id == event.channel);
                    favhighlight = favorites.indexOf(event.title) > -1;
                    text += '    <ul class="tv-row">';
                    text += '       <li class="tv-item channel">';
                    text += `          <img width="100%" height="100%" data-channelid="${channel.channelId}" data-dp="${
                        tvprogram_oid
                    }" src="https://tvfueralle.de/channel-logos/${
                        channel.channelId
                    }.png" alt="" class="channel-logo"  onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
                    text += '       </li>';
                    text += '       <li class="tv-item broadcast">';
                    text += `             <div class="broadcastelement ${
                        favhighlight ? 'selected' : ''
                    }" data-widgetid="${widgetID}" data-eventid="${event.id}" data-viewdate="${
                        viewdate
                    }" data-instance="${instance}" data-dp="${tvprogram_oid}" data-view="${
                        view
                    }" onclick="vis.binds.tvprogram.onclickBroadcast(this)">`;
                    if (event.photo.url && showpictures) {
                        text +=
                            `<div><img class="broadcastimage" src="` +
                            `https://tvfueralle.de${event.photo.url}"></div>`;
                    }
                    text += '                 <div class="broadcasttitle">';
                    text += `                     ${event.title}`;
                    text += `                     <div class="star" data-viewdate="${viewdate}" data-eventid="${
                        event.id
                    }" data-instance="${instance}" data-dp="${
                        tvprogram_oid
                    }" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
                    text += '                 </div>';
                    const startTime = new Date(event.startTime);
                    const endTime = new Date(event.endTime);
                    text += '                 <div class="broadcasttime">';
                    text += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
                    text += ' - ';
                    text += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
                    text += '                 </div>';
                    text += '             </div>';
                    text += '       </li>';
                    text += '    </ul>';
                });
            });
            $(`#${widgetID} .tv-control`).html(text);
            if (!this.timer[widgetID]) {
                clearInterval(this.timer[widgetID]);
            }
            this.timer[widgetID] = setTimeout(
                () => {
                    vis.binds['tvprogram'].control.createWidget(widgetID, view, data, style);
                },
                1000 * 60 * 5,
            );
        },
        parseTime: function (time) {
            let startDate;
            let endDate;
            const date = new Date(time);
            if (date instanceof Date && !isNaN(date)) {
                return date;
            }
            if (time == '') {
                return new Date();
            }
            let iTime = time.split('/');
            let duration = 120;
            if (iTime.length > 1 && parseInt(iTime[1].trim()) > 0) {
                duration = parseInt(iTime[1].trim());
            }
            iTime = iTime[0].split(':');
            endDate = new Date();
            endDate.setHours(parseInt(iTime[0]));
            endDate.setMinutes(parseInt(iTime[1]));
            endDate.setSeconds(0);
            startDate = new Date(endDate);
            endDate.setMinutes(endDate.getMinutes() + duration);
            if (new Date() < endDate) {
                return startDate;
            }
            return startDate.setDate(startDate.getDate() + 1);
        },
        onChange: function (widgetID, view, data, style, tvprogram_oid, e, newVal) {
            const dp = e.type.split('.');
            if (
                (dp[3] == 'config' || dp[3] == 'favorites' || dp[3] == 'channelfilter' || dp[3] == 'show') &&
                dp[4] == 'val'
            ) {
                console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                this.tvprogram = [];
                this.createWidget(widgetID, view, data, style);
            }
        },
    },
    favorites: {
        visTvprogram: null,
        pending: {},
        bound: {},
        favorites: undefined,
        timer: {},
        createWidget: async function (widgetID, view, data, style) {
            const $div = $(`#${widgetID}`);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds['tvprogram'].favorites.createWidget(widgetID, view, data, style);
                }, 100);
            }
            console.log('createWidget start');

            this.visTvprogram = vis.binds['tvprogram'];

            const showweekday = data.tvprogram_showweekday || false;
            const maxfavorites = data.tvprogram_maxfavorites || 10;
            const highlightcolor = data.tvprogram_highlightcolor || 'yellow';
            const channelname = data.tvprogram_channelname || false;

            let tvprogram_oid;
            let instance;

            const weekday_options = { weekday: 'short' };
            const date_options = { month: '2-digit', day: '2-digit' };
            const time_options = { hour: '2-digit', minute: '2-digit' };

            if (
                !data.tvprogram_oid ||
                (tvprogram_oid = vis.binds['tvprogram'].getTvprogramId(data.tvprogram_oid.trim())) == false
            ) {
                return;
            }
            if (
                !data.tvprogram_oid ||
                (instance = vis.binds['tvprogram'].getInstance(data.tvprogram_oid.trim())) == false
            ) {
                return;
            }

            const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
            if (this.visTvprogram.checkStyle('background-color', $(`#${widgetID}`)[0].style.cssText) == '') {
                $(`#${widgetID}`).css('background-color', backgroundColor);
            }

            if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
            }
            if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
            }

            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                    this.bound[tvprogram_oid][widgetID] = true;
                    vis.binds['tvprogram'].bindStates(
                        $div,
                        [`${tvprogram_oid}.config`, `${tvprogram_oid}.favorites`],
                        this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid),
                    );
                }
            }

            const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);

            if (!this.favorites || (!this.favorites[tvprogram_oid] && favorites)) {
                let favoritesData = await this.visTvprogram.getFavoritesDataAsync(instance, favorites);
                if (!this.favorites) {
                    this.favorites = [];
                }
                this.favorites[tvprogram_oid] = favoritesData;
                this.createWidget(widgetID, view, data, style);
                /*                 this.visTvprogram.getFavoritesData(
                    instance,
                    favorites,
                    function (widgetID, view, data, style, tvprogram_oid, serverdata) {
                        if (!this.favorites) {
                            this.favorites = [];
                        }
                        this.favorites[tvprogram_oid] = serverdata;
                        this.createWidget(widgetID, view, data, style);
                    }.bind(this, widgetID, view, data, style, tvprogram_oid),
                ); */
            }
            if (!this.favorites || !this.favorites[tvprogram_oid]) {
                return;
            }

            let text = '';
            text += '<style> \n';
            text += `#${widgetID} .tv-fav {\n`;
            text += '   width: 100%;\n';
            text += '} \n';
            text += `#${widgetID} .tv-fav td{\n`;
            text += '   white-space: nowrap;\n';
            text += '} \n';
            text += `#${widgetID} .tv-left {\n`;
            text += '   text-align: left;\n';
            text += '   width: 1%;\n';
            text += '} \n';
            text += `#${widgetID} .tv-full {\n`;
            text += '   width: 50%;\n';
            text += '} \n';
            text += `#${widgetID} .tv-fav .star {\n`;
            text += '   width: 1em;\n';
            text += '   height: 1em;\n';
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';
            text += `#${widgetID} .tv-center {\n`;
            text += '   text-align: center;\n';
            text += '   width: 1%;\n';
            text += '} \n';
            text += `#${widgetID} .tv-icon {\n`;
            text += '   height: 1em; \n';
            text += '   width: 1em; \n';
            text += '} \n';

            text += '</style> \n';

            text += '  <div class="svgcontainer">';
            text +=
                '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg>
            text += '  </div>';

            text += '<table class="tv-fav">';
            this.favorites[tvprogram_oid] = this.favorites[tvprogram_oid].filter(
                el => new Date(el.endTime) >= new Date(),
            );
            this.favorites[tvprogram_oid].forEach(function (favorite, index) {
                const today = new Date();
                const startTime = new Date(favorite.startTime);
                const endTime = new Date(favorite.endTime);
                if (index < maxfavorites) {
                    vis.binds['tvprogram'].compareDate(today, startTime)
                        ? (text += '        <tr class="tv-today">')
                        : (text += '        <tr>');
                    text += `<td class="tv-left" data-viewdate="${favorite.viewdate}" data-eventid="${
                        favorite.id
                    }" data-instance="${instance}" data-dp="${
                        tvprogram_oid
                    }" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><div class="star"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div></td>`;
                    if (showweekday) {
                        text += `           <td class="tv-left">${startTime.toLocaleString(
                            vis.language,
                            weekday_options,
                        )}</td>`;
                    }
                    text += `           <td class="tv-left">${startTime.toLocaleString(
                        vis.language,
                        date_options,
                    )}</td>`;
                    text += `           <td class="tv-left">${startTime.toLocaleString(
                        vis.language,
                        time_options,
                    )}</td>`;
                    text += '           <td class="tv-left">-</td>';
                    text += `           <td class="tv-left">${endTime.toLocaleString(vis.language, time_options)}</td>`;
                    if (channelname) {
                        text += `           <td class="tv-left">${favorite.channelname}</td>`;
                    } else {
                        text += '           <td class="tv-center tv-tdicon">';
                        text += `              <img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/${
                            favorite.channelid
                        }.png" alt="" class="tv-icon">`;
                        text += '           </td>';
                    }
                    text += `           <td class="tv-full">${favorite.title}</td>`;
                    text += '        </tr>';
                }
            });
            text += '</table>            ';

            $(`#${widgetID}`).html(text);
            if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(
                    vis.binds['tvprogram'].favorites.createWidget.bind(this, widgetID, view, data, style),
                    1000 * 60,
                );
            } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(
                    vis.binds['tvprogram'].favorites.createWidget.bind(this, widgetID, view, data, style),
                    1000 * 60,
                );
            }
        },
        onChange: function (widgetID, view, data, style, tvprogram_oid, e, newVal) {
            const dp = e.type.split('.');
            if (
                (dp[3] == 'config' || dp[3] == 'favorites' || dp[3] == 'channelfilter' || dp[3] == 'show') &&
                dp[4] == 'val'
            ) {
                console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                this.favorites = [];
                this.createWidget(widgetID, view, data, style);
            }
        },
    },
    time1: {
        visTvprogram: null,
        tvprogram: {},
        bound: {},
        timer: {},
        pending: {},
        measures: {},
        scroll: {},
        today: {},
        viewday: {},
        olddata: {},
        createWidget: async function (widgetID, view, data, style) {
            const $div = $(`#${widgetID}`);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds['tvprogram'].time1.createWidget(widgetID, view, data, style);
                }, 100);
            }
            console.log(`createWidget start ${widgetID}`);
            this.visTvprogram = vis.binds['tvprogram'];
            if (!data.tvprogram_oid || data.tvprogram_oid == '') {
                return;
            }
            let [instance, tvprogram_oid] = this.visTvprogram.getInstanceInfo(data.tvprogram_oid);
            if (!tvprogram_oid && !instance) {
                return;
            }

            const highlightcolor = data.tvprogram_highlightcolor || 'yellow';
            if (!this.olddata[widgetID]) {
                this.olddata[widgetID] = data;
            }
            if (!this.measures[widgetID] || JSON.stringify(this.olddata[widgetID]) != JSON.stringify(data)) {
                this.measures[widgetID] = {
                    origwidthItem: parseInt(data.tvprogram_widthItem) || 120,
                    timeItem: 30,
                    heightRow: parseInt(data.tvprogram_heightRow) || 35,
                    scrollbarWidth: this.getScrollbarWidth(),
                    markerpositionpercent: data.tvprogram_markerpositionpercent / 100 || 0.25,
                    dialogwidthpercent: data.tvprogram_dialogwidthpercent / 100 || 0.9,
                    dialogheightpercent: data.tvprogram_dialogheightpercent / 100 || 0.9,
                    showpictures: data.tvprogram_showpictures || false,
                };
            }
            $(`#${widgetID}broadcastdlg`).data({
                dialogwidthpercent: this.measures[widgetID].dialogwidthpercent,
                dialogheightpercent: this.measures[widgetID].dialogheightpercent,
            });
            if (!this.measures[widgetID].widthItem) {
                this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
            }

            if (!((this.today || {})[widgetID] || {}).prevday) {
                $(`#${widgetID} .tv-container`).html('Datapoints loading...');
            }

            console.log('Load Data');
            if (!this.visTvprogram.categories) {
                this.visTvprogram.categories = await this.visTvprogram.loadCategories(instance, widgetID);
            }
            if (!this.visTvprogram.channels) {
                this.visTvprogram.channels = await this.visTvprogram.loadChannels(instance, widgetID);
            }
            if (!this.visTvprogram.genres) {
                this.visTvprogram.genres = await this.visTvprogram.loadGenres(instance, widgetID);
            }

            function check(prop) {
                if (!prop) {
                    return true;
                }
                if (Object.keys(prop) == 0) {
                    return true;
                }
                return false;
            }

            if (!this.today[widgetID]) {
                this.today[widgetID] = { today: new Date(), prevday: null };
            }
            if (!this.scroll[widgetID]) {
                this.scroll[widgetID] = { time: new Date(0), position: 0, marker: 0, timeout: null, automatic: 0 };
            }

            console.log('Calc Date');
            const d = this.visTvprogram.calcDate(this.today[widgetID].today);
            const datestring = this.visTvprogram.getDate(d, 0);
            if (!this.viewday[widgetID]) {
                this.viewday[widgetID] = { viewday: datestring, prevday: null };
            }
            this.viewday[widgetID].viewday = datestring;

            const viewdate = this.visTvprogram.getDate(d, 0);

            if (check(this.tvprogram[datestring])) {
                this.tvprogram[datestring] = await this.visTvprogram.loadProgram(instance, widgetID, datestring);
            }
            if (this.visTvprogram.categories.length == 0 || this.visTvprogram.categories[0] === 'request') {
                return;
            }
            if (this.visTvprogram.channels.length == 0 || this.visTvprogram.channels[0] === 'request') {
                return;
            }
            if (this.visTvprogram.genres.length == 0 || this.visTvprogram.genres[0] === 'request') {
                return;
            }
            if (check(this.tvprogram[datestring])) {
                return;
            }

            if (this.viewday[widgetID]['viewday'] != this.viewday[widgetID]['prevday']) {
                this.viewday[widgetID]['prevday'] = this.viewday[widgetID]['viewday'];
            }

            if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
            }
            if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
            }

            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                    this.bound[tvprogram_oid][widgetID] = true;
                    vis.binds['tvprogram'].bindStates(
                        $div,
                        [
                            `${tvprogram_oid}.config`,
                            `${tvprogram_oid}.cmd`,
                            `${tvprogram_oid}.favorites`,
                            `${tvprogram_oid}.channelfilter`,
                            `${tvprogram_oid}.show`,
                        ],
                        this.onChange.bind(this, widgetID, view, data, style, instance),
                    );
                }
            }

            if (this.onclickChannelSave.name == 'onclickChannelSave') {
                this.onclickChannelSave = this.onclickChannelSave.bind(this);
            }

            console.log('Calc Channels');
            let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
            if (channelfilter.length == 0) {
                channelfilter = this.visTvprogram.channels.reduce((acc, el, i) => {
                    if (i < 4) {
                        acc.push(el.id);
                    }
                    return acc;
                }, []);
            }

            console.log('Calc styles');
            const widthitem = this.measures[widgetID].widthItem;
            const widthchannel = this.measures[widgetID].heightRow;
            const heightrow = this.measures[widgetID].heightRow;

            const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
            if (this.visTvprogram.checkStyle('background-color', $(`#${widgetID}`)[0].style.cssText) == '') {
                $(`#${widgetID}`).css('background-color', backgroundColor);
            }
            const widthtvrow = 48 * widthitem + widthchannel;
            //const scrollbarWidth= this.getScrollbarWidth();
            //const zoompos = (Math.min(Math.floor($("#"+widgetID).height()/heightrow)-1,channelfilter.length))*heightrow;

            const headerfontpercent = data.tvprogram_headerfontpercent || 125;
            const broadcastfontpercent = data.tvprogram_broadcastfontpercent || 75;

            let lineheight = 0;
            const widgetheight = $(`#${widgetID}`).height() - heightrow;
            const contentheight = (channelfilter.length + 1) * heightrow;

            if (contentheight < widgetheight) {
                lineheight = contentheight;
            } else {
                lineheight = widgetheight - this.measures[widgetID].scrollbarWidth;
            }

            console.log(`Display day:${datestring}`);
            console.log('Output CSS');
            let text = '';
            text += '<style> \n';

            text += `#${widgetID} * {\n`;
            text += '   box-sizing: border-box; \n';
            text += '} \n';

            text += `#${widgetID} .tv-container {\n`;
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   white-space:nowrap; \n';
            text += '   display:flex; \n';
            text += '   flex-direction: column; \n';
            text += '} \n';

            text += `#${widgetID} .navcontainer {\n`;
            text += '   width: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .scrollcontainer {\n`;
            text += '   flex-grow: 1; \n';
            text += '   overflow:auto; \n';
            text += '   width:100%; \n';
            text += '} \n';

            text += `#${widgetID} .tv-row {\n`;
            text += '   margin: 0px; \n';
            text += '   padding: 0px; \n';
            text += `   width: ${widthtvrow}px; \n`;
            text += '} \n';

            text += `#${widgetID} .tv-item {\n`;
            text += '   display: inline-block; \n';
            text += '   vertical-align: middle; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width:1px 0px 0px 1px; \n';
            text += '} \n';

            text += `#${widgetID} .tv-head-time {\n`;
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   top:0px; \n';
            text += '   z-index:11; \n';
            text += `   background-color: ${backgroundColor}; \n`;
            text += '} \n';

            text += `#${widgetID} .tv-head-left {\n`;
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   left:0; \n';
            text += '   z-index:11; \n';
            text += `   background-color: ${backgroundColor}; \n`;
            text += '} \n';

            text += `#${widgetID} svg rect {\n`;
            text += `   fill: ${$(`#${widgetID}`).css('color')}; \n`;
            text += '} \n';

            text += `#${widgetID} .channel {\n`;
            text += `   width: ${heightrow}px; \n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 1px; \n';
            text += '} \n';

            text += `#${widgetID} .time {\n`;
            text += `   width: ${widthitem}px; \n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   font-weight: 700; \n';
            text += `   font-size: ${headerfontpercent}%; \n`;
            text += '   padding: 5px 5px; \n';
            text += '} \n';

            text += `#${widgetID} .time:after {\n`;
            text += '   content:""; \n';
            text += '   display: inline-block; \n';
            text += '   vertical-align:middle; \n';
            text += '   height: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .time span {\n`;
            text += '   vertical-align:middle; \n';
            text += '} \n';

            text += `#${widgetID} .broadcast {\n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 3px; \n';
            text += `   font-size: ${broadcastfontpercent}%; \n`;
            text += '   overflow: hidden; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement {\n`;
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   display: table-cell; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement.hide {\n`;
            text += '   display: none; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement .star  {\n`;
            text += '   display: inline-block; \n';
            text += '   margin: 0px 2px; \n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement .star svg {\n`;
            text += '   height: 1em; \n';
            text += '   width: 1em; \n';
            text += '   position: relative; \n';
            text += '   top: .125em; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .star.selected svg  {\n`;
            text += '   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n';
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected .star svg path, #${
                widgetID
            }broadcastdlg .star.selected {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcastelement.selected {\n`;
            text += `   color: ${highlightcolor}; \n`;
            text += `   background-color: ${this.visTvprogram.colorToRGBA(highlightcolor, '.1')}; \n`;
            text += '} \n';

            text += `#${widgetID} .broadcastimage {\n`;
            text += `   height: ${heightrow - 7}px; \n`;
            text += '   padding-right: 3px; \n';
            text += '   float: left; \n';
            text += '} \n';

            text += `#${widgetID} .button {\n`;
            text += '   display:inline-block; \n';
            text += `   width: ${heightrow}px; \n`;
            text += `   height: ${heightrow}px; \n`;
            text += `   background-color: ${backgroundColor}; \n`;
            text += '   vertical-align: middle; \n';
            text += '   padding: 5px 5px; \n';
            text += '} \n';

            text += `#${widgetID} .dateinfo {\n`;
            text += `   height: ${heightrow}px; \n`;
            text += '   padding: 5px 5px; \n';
            text += '   position: absolute; \n';
            text += '   right: 0px; \n';
            text += '   border: 0px; \n';
            text += '} \n';

            text += `#${widgetID} .dateinfo:after {\n`;
            text += '   content:""; \n';
            text += '   display: inline-block; \n';
            text += '   vertical-align:middle; \n';
            text += '   height: 100%; \n';
            text += '} \n';

            text += `#${widgetID} .dateinfo span {\n`;
            text += '   vertical-align:middle; \n';
            text += '} \n';

            text += `.ui-dialog.${widgetID} {\n`;
            text += '   z-index:12; \n';
            text += '} \n';

            text += '.clearfix {\n';
            text += '   clear:both; \n';
            text += '   content:""; \n';
            text += '   display:table; \n';
            text += '} \n';

            text += `#${widgetID}channeldlg .chselect-container {\n`;
            text += '} \n';

            text += `#${widgetID}channeldlg ul.channel {\n`;
            text += '   margin:0px; \n';
            text += '   padding:0px; \n';
            text += '} \n';

            text += `#${widgetID}channeldlg .listitem  {\n`;
            text += '   float: left; \n';
            text += '} \n';

            text += `#${widgetID}channeldlg .listitem .channel {\n`;
            text += '   list-style: none; \n';
            text += '} \n';

            text += `#${widgetID}channeldlg .items  {\n`;
            text += '   list-style: none; \n';
            text += '   margin:0px; \n';
            text += '   padding:0px; \n';
            text += '} \n';

            text += `#${widgetID}channeldlg .channel {\n`;
            text += '   margin:5px; \n';
            text += `   width: ${heightrow * 1.5}px; \n`;
            text += `   height: ${heightrow * 1.5}px; \n`;
            text += '   list-style: none; \n';
            text += '} \n';

            text += `#${widgetID}channeldlg .items .channel[selected] {\n`;
            text += '   background-color:lightgray; \n';
            text += '} \n';

            text += `.${widgetID}.no-titlebar .ui-dialog-titlebar {\n`;
            text += '   display:none; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg  {\n`;
            text += '   z-index:12; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-container.tv-dlg-row {\n`;
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:row; \n';
            text += '   overflow:hidden; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-container.tv-dlg-col {\n`;
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:column; \n';
            text += '   overflow:hidden; \n';
            text += '   font-size:75%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-row {\n`;
            text += '   width:50%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-col {\n`;
            text += '   height:30%; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-data {\n`;
            text += '   overflow-y:auto; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture img {\n`;
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .event-picture img {\n`;
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';
            text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-row {\n`;
            text += '   flex:1; \n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-col {\n`;
            text += '   padding:5px; \n';
            text += '} \n';

            text += `#${widgetID}broadcastdlg .button {\n`;
            text += '   display:inline-block; \n';
            text += '   width: 35px; \n';
            text += '   height: 35px; \n';
            text += '   vertical-align: middle; \n';
            text += '   position: relative; \n';
            text += '   float: right; \n';
            text += '} \n';

            text += `#${widgetID} .tooltip {\n`;
            text += '   position: relative; \n';
            text += '} \n';
            text += `#${widgetID} .tooltip span[role=tooltip] {\n`;
            text += '   display: none; \n';
            text += '} \n';

            text += `#${widgetID} .tooltip:hover span[role=tooltip] {\n`;
            text += '   display: block; \n';
            text += '   position: absolute; \n';
            text += '   left: 3em; \n';
            text += '   border: 1px solid; \n';
            text += '   font-size: 75%; \n';
            text += '   padding: 0.2em; \n';
            text += '   z-index: 100; \n';
            text += `   background-color: ${backgroundColor}; \n`;
            text += '} \n';

            text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(odd)> li.broadcast:nth-child(odd),#${
                widgetID
            } ul.tv-row:nth-child(odd)> li.time:nth-child(odd) {\n`;
            text += '   background-color: rgba(128, 128, 128, 0.65); \n';
            text += '} \n';
            text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(odd)> li.broadcast:nth-child(even),#${
                widgetID
            } ul.tv-row:nth-child(odd)> li.time:nth-child(even) {\n`;
            text += '   background-color: rgba(128, 128, 128, 0.55); \n';
            text += '} \n';

            text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(even)> li.broadcast:nth-child(odd) {\n`;
            text += '   background-color: rgba(128, 128, 128, 0.45); \n';
            text += '} \n';
            text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(even)> li.broadcast:nth-child(even) {\n`;
            text += '   background-color: rgba(128, 128, 128, 0.35); \n';
            text += '} \n';

            text += `#${widgetID} .line {\n`;
            text += '   position: absolute; \n';
            text += '   top: 0; \n';
            text += '   width: 2px; \n';
            text += '   background-color: red; \n';
            text += '   opacity: 0.8; \n';
            text += '   z-index: 10; \n';
            text += `   height: ${lineheight}px; \n`;
            text += '   float: left; \n';
            text += '} \n';

            text += `#${widgetID} .disable-select {\n`;
            text += '   -webkit-user-select: none; \n';
            text += '   -moz-user-select: none; \n';
            text += '   -ms-user-select: none; \n';
            text += '   -user-select: none; \n';
            text += '} \n';

            text += `#${widgetID} .staricon {\n`;
            text +=
                "     background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24'><path fill='currentColor' d='M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' /></svg>\"); \n";
            text += '} \n';
            //https://mayashavin.com/articles/svg-icons-currentcolor

            text += '</style> \n';
            console.log('Output SVG');
            text += '  <div class="svgcontainer">';
            text +=
                '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="check-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#check-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="cancel-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#cancel-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="burger-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#burger-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="nav-prevD-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20,9V15H12V19.84L4.16,12L12,4.16V9H20Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#nav-prevD-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="nav-center-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#nav-center-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="nav-nextD-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#nav-nextD-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="zoom-minus-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#zoom-minus-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="zoom-center-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M19,19H15V21H19A2,2 0 0,0 21,19V15H19M19,3H15V5H19V9H21V5A2,2 0 0,0 19,3M5,5H9V3H5A2,2 0 0,0 3,5V9H5M5,15H3V19A2,2 0 0,0 5,21H9V19H5V15Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#zoom-center-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="zoom-plus-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#zoom-plus-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg>
            text +=
                '<svg style="display:none;"><symbol id="hide-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z" /></symbol></svg>';
            //text += '<svg style="display:none;"><symbol id="hide-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#hide-icon"></use></svg>

            text += '  </div>';

            console.log('Output Navigation');
            text += '  <div class="navcontainer">';
            text += '    <ul class="tv-row tv-head-top">';
            text += this.getButtonHeader(datestring).join('');
            text += '    </ul>';
            text += '  </div>';
            console.log('Output tvprogram');
            text += '  <div class="scrollcontainer">';
            text += '    <ul class="tv-row tv-head-time">';
            text += '      <div class="line"></div>';
            text += '      <li class="tv-item tv-head-left channel">';
            text += '      </li>';

            text += this.getTimetable().join('');
            text += '    </ul>';
            const events = this.getEvents(this.tvprogram[viewdate], channelfilter);
            events.map(el => {
                text += '    <ul class="tv-row">';
                text += this.getBroadcasts4Channel(el, widgetID, view, viewdate, tvprogram_oid, instance).join('');
                text += '    </ul>';
            });

            $(`#${widgetID} .tv-container`).html(text);

            if (this.visTvprogram.getConfigShow(tvprogram_oid) == 1) {
                $(`#${widgetID} .broadcastelement:not(".selected") > *`).show();
            } else {
                $(`#${widgetID} .broadcastelement:not(".selected") > *`).hide();
            }

            console.log('Connect Buttone events');
            $(`#${widgetID} .burger`).click(
                function (widgetID, tvprogram_oid, instance, el) {
                    vis.binds.tvprogram.time1.onclickChannel(widgetID, instance, tvprogram_oid, el);
                }.bind(this, widgetID, tvprogram_oid, instance),
            );

            $(`#${widgetID} .button.nav.prevD`)
                .off('click.onClickDay')
                .on('click.onClickDay', this.onClickDay.bind(this, widgetID, view, data, style));
            $(`#${widgetID} .button.nav.nextD`)
                .off('click.onClickDay')
                .on('click.onClickDay', this.onClickDay.bind(this, widgetID, view, data, style));
            $(`#${widgetID} .button.nav.center`)
                .off('click.onClickDay')
                .on('click.onClickDay', this.onClickDay.bind(this, widgetID, view, data, style));

            $(`#${widgetID} .button.zoom.minus`)
                .off('click.onClickZoom')
                .on('click.onClickZoom', this.onClickZoom.bind(this, widgetID, view, data, style));
            $(`#${widgetID} .button.zoom.plus`)
                .off('click.onClickZoom')
                .on('click.onClickZoom', this.onClickZoom.bind(this, widgetID, view, data, style));
            $(`#${widgetID} .button.zoom.center`)
                .off('click.onClickZoom')
                .on('click.onClickZoom', this.onClickZoom.bind(this, widgetID, view, data, style));
            $(`#${widgetID} .button.hide`)
                .off('click.onClickHide')
                .on('click.onClickHide', this.onClickHide.bind(this, instance, tvprogram_oid, widgetID));

            $(`#${widgetID} .scrollcontainer`).scroll(
                function (widgetID) {
                    if (this.scroll[widgetID].automatic == 0) {
                        this.scroll[widgetID].automatic = 2;
                    }
                    this.scroll[widgetID].time = new Date();
                    this.calcScroll(widgetID);
                }.bind(this, widgetID),
            );
            this.visTvprogram.copyStyles('font', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
            this.visTvprogram.copyStyles('color', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
            this.visTvprogram.copyStyles(
                'background-color',
                $(`#${widgetID}`).get(0),
                $(`#${widgetID}broadcastdlg`).get(0),
            );

            this.updateMarker(widgetID, this.today[widgetID].today);
            if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(
                    this.updateMarker.bind(this, widgetID, this.today[widgetID].today),
                    15000,
                );
            } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(
                    this.updateMarker.bind(this, widgetID, this.today[widgetID].today),
                    15000,
                );
            }

            if (this.scroll[widgetID].position == 0) {
                this.calcScroll(widgetID);
                this.setScroll(widgetID);
            } else {
                this.setScroll(widgetID);
            }
            console.log('Output done');
        },
        onClickHide: function (instance, tvprogram) {
            this.visTvprogram.toggleShow(instance, tvprogram);
        },
        onClickZoom: function (widgetID, view, data, style, el) {
            if ($(el.currentTarget).hasClass('plus')) {
                this.measures[widgetID].widthItem =
                    this.measures[widgetID].widthItem + this.measures[widgetID].origwidthItem / 4;
                console.log('Click Zoom plus');
            }
            if ($(el.currentTarget).hasClass('minus')) {
                this.measures[widgetID].widthItem =
                    this.measures[widgetID].widthItem - this.measures[widgetID].origwidthItem / 4;
                console.log('Click Zoom minus');
            }
            if ($(el.currentTarget).hasClass('center')) {
                this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
                console.log('Click Zoom center');
            }
            if (this.measures[widgetID].widthItem < 20) {
                this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
                console.log('Click Zoom Max zoom reached, reset');
            }
            this.calcScroll(widgetID);
            this.createWidget(widgetID, view, data, style);
        },
        onClickDay: function (widgetID, view, data, style, el) {
            console.log(`ClickNav:${$(el.currentTarget).attr('class')}`);
            let day = 0;
            if ($(el.currentTarget).hasClass('prevD')) {
                day = -1;
            }
            if ($(el.currentTarget).hasClass('nextD')) {
                day = 1;
            }
            let newDate = dayjs(this.today[widgetID]['today']).add(day, 'day');
            let diffDate = dayjs(newDate).diff(dayjs(), 'day');
            if (!$(el.currentTarget).hasClass('center')) {
                if (diffDate > -5 && diffDate < 5) {
                    this.today[widgetID]['prevday'] = new Date(this.today[widgetID]['today']);
                    this.today[widgetID]['today'] = newDate.toDate();
                    console.log(`Navigate to date: ${dayjs(newDate).format()}`);
                }
            } else {
                this.today[widgetID]['today'] = new Date();
                this.scroll[widgetID].position = 0;
            }
            this.scroll[widgetID].time = new Date(0);
            this.createWidget(widgetID, view, data, style);
        },
        calcScroll: function (widgetID) {
            const el = $(`#${widgetID} .scrollcontainer`).get(0);
            if (!el) {
                return;
            }
            if (el.scrollLeft == 0 || this.scroll[widgetID].position == 0) {
                this.scroll[widgetID].position = this.scroll[widgetID].marker / el.scrollWidth;
            } else {
                this.scroll[widgetID].position =
                    (el.scrollLeft + el.clientWidth * this.measures[widgetID].markerpositionpercent) / el.scrollWidth;
            }
        },
        setScroll: function (widgetID) {
            try {
                const el = $(`#${widgetID} .scrollcontainer`).get(0);
                if (!el.scrollWidth) {
                    return;
                }
                el.scrollLeft =
                    this.scroll[widgetID].position * el.scrollWidth -
                    el.clientWidth * this.measures[widgetID].markerpositionpercent;
            } catch (e) {
                console.log(e);
            }
        },
        updateMarker: function (widgetID, today) {
            if (this.scroll[widgetID].automatic == 2 && new Date() - this.scroll[widgetID].time < 90 * 1000) {
                return;
            }
            this.scroll[widgetID].automatic = 0;
            if (
                this.visTvprogram.calcDate(today).toLocaleDateString() !=
                this.visTvprogram.calcDate(new Date()).toLocaleDateString()
            ) {
                $(`#${widgetID} .line`).hide();
                //return;
            } else {
                $(`#${widgetID} .line`).show();
            }
            const wItem = this.measures[widgetID].widthItem;
            const tItem = this.measures[widgetID].timeItem;
            const wChannel = this.measures[widgetID].heightRow;

            const sTime = new Date(this.visTvprogram.calcDate(new Date()));
            sTime.setHours(5);
            sTime.setMinutes(0);
            sTime.setSeconds(0);
            const eTime = new Date(sTime);
            eTime.setDate(eTime.getDate() + 1);

            const startTime = new Date();
            const left = wChannel + Math.floor(((startTime - sTime) / 60000 / tItem) * wItem * 10) / 10;
            $(`#${widgetID} .line`).css('left', `${left}px`);
            this.scroll[widgetID].marker = left;
            this.scroll[widgetID].position = 0;
            this.calcScroll(widgetID);
            if (this.scroll[widgetID].timeout) {
                clearTimeout(this.scroll[widgetID].timeout);
            }
            this.scroll[widgetID].automatic = 1;
            this.scroll[widgetID].timeout = window.setTimeout(
                function () {
                    this.scroll[widgetID].automatic = 0;
                    clearTimeout(this.scroll[widgetID].timeout);
                    this.scroll[widgetID].timeout = null;
                }.bind(this),
                500,
            );
            this.setScroll(widgetID);
        },
        getScrollbarWidth: function () {
            const scrollDiv = document.createElement('div');
            scrollDiv.className = 'scrollbar-measure';
            scrollDiv.style.cssText = 'width: 100px;height: 100px;overflow: scroll;position: absolute;top: -9999px;';
            document.body.appendChild(scrollDiv);
            const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        },
        getChannels: function (channels, filter = []) {
            const cc = [];
            filter.map(el => {
                const ch = channels.find(el1 => el1.id == el);
                cc.push(
                    `<li class="listitem channel" data-order="${ch.order}" data-id="${
                        ch.id
                    }" selected><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/${
                        ch.channelId
                    }.png" alt="" class="channel-logo"></li>`,
                );
            });
            channels
                .sort(
                    (a, b) =>
                        a.order +
                        (filter.indexOf(a.id) == -1) * 100000 -
                        (b.order + (filter.indexOf(b.id) == -1) * 100000),
                )
                .map(el => {
                    //if (filter.findIndex(el1=>el1==el.id)==-1) cc.push('<ul class="listitem channel" data-order="'+el.order+'" data-id="'+el.id+'"><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+el.channelId+'.png" alt="" class="channel-logo"></li></ul>');
                    if (filter.findIndex(el1 => el1 == el.id) == -1) {
                        cc.push(
                            `<li class="listitem channel" data-order="${el.order}" data-id="${
                                el.id
                            }"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/${
                                el.channelId
                            }.png" alt="" class="channel-logo"></li>`,
                        );
                    }
                });
            return cc;
        },
        onclickChannelSave: function (el, save) {
            const widgetID = el.dataset.widgetid;
            if (save) {
                const tvprogram_oid = el.dataset.dp || '';
                const instance = el.dataset.instance || '';
                this.visTvprogram.setConfigChannelfilter(
                    instance,
                    tvprogram_oid,
                    $(`#${widgetID}channeldlg .chselect-container .channel[selected]`)
                        .toArray()
                        .map(el => parseInt(el.dataset.id)),
                );
            }
            $(`#${widgetID}channeldlg`).dialog('close');
        },
        onclickChannel: function (widgetID, instance, tvprogram_oid) {
            let isSorting = false;
            const channels = this.visTvprogram.channels;
            let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
            if (channelfilter.length == 0) {
                channelfilter = channels.reduce((acc, el, i) => {
                    if (i < 4) {
                        acc.push(el.id);
                    }
                    return acc;
                }, []);
            }

            let text = '';
            text += '  <div class="chselect-container clearfix">';
            text += `    <ul class="listitem channel" data-instance="${instance}" data-dp="${
                tvprogram_oid
            }" data-widgetid="${
                widgetID
            }" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,true)" ><li class="channel"><svg width="100%" height="100%" ><use xlink:href="#check-icon"></use></svg></li></ul>`;
            text += `    <ul class="listitem channel" data-widgetid="${
                widgetID
            }" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,false)"><li class="channel"><svg width="100%" height="100%" ><use xlink:href="#cancel-icon"></use></svg></li></ul>`;
            text += '  </div>';

            text += '  <div class="chselect-container clearfix sortable">';
            text += '  <ul class="items">';
            text += this.getChannels(channels, channelfilter).join('\n');
            text += '  </ul>';
            text += '  </div>';
            $(`#${widgetID}channeldlg`).html(text);
            $('.chselect-container .items .channel').click(function () {
                console.log('channel click');
                if (isSorting) {
                    return;
                }
                const target = $(this).parent().find('[selected]').last();
                if (this.dataset.id) {
                    $(this).attr('selected') ? $(this).removeAttr('selected') : $(this).attr('selected', '');
                }
                if ($(this).attr('selected')) {
                    $(this).insertAfter(target);
                } else {
                    $(this)
                        .parent()
                        .children()
                        .sort(function (a, b) {
                            return (
                                a.dataset.order +
                                ($(a).attr('selected') != 'selected') * 100000 -
                                (b.dataset.order + ($(b).attr('selected') != 'selected') * 100000)
                            );
                        })
                        .appendTo($(this).parent());
                }
            });
            $('.chselect-container.sortable').sortable({
                items: '.items .channel[selected]',
                containment: 'parent',
                revert: true,
                grid: [5, 5],
                opacity: 0.8,
                tolerance: 'pointer',
                start: function () {
                    isSorting = true;
                },
                stop: function () {
                    isSorting = false;
                },
            });
            $(`#${widgetID}channeldlg`).dialog({
                resizable: false,
                autoOpen: false,
                modal: false,
                position: { of: $(`#${widgetID}`) },
                width: $(`#${widgetID}`).width() * this.measures[widgetID].dialogwidthpercent,
                height: $(`#${widgetID}`).height() * this.measures[widgetID].dialogheightpercent,
                dialogClass: `no-titlebar ${widgetID}`,
                zIndex: 10003,
                stack: false,
            });
            this.visTvprogram.copyStyles('font', $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));
            this.visTvprogram.copyStyles('color', $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));
            this.visTvprogram.copyStyles(
                'background-color',
                $(`#${widgetID}`).get(0),
                $(`#${widgetID}channeldlg`).get(0),
            );
            $(`#${widgetID}channeldlg`).dialog('open');
        },
        getBroadcasts4Channel: function (el, widgetID, view, viewdate, tvprogram_oid, instance) {
            const wItem = this.measures[widgetID].widthItem;
            const tItem = this.measures[widgetID].timeItem;
            const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
            let favhighlight;

            const sTime = new Date(el.events[0].airDate);

            sTime.setHours(5);
            sTime.setMinutes(0);
            const eTime = new Date(sTime);
            eTime.setDate(eTime.getDate() + 1);
            const channel = this.visTvprogram.channels.find(ch => ch.id == el.channel);

            const aa = [];
            let text = '';
            text += '    <li class="tv-item tv-head-left channel">';
            text += `      <img width="100%" height="100%" data-instance="${instance}" data-channelid="${
                channel.channelId
            }" data-dp="${tvprogram_oid}" src="https://tvfueralle.de/channel-logos/${
                channel.channelId
            }.png" alt="" class="channel-logo"  onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
            text += '    </li>';
            aa.push(text);

            for (let i = 0; i < el.events.length; i++) {
                const event = el.events[i];
                let startTime = new Date(event.startTime);
                let endTime = new Date(event.endTime);
                if (startTime >= eTime) {
                    continue;
                }
                if (endTime <= sTime) {
                    continue;
                }
                if (i == 0 && startTime > sTime) {
                    aa.push(
                        `<li class="tv-item broadcast" style="left:0px; width:${
                            Math.floor(((startTime - sTime) / 60000 / tItem) * wItem * 10) / 10
                        }px;"></li>`,
                    );
                }
                if (startTime < sTime) {
                    startTime = sTime;
                }
                if (endTime > eTime) {
                    endTime = eTime;
                }
                favhighlight = favorites.indexOf(event.title) > -1;
                text = '';
                text += '<li class="tv-item broadcast" style="';
                text += `left:${Math.floor(((startTime - sTime) / 60000 / tItem) * wItem * 10) / 10}px;`;
                text += `width:${Math.floor(((endTime - startTime) / 60000 / tItem) * wItem * 10) / 10}px;">`;
                text += `<div class="broadcastelement ${favhighlight ? 'selected' : ''}" data-widgetid="${
                    widgetID
                }" data-eventid="${event.id}" data-viewdate="${viewdate}" data-instance="${instance}" data-dp="${
                    tvprogram_oid
                }" data-view="${view}" onclick="vis.binds.tvprogram.onclickBroadcast(this)">`;
                if (event.photo.url && this.measures[widgetID].showpictures) {
                    text +=
                        `<div><img class="broadcastimage" src="` + `https://tvfueralle.de${event.photo.url}"></div>`;
                }
                text += `<div class="broadcasttitle">${event.title}`;
                text += `<div class="star" data-viewdate="${viewdate}" data-eventid="${event.id}" data-dp="${
                    tvprogram_oid
                }" data-instance="${
                    instance
                }" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
                text += '</div>';
                text += '<div class="broadcasttime">';
                text += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
                text += ' - ';
                text += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
                text += '</div></div></li>';
                aa.push(text);
            }
            let startTime = new Date(el.events[el.events.length - 1].startTime);
            let endTime = new Date(el.events[el.events.length - 1].endTime);
            if (startTime < eTime && endTime < eTime) {
                startTime = endTime;
                endTime = eTime;
                text = '';
                text += '<li class="tv-item broadcast" style="';
                text += `left:${Math.floor(((startTime - sTime) / 60000 / tItem) * wItem * 10) / 10}px;`;
                text += `width:${Math.floor(((endTime - startTime) / 60000 / tItem) * wItem * 10) / 10}px;">`;
                text += '</li>';
                aa.push(text);
            }
            return aa;
        },
        getEvents: function (tvprogram, filter) {
            const tv = [];
            let i;
            tvprogram.map(el => {
                if ((i = filter.indexOf(el.channel)) > -1) {
                    if (!tv[i]) {
                        tv[i] = {};
                    }
                    if (!tv[i].events) {
                        tv[i].events = [];
                    }
                    tv[i].channel = el.channel;
                    tv[i].events.push(el);
                }
            });
            return tv;
        },
        getTimetable: function () {
            const tt = [];
            for (let i = 0; i < 24; i++) {
                tt.push(`<li class="tv-item time"><span>${`0${i}`.slice(-2)}:00</span></li>`);
                tt.push(`<li class="tv-item time"><span>${`0${i}`.slice(-2)}:30</span></li>`);
            }
            return [].concat(tt.slice(10), tt.slice(0, 10));
        },
        getButtonHeader: function (datestring) {
            const hh = [];
            hh.push(
                '<li class="tv-item tv-head-topleft tv-head-left button burger tooltip"><span role="tooltip">Menu</span><svg width="100%" height="100%" ><use xlink:href="#burger-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button nav prevD tooltip"><span role="tooltip">Previous day</span><svg width="100%" height="100%" ><use xlink:href="#nav-prevD-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button nav center tooltip"><span role="tooltip">Today</span><svg width="100%" height="100%" ><use xlink:href="#nav-center-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button nav nextD tooltip"><span role="tooltip">Next day</span><svg width="100%" height="100%" ><use xlink:href="#nav-nextD-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button zoom minus tooltip"><span role="tooltip">Zoom in</span><svg width="100%" height="100%" ><use xlink:href="#zoom-minus-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button zoom center tooltip"><span role="tooltip">Zoom normal</span><svg width="100%" height="100%" ><use xlink:href="#zoom-center-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button zoom plus tooltip"><span role="tooltip">Zoom out</span><svg width="100%" height="100%" ><use xlink:href="#zoom-plus-icon"></use></svg></li>',
            );
            hh.push(
                '<li class="tv-item button hide tooltip"><span role="tooltip">Hide Non-Favorites</span><svg width="100%" height="100%" ><use xlink:href="#hide-icon"></use></svg></li>',
            );
            hh.push(
                `<li class="tv-item dateinfo">${new Date(datestring).toLocaleDateString(navigator.language, {
                    weekday: 'short',
                })}, ${new Date(datestring).toLocaleDateString()}</li>`,
            );
            return hh;
        },
        onChange: async function (widgetID, view, data, style, instance, e, newVal) {
            const dp = e.type.split('.');
            if (
                (dp[3] == 'config' || dp[3] == 'favorites' || dp[3] == 'channelfilter' || dp[3] == 'show') &&
                dp[4] == 'val'
            ) {
                console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                this.createWidget(widgetID, view, data, style);
            }
            if (dp[3] == 'cmd' && dp[4] == 'val') {
                if (newVal && newVal != '') {
                    console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                    const obj = newVal.split('|');
                    if (obj[0] == 'new') {
                        if (obj[1] != 'program') {
                            this[obj[1]] = await this.visTvprogram.getServerDataAsync(instance, widgetID, obj[1]);
                            this.createWidget(widgetID, view, data, style);
                            return;
                        }
                        if (obj[1] == 'program') {
                            if (this.tvprogram[obj[2]]) {
                                this.visTvprogram.loadProgram(
                                    instance,
                                    widgetID,
                                    obj[2],
                                    function (widgetID, view, data, style, datestring, serverdata) {
                                        if (serverdata != 'error' && serverdata != 'nodata') {
                                            this.tvprogram[datestring] = serverdata;
                                            this.createWidget(widgetID, view, data, style);
                                            return;
                                        }
                                    }.bind(this, widgetID, view, data, style, obj[2]),
                                );
                            }
                        }
                    }
                }
            }
        },
    },
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
        // const view = el.dataset.view || 0;
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
            ? `https://tvfueralle.de${event.photo.url}`
            : 'https://tvfueralle.de/tv-logo-no-image.svg';
        const favorites = this.getConfigFavorites(tvprogram_oid);
        const favhighlight = favorites.indexOf(event.title) > -1;

        const layout =
            $(`#${widgetID}`).width() * measures.dialogwidthpercent >
            $(`#${widgetID}`).height() * measures.dialogheightpercent
                ? ' tv-dlg-row'
                : ' tv-dlg-col';
        let text = '';
        text += `  <div class="event-container${layout}" data-eventid="${event.id}">`;
        text += `    <div class="event-picture dialogcolumn${layout}">`;
        text += `    <img src="${photourl}">`;
        text += '    </div>';
        text += `    <div class="event-data dialogcolumn${layout}">`;
        text += '      <div class="buttoncontainer">';
        text += `          <div class="record button" data-viewdate="${viewdate}" data-eventid="${
            event.id
        }" data-instance="${instance}" data-dp="${
            tvprogram_oid
        }" onclick="return vis.binds.tvprogram.onclickRecord(this,event)"><svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg></div>`;
        text += `          <div class="copy button" data-widgetid="${
            widgetID
        }" onclick="return vis.binds.tvprogram.onclickCopy(this,event)"><svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg></div>`;
        text += `          <div class="star button ${favhighlight ? 'selected' : ''}" data-viewdate="${
            viewdate
        }" data-eventid="${event.id}" data-instance="${instance}" data-dp="${
            tvprogram_oid
        }" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
        if (startTime < new Date() && new Date() < endTime) {
            text += `        <div class="channelselect button" data-instance="${instance}" data-dp="${
                tvprogram_oid
            }" data-channelid="${
                channel.channelId
            }" onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)"><svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg></div>`;
        }
        text += '      </div>';
        text += `      <div style="padding: 0px 0px 5px;">${channeltime}</div>`;
        text += `      <div style="font-weight: bold;padding: 0px 0px 5px;">${event.title}</div>`;
        text += `      <div style="padding: 0px 0px 5px;">${meta}</div>`;
        text += `      <div>${content}</div>`;
        text += '    </div>';
        text += '  </div>';
        text += '  </div>';

        $(`#${widgetID}broadcastdlg`).html(text);
        $(`#${widgetID}broadcastdlg`).dialog({
            resizable: false,
            autoOpen: false,
            modal: false,
            position: { of: $(`#${widgetID}`), within: $(`#${widgetID}`) },
            width: $(`#${widgetID}`).width() * measures.dialogwidthpercent,
            height: $(`#${widgetID}`).height() * measures.dialogheightpercent,
            dialogClass: `no-titlebar ${widgetID}`,
            zIndex: 10003,
            stack: false,
            collision: 'none',
        });
        this.copyStyles('font', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
        this.copyStyles('color', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
        this.copyStyles('background-color', $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
        $(`#${widgetID}broadcastdlg`).dialog('open');
        $(`#${widgetID}broadcastdlg`).click(function () {
            $(`#${widgetID}broadcastdlg`).dialog('close');
        });
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
        //this.setValueAck(instance, `${tvprogram_oid}.record`, JSON.stringify(record));
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
        // this.setValueAck(instance, `${tvprogram_oid}.selectchannel`, channelid);
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
    setConfigFavorites: function (instance, tvprogram_oid, favorites) {
        this.setValueAckAsync(instance, `${tvprogram_oid}.favorites`, JSON.stringify(favorites));
        // this.setValueAck(instance, `${tvprogram_oid}.favorites`, JSON.stringify(favorites));
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
        //this.setValueAck(instance, `${tvprogram_oid}.channelfilter`, JSON.stringify(channelfilter));
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
        // this.setValueAck(instance, `${tvprogram_oid}.show`, JSON.stringify(show));
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
                //vis.conn._socket.emit("sendTo", instance, "getServerBroadcast", { eventid: eventid, viewdate: viewdate }, function (data) {
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
                // vis.conn._socket.emit("sendTo", instance, "getServerTVProgram", dataname, function (data) {
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
            // vis.conn._socket.emit("sendTo", instance, "getFavoritesDatax", favorites, (data) => {
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
            //vis.conn._socket.emit("sendTo", instance, "getServerInfo", {}, (data) => {
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
                //vis.conn._socket.emit("sendTo", instance, "getServerBroadcastNow", channelfilter, function (data) {
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
                //vis.conn._socket.emit("sendTo", instance, "getServerBroadcastDate", { channelfilter: channelfilter, date: date }, function (data) {
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
                //vis.conn._socket.emit("sendTo", instance, "getServerBroadcastFind", obj, function (data) {
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
        vis.conn.sendTo(
            instance,
            'setValueAck',
            { id: id, value: value },
            function () {
                //vis.conn._socket.emit("sendTo", instance, "setValueAck", { id: id, value: value }, function () {
            }.bind(this),
        );
    },
    setValueAckAsync: async function (instance, id, value) {
        console.log('setValueAck request ');
        return await this.sendToAsync(instance, 'setValueAck', { id: id, value: value });
        /*         vis.conn.sendTo(
            instance,
            'setValueAck',
            { id: id, value: value },
            function () {
                //vis.conn._socket.emit("sendTo", instance, "setValueAck", { id: id, value: value }, function () {
            }.bind(this),
        );
 */
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
        /*         this.getServerInfo(
            instance,
            function (serverdata) {
                this.infos = serverdata;
                callback(serverdata);
            }.bind(this),
 */
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
        /*         this.getServerTVProgram(
            instance,
            widgetID,
            datestring,
            function (datestring, serverdata) {
                if (serverdata != 'error' && serverdata != 'nodata') {
                    this.tvprogram[datestring] = serverdata;
                }
                callback(datestring, serverdata);
            }.bind(this, datestring),
        );
 */
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

vis.binds['tvprogram'].showVersion();

jQuery.fn.mydelay = function (time, type) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
    type = type || 'fx';

    return this.queue(type, function (next, hooks) {
        const timeout = window.setTimeout(next, time);
        hooks.stop = function () {
            window.clearTimeout(timeout);
        };
    });
};
//https://services.sg1.etvp01.sctv.ch/catalog/tv/channels/list/ids=25;level=enorm;start=202102182000
//https://services.sg2.etvp01.sctv.ch/portfolio/tv/channels
//https://services.sg1.etvp01.sctv.ch/catalog/tv/channels/list/ids=25,656;level=normal;start=202102180500;end=202102190500
//tv.blue.ch
