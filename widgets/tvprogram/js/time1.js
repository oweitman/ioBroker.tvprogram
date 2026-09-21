/* global vis, $, window, document */
import Sortable from 'sortablejs';
import dayjs from 'dayjs';

export default {
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
                channelIconWidth: parseInt(data.tvprogram_channeliconwidth) || 35,
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
                        `${tvprogram_oid}.optchnlogopath`,
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
        const channelIconWidth = this.measures[widgetID].channelIconWidth;
        const heightrow = this.measures[widgetID].heightRow;

        const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
        if (this.visTvprogram.checkStyle('background-color', $(`#${widgetID}`)[0].style.cssText) == '') {
            $(`#${widgetID}`).css('background-color', backgroundColor);
        }
        const widthtvrow = 48 * widthitem + channelIconWidth;
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
        text += '   z-index:12; \n';
        text += `   background-color: ${backgroundColor}; \n`;
        text += '} \n';

        text += `#${widgetID} .tv-head-left {\n`;
        text += '   position:sticky; \n';
        text += '   position: -webkit-sticky; \n';
        text += '   left:0; \n';
        text += '   z-index:11; \n';
        text += '} \n';

        text += `#${widgetID} .tv-head-background {\n`;
        text += `   background-color: ${backgroundColor}; \n`;
        text += '} \n';

        text += `#${widgetID} svg rect {\n`;
        text += `   fill: ${$(`#${widgetID}`).css('color')}; \n`;
        text += '} \n';

        text += `#${widgetID} .channel {\n`;
        text += `   width: ${channelIconWidth}px; \n`;
        text += `   height: ${heightrow}px; \n`;
        //text += '   padding: 1px; \n';
        text += '   border-width: 0px; \n';
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

        text += `#${widgetID} .broadcastelement.selected .star svg path, #${widgetID}broadcastdlg .star.selected {\n`;
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

        text += `#${widgetID}channeldlg .chselect-container .channel[selected]{\n`;
        text += '   opacity: 1; \n';
        text += '} \n';

        text += `#${widgetID}channeldlg .chselect-container .channel{\n`;
        text += '   opacity: 0.5; \n';
        text += '} \n';

        text += `#${widgetID}channeldlg .chselect-container .channel .btn {\n`;
        text += '   opacity: 1; \n';
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
        const wChannel = this.measures[widgetID].channelIconWidth;

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
    getChannels: function (channels, filter = [], tvprogram_oid) {
        const cc = [];
        filter.map(el => {
            const ch = channels.find(el1 => el1.id == el);
            cc.push(
                `<li class="listitem channel" data-order="${ch.order}" data-id="${ch.id}" selected><img width="100%" height="100%" src="${vis.binds.tvprogram.getChannelLogo(ch, tvprogram_oid)}" alt="" class="channel-logo"></li>`,
            );
        });
        channels
            .sort(
                (a, b) =>
                    a.order + (filter.indexOf(a.id) == -1) * 100000 - (b.order + (filter.indexOf(b.id) == -1) * 100000),
            )
            .map(el => {
                if (filter.findIndex(el1 => el1 == el.id) == -1) {
                    cc.push(
                        `<li class="listitem channel" data-order="${el.order}" data-id="${el.id}"><img width="100%" height="100%" src="${vis.binds.tvprogram.getChannelLogo(el, tvprogram_oid)}" alt="" class="channel-logo"></li>`,
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
        let dialog = document.querySelector(`#${widgetID}channeldlg dialog`);
        dialog.close();
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
        let width = $(`#${widgetID}`).width() * this.measures[widgetID].dialogwidthpercent;
        let height = $(`#${widgetID}`).height() * this.measures[widgetID].dialogheightpercent;
        //let { top: elTop, left: elLeft } = $(`#${widgetID}`).position();
        let { top: elTop, left: elLeft } = $(`#${widgetID}`).offset();
        let top = elTop + ($(`#${widgetID}`).height() - height) / 2;
        let left = elLeft + ($(`#${widgetID}`).width() - width) / 2;
        let text = '';
        text += `<dialog class="${widgetID}broadcastdialog" style="margin:0;width:${width}px;height:${height}px;top:${top}px;left:${left}px">`;

        text += '  <div class="chselect-container clearfix">';
        text += `    <ul class="listitem channel" data-instance="${instance}" data-dp="${
            tvprogram_oid
        }" data-widgetid="${
            widgetID
        }" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,true)" ><li class="channel btn"><svg width="100%" height="100%" ><use xlink:href="#check-icon"></use></svg></li></ul>`;
        text += `    <ul class="listitem channel" data-widgetid="${
            widgetID
        }" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,false)"><li class="channel btn"><svg width="100%" height="100%" ><use xlink:href="#cancel-icon"></use></svg></li></ul>`;
        text += '  </div>';

        text += '  <div class="chselect-container clearfix sortable">';
        text += '  <ul class="items">';
        text += this.getChannels(channels, channelfilter, tvprogram_oid).join('\n');
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
        let grid = document.querySelector('.chselect-container.sortable .items');
        new Sortable(grid, {
            animation: 150,
            filter: 'li:not([selected])',
            onMove: function (evt) {
                if (!evt.related.hasAttribute('selected')) {
                    return false;
                }
            },
        });
        this.visTvprogram.copyStyles('font', $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));
        this.visTvprogram.copyStyles('color', $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));
        this.visTvprogram.copyStyles('background-color', $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));

        let dialog = document.querySelector(`#${widgetID}channeldlg dialog`);
        dialog.showModal();
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
        text += '    <li class="tv-item tv-head-left tv-head-background channel">';
        text += `      <img width="100%" height="100%" 
                data-instance="${instance}" 
                data-channelid="${channel.channelId}" 
                data-dp="${tvprogram_oid}" 
                src="${this.visTvprogram.getChannelLogo(channel, tvprogram_oid)}"
                alt="" class="channel-logo"
                onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
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
                    `<div><img class="broadcastimage" src="` +
                    `${this.visTvprogram.getProgrammeImage(event.photo.url)}"></div>`;
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
};
