/* global vis, $ */
export default {
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
                    [
                        `${tvprogram_oid}.config`,
                        `${tvprogram_oid}.favorites`,
                        `${tvprogram_oid}.channelfilter`,
                        `${tvprogram_oid}.optchnlogopath`,
                    ],
                    this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid),
                );
            }
        }

        const heightrow = parseInt(data.tvprogram_heightRow) || 35;
        const chnanneliconwidth = parseInt(data.tvprogram_channeliconwidth) || 35;
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
        text += `   width: ${chnanneliconwidth}px; \n`;
        text += `   height: ${heightrow}px; \n`;
        //text += '   padding: 1px; \n';
        text += '   border-width: 0px; \n';
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

        text += `#${widgetID} .broadcastelement.selected .star svg path, #${widgetID}broadcastdlg .star.selected {\n`;
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
                let viewdate = event.airDate;
                const channel = this.visTvprogram.channels.find(ch => ch.id == event.channel);
                favhighlight = favorites.indexOf(event.title) > -1;
                text += '    <ul class="tv-row">';
                text += '       <li class="tv-item channel">';
                text += `          <img width="100%" height="100%" 
                        data-instance="${instance}" 
                        data-channelid="${channel.channelId}" 
                        data-dp="${tvprogram_oid}" 
                        src="${this.visTvprogram.getChannelLogo(channel, tvprogram_oid)}"
                        alt="" 
                        class="channel-logo"  
                        onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
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
                        `${this.visTvprogram.getProgrammeImage(event.photo.url)}"></div>`;
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
};
