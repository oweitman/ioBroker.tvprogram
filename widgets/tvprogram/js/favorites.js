/* global vis, $ */
export default {
    visTvprogram: null,
    pending: {},
    bound: {},
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
        const selectedChannelsOnly = data.tvprogram_favorites_selectedchannels === true;
        const chnanneliconwidth = parseInt(data.tvprogram_channeliconwidth) || 35;

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

        const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
        if (!Array.isArray(this.visTvprogram.channels)) {
            this.visTvprogram.channels = await this.visTvprogram.loadChannels(instance, widgetID);
        }
        let selectedChannelIds = null;
        if (selectedChannelsOnly) {
            let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
            if (channelfilter.length === 0) {
                channelfilter = this.visTvprogram.channels.slice(0, 4).map(channel => channel.id);
            }
            selectedChannelIds = new Set(channelfilter.map(String));
        }
        const response = await this.visTvprogram.getFavoritesDataAsync(instance, favorites);
        const favoriteEvents = Array.isArray(response)
            ? response.filter(
                  event =>
                      new Date(event.endTime) >= new Date() &&
                      (!selectedChannelIds || selectedChannelIds.has(String(event.channel))),
              )
            : [];

        let text = '';
        text += '<style> \n';
        text += `#${widgetID} .tv-fav-scroll {\n`;
        text += '   width: 100%;\n';
        text += '   height: 100%;\n';
        text += '   overflow-x: hidden;\n';
        text += '   overflow-y: auto;\n';
        text += '   scrollbar-width: none;\n';
        text += '   -ms-overflow-style: none;\n';
        text += '} \n';
        text += `#${widgetID} .tv-fav-scroll::-webkit-scrollbar {\n`;
        text += '   display: none;\n';
        text += '} \n';
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
        text += '} \n';
        text += `#${widgetID} .tv-icon {\n`;
        text += `   width: ${chnanneliconwidth}px; \n`;
        text += '} \n';

        text += '</style> \n';

        text += '  <div class="svgcontainer">';
        text +=
            '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
        // to user : <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg>
        text += '  </div>';

        text += '<div class="tv-fav-scroll"><table class="tv-fav">';
        favoriteEvents.forEach((favorite, index) => {
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
                text += `           <td class="tv-left">${startTime.toLocaleString(vis.language, date_options)}</td>`;
                text += `           <td class="tv-left">${startTime.toLocaleString(vis.language, time_options)}</td>`;
                text += '           <td class="tv-left">-</td>';
                text += `           <td class="tv-left">${endTime.toLocaleString(vis.language, time_options)}</td>`;
                if (channelname) {
                    text += `           <td class="tv-left">${favorite.channelname}</td>`;
                } else {
                    text += '           <td class="tv-center tv-tdicon">';
                    const favoriteChannel = this.visTvprogram.channels?.find(ch => ch.id == favorite.channel);
                    const logo = this.visTvprogram.getChannelLogo(favoriteChannel, tvprogram_oid);
                    if (logo) {
                        text += `              <img src="${logo}" alt="" class="tv-icon">`;
                    }
                    text += '           </td>';
                }
                text += `           <td class="tv-full">${favorite.title}</td>`;
                text += '        </tr>';
            }
        });
        text += '</table></div>';

        $(`#${widgetID}`).html(text);
        clearTimeout(this.timer[widgetID]);
        this.timer[widgetID] = setTimeout(() => this.createWidget(widgetID, view, data, style), 1000 * 60);
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
};
