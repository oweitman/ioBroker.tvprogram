/* global vis, $ */
export default {
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
        const chnanneliconwidth = parseInt(data.tvprogram_channeliconwidth) || 35;
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
        text += '   flex: 1 1 auto; \n';
        text += '   min-height: 0; \n';
        text += '   overflow-x: hidden; \n';
        text += '   overflow-y: auto; \n';
        text += '   scrollbar-width: none; \n';
        text += '   -ms-overflow-style: none; \n';
        text += '} \n';

        text += `#${widgetID} .tv-result::-webkit-scrollbar {\n`;
        text += '   display: none; \n';
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
        text += `   width: ${chnanneliconwidth}px; \n`;
        text += `   height: ${heightrow}px; \n`;
        //text += '   padding: 1px; \n';
        text += '   display: inline-flex; \n';
        text += '   align-items: center; \n';
        text += '   justify-content: center; \n';
        text += '   border-width: 0px; \n';
        text += `   background-color: ${backgroundColor}; \n`;
        text += '} \n';

        text += `#${widgetID} .channel-logo {\n`;
        text += `   max-width: ${chnanneliconwidth}px;\n`;
        text += `   max-height: ${heightrow}px;\n`;
        text += '   width: auto; \n';
        text += '   height: auto; \n';
        text += '   object-fit: contain; \n';
        text += '   display: block; \n';
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
            text += `          <img loading="lazy" decoding="async"
                                        data-instance="${instance}" 
                                        data-channelid="${channel.channelId}" 
                                        data-dp="${tvprogram_oid}" 
                                        data-instance="${instance}" 
                                        src="${this.visTvprogram.getChannelLogo(channel, tvprogram_oid)}"
                                        alt="" class="channel-logo"  
                                        onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
            text += '       </li>';
            text += '       <li class="tv-item broadcast">';
            text += `             <div class="broadcastelement ${favhighlight ? 'selected' : ''}" data-widgetid="${
                widgetID
            }" data-eventid="${event.id}" data-viewdate="${viewdate}" data-instance="${instance}" data-dp="${
                tvprogram_oid
            }" data-view="" >`;
            if (event.photo.url && showpictures) {
                text +=
                    `<div><img class="broadcastimage" loading="lazy" decoding="async" src="` +
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
        $(`#${widgetID} .tv-result .broadcast`).on('click', event => {
            this.visTvprogram.onclickBroadcast(event.currentTarget.querySelector('.broadcastelement'));
        });
    },
    onSubmitSearch: async function (widgetID, view, data, style, evt) {
        const el = evt.target;
        const instance = el.dataset.instance || '';
        const tvprogram_oid = el.dataset.dp || '';
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
        this.searchresult[tvprogram_oid][widgetID] = await this.visTvprogram.getServerBroadcastFindAsync(instance, obj);
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
            (dp[3] == 'config' ||
                dp[3] == 'favorites' ||
                dp[3] == 'channelfilter' ||
                dp[3] == 'show' ||
                dp[3] == 'optchnlogopath') &&
            dp[4] == 'val'
        ) {
            console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
            this.createWidget(widgetID, view, data, style);
        }
    },
};
