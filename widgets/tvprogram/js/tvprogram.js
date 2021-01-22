/*
    ioBroker.vis tvprogram Widget-Set

    version: "0.0.1"

    Copyright 2020 oweitman oweitman@gmx.de
*/
"use strict";

// add translations for edit mode
$.extend(
    true,
    systemDictionary,
    {
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
    }
);

// this code can be placed directly in tvprogram.html
vis.binds["tvprogram"] = {
    version: "0.0.1",
    showVersion: function () {
        if (vis.binds["tvprogram"].version) {
            console.log("Version tvprogram: " + vis.binds["tvprogram"].version);
            vis.binds["tvprogram"].version = null;
        }
    },
    time1: {
        tvprogram:  {},
        channels:   {},
        categories: {},
        genres:     {},
        bound:      {},
        timer:      {},
        pending:    {},
        measures:   {},
        scroll:     {},
        today:      {},
        viewday:    {},
        olddata:    {},
        createWidget: function (widgetID, view, data, style) {
            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["tvprogram"].time1.createWidget(widgetID, view, data, style);
                }, 100);
            }
            console.log("createWidget start");
            var tvprogram_oid;
            
            if (!data.tvprogram_oid || (tvprogram_oid = vis.binds["tvprogram"].getTvprogramId(data.tvprogram_oid.trim()))==false) return;
            var highlightcolor=data.highlightcolor||"yellow";

            if (!this.olddata[widgetID]) this.olddata[widgetID] = data;
            if (!this.measures[widgetID] || (JSON.stringify(this.olddata[widgetID])!=JSON.stringify(data)) ) this.measures[widgetID]= {
                origwidthItem:parseInt(data.widthItem)||120,
                timeItem:30,
                heightRow:parseInt(data.heightRow)||35,
                scrollbarWidth:this.getScrollbarWidth(),
                markerpositionpercent:data.markerpositionpercent/100||0.25,
                dialogwidthpercent:data.dialogwidthpercent/100||0.9,
                dialogheightpercent:data.dialogheightpercent/100||0.9,
            };
            if (!this.measures[widgetID].widthItem) this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;

            if (!((this.today||{})[widgetID]||{}).prevday) $('#' + widgetID+' .tv-container').html("Datapoints loading...");

            if (Object.keys(this.categories).length==0) this.getServerData(tvprogram_oid,widgetID,'categories',function(widgetID, view, data, style, serverdata){
                this.categories=serverdata;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));
            if (Object.keys(this.channels).length==0) this.getServerData(tvprogram_oid,widgetID,'channels',function(widgetID, view, data, style,serverdata){
                this.channels=serverdata;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));
            if (Object.keys(this.genres).length==0) this.getServerData(tvprogram_oid,widgetID,'genres',function(widgetID, view, data, style,serverdata){
                this.genres=serverdata;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));


            function check(prop) {
                if (!prop) return true;
                if (Object.keys(prop)==0) return true;
                return false;
            }

            if (!this.today[widgetID]) this.today[widgetID] = {today:new Date(),prevday:null};
            if (!this.scroll[widgetID]) this.scroll[widgetID] = {time:new Date(0),position:0,marker:0,timeout:null,automatic:0};

            var d = this.calcDate(this.today[widgetID].today);
            var datestring = this.getDate(d,0);
            if (!this.viewday[widgetID]) this.viewday[widgetID] = {viewday:datestring,prevday:null};
            this.viewday[widgetID].viewday=datestring;

            var viewdate = this.getDate(d,0);

            if (check(this.tvprogram[datestring])) {
                this.getServerData(tvprogram_oid,widgetID,'program.'+datestring,function(widgetID, view, data, style,datestring,serverdata){
                    if (serverdata!="error") {
                        this.tvprogram[datestring]=serverdata;
                        this.createWidget(widgetID, view, data, style);
                        return;
                    } else {
                        this.today[widgetID]["today"]=new Date(this.today[widgetID]["prevday"]);
                        this.viewday[widgetID]["viewday"]=new Date(this.viewday[widgetID]["prevday"]);
                        this.createWidget(widgetID, view, data, style);
                        return;
                    }
                }.bind(this, widgetID, view, data, style,datestring));
            }
            if (Object.keys(this.categories).length==0 || Object.keys(this.channels).length==0 || Object.keys(this.categories).length==0) return;
            if (check(this.tvprogram[datestring])) return;

            if (this.viewday[widgetID]["viewday"]!=this.viewday[widgetID]["prevday"]) {
                this.viewday[widgetID]["prevday"]=this.viewday[widgetID]["viewday"];
            }

            if(!this.bound[tvprogram_oid]) this.bound[tvprogram_oid]={};
            if(!this.bound[tvprogram_oid][widgetID]) this.bound[tvprogram_oid][widgetID]=false;

            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (1 || !vis.editMode) {
                    this.bound[tvprogram_oid][widgetID]=true;
                    vis.binds["tvprogram"].bindStates($div,[
                        tvprogram_oid + '.config',
                        tvprogram_oid + '.cmd',
                        ],this.onChange.bind(this, widgetID, view, data, style,tvprogram_oid)
                    );
                }
            }

            if (this.onclickBroadcast.name=="onclickBroadcast")     this.onclickBroadcast = this.onclickBroadcast.bind(this);
            if (this.onclickFavorite.name=="onclickFavorite")     this.onclickFavorite = this.onclickFavorite.bind(this,tvprogram_oid,widgetID);
            if (this.onclickCopy.name=="onclickCopy")     this.onclickCopy = this.onclickCopy.bind(this,tvprogram_oid,widgetID);
            if (this.onclickRecord.name=="onclickRecord")     this.onclickRecord = this.onclickRecord.bind(this,tvprogram_oid,widgetID);
            if (this.onclickChannelSave.name=="onclickChannelSave") this.onclickChannelSave = this.onclickChannelSave.bind(this,widgetID,tvprogram_oid);
            if (this.onclickChannelSwitch.name=="onclickChannelSwitch") this.onclickChannelSwitch = this.onclickChannelSwitch.bind(this,tvprogram_oid);

            var channelfilter = this.getChannelfilter(tvprogram_oid,widgetID);
            if (channelfilter.length==0) channelfilter = this.channels.reduce((acc,el,i)=>{if (i<4) acc.push(el.id);return acc;},[]);

            var widthitem = this.measures[widgetID].widthItem;
            var widthchannel = this.measures[widgetID].heightRow;
            var heightrow = this.measures[widgetID].heightRow;

            var backgroundColor = this.realBackgroundColor($("#"+widgetID)[0]);
            var widthtvrow = (48*widthitem)+widthchannel;
            var scrollbarWidth= this.getScrollbarWidth();
            var zoompos = (Math.min(Math.floor($("#"+widgetID).height()/heightrow)-1,channelfilter.length))*heightrow;
            
            var headerfontpercent=data.headerfontpercent||125;
            var broadcastfontpercent=data.broadcastfontpercent||75;

            var text ='';
            text += '<style> \n';

            text += '#'+widgetID + ' * {\n';
            text += '   box-sizing: border-box; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-container {\n';
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   white-space:nowrap; \n';
            text += '   display:flex; \n';
            text += '   flex-direction: column; \n';
            text += '} \n';

            text += '#'+widgetID + ' .navcontainer {\n';
            text += '   width: 100%; \n';
            text += '} \n';

            text += '#'+widgetID + ' .scrollcontainer {\n';
            text += '   flex-grow: 1; \n';
            text += '   overflow:auto; \n';
            text += '   width:100%; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-row {\n';
            text += '   margin: 0px; \n';
            text += '   padding: 0px; \n';
            text += '   width: '+widthtvrow+'px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-item {\n';
            text += '   display: inline-block; \n';
            text += '   vertical-align: middle; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width:1px 0px 0px 1px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-head-time {\n';
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   top:0px; \n';
            text += '   z-index:11; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-head-left {\n';
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   left:0; \n';
            text += '   z-index:11; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '} \n';

            text += '#'+widgetID + ' svg rect {\n';
            text += '   fill: '+$("#"+widgetID).css("color")+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channel {\n';
            text += '   width: '+heightrow+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   padding: 1px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .time {\n';
            text += '   width: '+widthitem+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   font-weight: 700; \n';
            text += '   font-size: '+headerfontpercent+'%; \n';
            text += '   padding: 5px 5px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .time:after {\n';
            text += '   content:""; \n';
            text += '   display: inline-block; \n';
            text += '   vertical-align:middle; \n';
            text += '   height: 100%; \n';
            text += '} \n';

            text += '#'+widgetID + ' .time span {\n';
            text += '   vertical-align:middle; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcast {\n';
            text += '   height: '+heightrow+'px; \n';
            text += '   padding: 3px; \n';
            text += '   font-size: '+broadcastfontpercent+'%; \n';
            text += '   overflow: hidden; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastelement {\n';
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastelement .star  {\n';
            text += '   display: inline-block; \n';
            text += '   margin: 0px 2px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastelement .star svg {\n';
            text += '   height: 1em; \n';
            text += '   width: 1em; \n';
            text += '   position: relative; \n';
            text += '   top: .125em; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .star.selected svg  {\n';
            text += '   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastelement.selected .star svg path, #'+widgetID + 'broadcastdlg .star.selected {\n';
            text += '   color: '+highlightcolor+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastelement.selected {\n';
            text += '   color: '+highlightcolor+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .button {\n';
            text += '   display:inline-block; \n';
            text += '   width: '+heightrow+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '   vertical-align: middle; \n';
            text += '   padding: 5px 5px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .dateinfo {\n';
            text += '   height: '+heightrow+'px; \n';
            text += '   padding: 5px 5px; \n';
            text += '   position: absolute; \n';
            text += '   right: 0px; \n';
            text += '   border: 0px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .dateinfo:after {\n';
            text += '   content:""; \n';
            text += '   display: inline-block; \n';
            text += '   vertical-align:middle; \n';
            text += '   height: 100%; \n';
            text += '} \n';

            text += '#'+widgetID + ' .dateinfo span {\n';
            text += '   vertical-align:middle; \n';
            text += '} \n';

            text += '.ui-dialog.'+widgetID + ' {\n';
            text += '   z-index:12; \n';
            text += '} \n';

            text += '.clearfix {\n';
            text += '   clear:both; \n';
            text += '   content:""; \n';
            text += '   display:table; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .chselect-container {\n';
            //text += '   display: grid; \n';
            //text += '   gap:5px; \n';
            //text += '   grid-template-columns: repeat(auto-fill, minmax(60px, 60px)); \n';
            //text += '   width:100%; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg ul.channel {\n';
            text += '   margin:0px; \n';
            text += '   padding:0px; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .listitem  {\n';
            text += '   float: left; \n';
            //text += '   width:50px; \n';
            //text += '   height:50px; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .listitem .channel {\n';
            //text += '   width:50px; \n';
            //text += '   height:50px; \n';
            text += '   list-style: none; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .items  {\n';
            text += '   list-style: none; \n';
            text += '   margin:0px; \n';
            text += '   padding:0px; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .channel {\n';
            text += '   margin:5px; \n';
            text += '   width: '+(heightrow*1.5)+'px; \n';
            text += '   height: '+(heightrow*1.5)+'px; \n';
            text += '   list-style: none; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .items .channel[selected] {\n';
            text += '   background-color:lightgray; \n';
            text += '} \n';

            text += '.'+widgetID + '.no-titlebar .ui-dialog-titlebar {\n';
            text += '   display:none; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg  {\n';
            text += '   z-index:12; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-container.row {\n';
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:row; \n';
            text += '   overflow:hidden; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-container.col {\n';
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   flex-direction:column; \n';
            text += '   overflow:hidden; \n';
            text += '   font-size:75%; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-picture.row {\n';
            text += '   width:50%; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-picture.col {\n';
            text += '   height:30%; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-data {\n';
            text += '   overflow-y:auto; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-picture img {\n';
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-picture img {\n';
            text += '   width:auto; \n';
            text += '   height:auto; \n';
            text += '   max-width:100%; \n';
            text += '   max-height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';
            text += '#'+widgetID + 'broadcastdlg .dialogcolumn.row {\n';
            text += '   flex:1; \n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .dialogcolumn.col {\n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .button {\n';
            text += '   display:inline-block; \n';
            text += '   width: 35px; \n';
            text += '   height: 35px; \n';
            text += '   vertical-align: middle; \n';
            text += '   position: relative; \n';
            text += '   float: right; \n';
            text += '} \n';


            text += '#'+widgetID + ' .scrollcontainer ul.tv-row:nth-child(odd)> li.broadcast:nth-child(odd),#'+widgetID + ' ul.tv-row:nth-child(odd)> li.time:nth-child(odd) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.65); \n';
            text += '} \n';
            text += '#'+widgetID + ' .scrollcontainer ul.tv-row:nth-child(odd)> li.broadcast:nth-child(even),#'+widgetID + ' ul.tv-row:nth-child(odd)> li.time:nth-child(even) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.55); \n';
            text += '} \n';

            text += '#'+widgetID + ' .scrollcontainer ul.tv-row:nth-child(even)> li.broadcast:nth-child(odd) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.45); \n';
            text += '} \n';
            text += '#'+widgetID + ' .scrollcontainer ul.tv-row:nth-child(even)> li.broadcast:nth-child(even) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.35); \n';
            text += '} \n';

            text += '#'+widgetID + ' .line {\n';
            text += '   position: absolute; \n';
            text += '   top: 0; \n';
            text += '   width: 2px; \n';
            text += '   background-color: red; \n';
            text += '   opacity: 0.8; \n';
            text += '   z-index: 10; \n';
            text += '   height: '+((channelfilter.length+1)*heightrow)+'px; \n';
            text += '   float: left; \n';
            text += '} \n';

            text += '#'+widgetID + ' .disable-select {\n';
            text += '   -webkit-user-select: none; \n';
            text += '   -moz-user-select: none; \n';
            text += '   -ms-user-select: none; \n';
            text += '   -user-select: none; \n';
            text += '} \n';
            
            text += '#'+widgetID + ' .staricon {\n';
            text += '     background-image: url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%\' height=\'100%\' viewBox=\'0 0 24 24\'><path fill=\'currentColor\' d=\'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z\' /></svg>"); \n';
            text += '} \n';
            //https://mayashavin.com/articles/svg-icons-currentcolor

            text += '</style> \n';
            text += '  <div class="svgcontainer">';
            text += '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="check-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#check-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="cancel-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#cancel-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="burger-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#burger-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="nav-prevD-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20,9V15H12V19.84L4.16,12L12,4.16V9H20Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#nav-prevD-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="nav-center-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#nav-center-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="nav-nextD-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#nav-nextD-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="zoom-minus-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#zoom-minus-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="zoom-center-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M19,19H15V21H19A2,2 0 0,0 21,19V15H19M19,3H15V5H19V9H21V5A2,2 0 0,0 19,3M5,5H9V3H5A2,2 0 0,0 3,5V9H5M5,15H3V19A2,2 0 0,0 5,21H9V19H5V15Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#zoom-center-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="zoom-plus-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#zoom-plus-icon"></use></svg>
            text += '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
            // to user : <svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg>

            text += '  </div>';

            text += '  <div class="navcontainer">';
            text += '    <ul class="tv-row tv-head-top">';
            text += this.getButtonHeader(datestring).join(""); 
            text += '    </ul>';
            text += '  </div>';
            text += '  <div class="scrollcontainer">';
            text += '    <ul class="tv-row tv-head-time">';
            text += '      <div class="line"></div>';
            text += '      <li class="tv-item tv-head-left channel">';
            text += '      </li>'; 

            text += this.getTimetable().join(""); 
            text += '    </ul>';
            var events = this.getEvents(this.tvprogram[viewdate],channelfilter);
            events.map(el=>{
                text += '    <ul class="tv-row">';
                text += this.getBroadcasts4Channel(el,widgetID,viewdate,tvprogram_oid,highlightcolor).join(""); 
                text += '    </ul>';
            });

            $('#' + widgetID+' .tv-container').html(text);

            console.log("Display day:"+datestring)
            $( "#"+widgetID+" .burger" ).click(function(widgetID,tvprogram_oid,el){
                vis.binds.tvprogram.time1.onclickChannel(widgetID,tvprogram_oid,el);
            }.bind(this,widgetID,tvprogram_oid));

            $( "#"+widgetID+" .nav.prevD" ).off("click.onClickDay").on("click.onClickDay",this.onClickDay.bind(this,widgetID, view, data, style));
            $( "#"+widgetID+" .nav.nextD" ).off("click.onClickDay").on("click.onClickDay",this.onClickDay.bind(this,widgetID, view, data, style));
            $( "#"+widgetID+" .nav.center" ).off("click.onClickDay").on("click.onClickDay",this.onClickDay.bind(this,widgetID, view, data, style));

            $( "#"+widgetID+" .zoom.minus" ).off("click.onClickZoom").on("click.onClickZoom",this.onClickZoom.bind(this,widgetID, view, data, style));
            $( "#"+widgetID+" .zoom.plus" ).off("click.onClickZoom").on("click.onClickZoom",this.onClickZoom.bind(this,widgetID, view, data, style));
            $( "#"+widgetID+" .zoom.center" ).off("click.onClickZoom").on("click.onClickZoom",this.onClickZoom.bind(this,widgetID, view, data, style));

            $( "#"+widgetID+" .scrollcontainer" ).scroll(function(widgetID,el) {
                if (this.scroll[widgetID].automatic==0) this.scroll[widgetID].automatic=2;
                this.scroll[widgetID].time=new Date();
                this.calcScroll(widgetID);
            }.bind(this,widgetID));
            $( "#"+widgetID+"broadcastdlg" ).click(function(){
                $( "#"+widgetID+"broadcastdlg" ).dialog("close");
            });
            this.copyStyles("font",$('#'+widgetID).get(0),$( "#"+widgetID+"broadcastdlg" ).get(0));
            this.copyStyles("color",$('#'+widgetID).get(0),$( "#"+widgetID+"broadcastdlg" ).get(0));
            this.copyStyles("background-color",$('#'+widgetID).get(0),$( "#"+widgetID+"broadcastdlg" ).get(0));

            this.updateMarker(widgetID,this.today[widgetID].today);
            if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(this.updateMarker.bind(this,widgetID,this.today[widgetID].today),15000);
            } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(this.updateMarker.bind(this,widgetID,this.today[widgetID].today),15000);
            }

            if (this.scroll[widgetID].position==0) {
                this.calcScroll(widgetID);
                this.setScroll(widgetID);
            } else {
                this.setScroll(widgetID);
            }
        },

        copyStyles: function(startsWith, from, to) {
            var cssFrom = window.getComputedStyle(from);
            var cssTo = window.getComputedStyle(to);
            for (var i = cssFrom.length; i--;) {
                if (cssFrom[i].startsWith(startsWith)) {
                    if (cssFrom.getPropertyValue(cssFrom[i]) != cssTo.getPropertyValue(cssFrom[i])) {
                        to.style.setProperty(cssFrom[i],cssFrom.getPropertyValue(cssFrom[i]));
                    }
                }
            }
        },
        onClickZoom: function(widgetID, view, data, style,el) {
            console.log("ClickZoom:"+$(el.currentTarget).attr('class'));
            var day=0;
            if ($(el.currentTarget).hasClass("plus")) this.measures[widgetID].widthItem = this.measures[widgetID].widthItem+(this.measures[widgetID].origwidthItem/4);
            if ($(el.currentTarget).hasClass("minus")) this.measures[widgetID].widthItem = this.measures[widgetID].widthItem-(this.measures[widgetID].origwidthItem/4);
            if ($(el.currentTarget).hasClass("center")) this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
            if (this.measures[widgetID].widthItem < 20) this.measures[widgetID].widthItem=this.measures[widgetID].origwidthItem;
            this.calcScroll(widgetID);
            this.createWidget(widgetID, view, data, style);
        },
        onClickDay: function(widgetID, view, data, style,el) {
            console.log("ClickNav:"+$(el.currentTarget).attr('class'));
            var day=0;
            if ($(el.currentTarget).hasClass("prevD")) day=-1;
            if ($(el.currentTarget).hasClass("nextD")) day=1;
            if (!$(el.currentTarget).hasClass("center")) {
                this.today[widgetID]["prevday"]=new Date(this.today[widgetID]["today"]);
                this.today[widgetID]["today"]=new Date(this.today[widgetID]["today"].setDate(this.today[widgetID]["today"].getDate() + day));
            } else {
                this.today[widgetID]["today"]=new Date();
                this.scroll[widgetID].position=0;
            }
            this.scroll[widgetID].time=new Date(0);
            this.createWidget(widgetID, view, data, style);
        },
        calcDate: function(datum) {
            var d = new Date(datum);
            var time = d.getHours()+d.getMinutes()/60;
            if (time>=0 && time <5) d.setDate(d.getDate()-1);
            return d;
        },
        calcScroll: function(widgetID) {
            var el = $('#'+widgetID+' .scrollcontainer').get(0);
            if (el.scrollLeft==0 || this.scroll[widgetID].position==0) {
                this.scroll[widgetID].position=(this.scroll[widgetID].marker)/el.scrollWidth;
            } else {
                this.scroll[widgetID].position=(el.scrollLeft+(el.clientWidth*this.measures[widgetID].markerpositionpercent))/el.scrollWidth;
            }
        },
        setScroll: function(widgetID) {
            var el = $('#'+widgetID+' .scrollcontainer').get(0);
            el.scrollLeft = (this.scroll[widgetID].position*el.scrollWidth)-(el.clientWidth*this.measures[widgetID].markerpositionpercent);
        },
        updateMarker: function(widgetID,today) {
            if (this.scroll[widgetID].automatic==2 && ((new Date() - this.scroll[widgetID].time)<(90*1000))) return;
            this.scroll[widgetID].automatic=0;
            if (this.calcDate(today).toLocaleDateString() != this.calcDate(new Date()).toLocaleDateString()) {
                $('#'+widgetID+' .line').hide();
                //return;
            } else {
                $('#'+widgetID+' .line').show();
            }
            var wItem=this.measures[widgetID].widthItem;
            var tItem=this.measures[widgetID].timeItem;
            var wChannel=this.measures[widgetID].heightRow;

            var sTime=new Date(this.calcDate(new Date()));
            sTime.setHours(5);
            sTime.setMinutes(0);
            sTime.setSeconds(0);
            var eTime=new Date(sTime);
            eTime.setDate(eTime.getDate()+1);

            var startTime= new Date();
            if (startTime>=eTime) var a=0; //hidden
            if (startTime<=sTime) var a=0; //hidden
            var left = (wChannel+Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10);
            $('#'+widgetID+' .line').css('left',left+'px');
            this.scroll[widgetID].marker=left;
            this.scroll[widgetID].position=0;
            this.calcScroll(widgetID);
            if (this.scroll[widgetID].timeout) clearTimeout(this.scroll[widgetID].timeout);
            this.scroll[widgetID].automatic=1;
            this.scroll[widgetID].timeout = window.setTimeout(function(){
                this.scroll[widgetID].automatic=0;
                clearTimeout(this.scroll[widgetID].timeout);
                this.scroll[widgetID].timeout=null;
            }.bind(this), 500);
            this.setScroll(widgetID);

        },
        getScrollbarWidth: function() {
            var scrollDiv = document.createElement("div");
            scrollDiv.className = "scrollbar-measure";
            scrollDiv.style.cssText ="width: 100px;height: 100px;overflow: scroll;position: absolute;top: -9999px;";
            document.body.appendChild(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        },        
        getChannels: function(channels,filter=[]) {
            var cc=[];
            filter.map(el=>{
                var ch=channels.find(el1=>el1.id==el);
                //cc.push('<ul class="listitem channel" data-order="'+ch.order+'" data-id="'+ch.id+'" selected><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+ch.channelId+'.png" alt="" class="channel-logo"></li></ul>');
                cc.push('<li class="listitem channel" data-order="'+ch.order+'" data-id="'+ch.id+'" selected><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+ch.channelId+'.png" alt="" class="channel-logo"></li>');
            });
            channels.sort((a, b) => (a.order+(filter.indexOf(a.id)==-1)*100000) - (b.order+(filter.indexOf(b.id)==-1)*100000)).map( el=> {
                //if (filter.findIndex(el1=>el1==el.id)==-1) cc.push('<ul class="listitem channel" data-order="'+el.order+'" data-id="'+el.id+'"><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+el.channelId+'.png" alt="" class="channel-logo"></li></ul>');
                if (filter.findIndex(el1=>el1==el.id)==-1) cc.push('<li class="listitem channel" data-order="'+el.order+'" data-id="'+el.id+'"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+el.channelId+'.png" alt="" class="channel-logo"></li>');
            });
            return cc;
        },
        onclickChannelSwitch: function(tvprogram_oid,el) {
            var channelid = el.dataset.channelid||"";
            vis.setValue(tvprogram_oid+".selectchannel",channelid);
        },
        onclickChannelSave: function(widgetID,tvprogram_oid,el,save) {
            if (save) {
                this.setChannelfilter(tvprogram_oid,widgetID,$(".chselect-container .channel[selected]").toArray().map(el=>parseInt(el.dataset.id)));
            }
            $( "#"+widgetID+"channeldlg" ).dialog( "close" );
        },
        onclickChannel: function(widgetID,tvprogram_oid,el) {
            var isSorting=false;
            var channels = this.channels;
            var channelfilter = this.getChannelfilter(tvprogram_oid,widgetID);
            if (channelfilter.length==0) channelfilter = channels.reduce((acc,el,i)=>{if (i<4) acc.push(el.id);return acc;},[]);

            var text="";
            text += '  <div class="chselect-container clearfix">';
            text += '    <ul class="listitem channel" data-dp="'+tvprogram_oid+'" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,true)" ><li class="channel"><svg width="100%" height="100%" ><use xlink:href="#check-icon"></use></svg></li></ul>';
            text += '    <ul class="listitem channel" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,false)"><li class="channel"><svg width="100%" height="100%" ><use xlink:href="#cancel-icon"></use></svg></li></ul>';
            text += '  </div>';

            text += '  <div class="chselect-container clearfix sortable">';
            text += '  <ul class="items">';
            text += this.getChannels(channels,channelfilter).join("\n"); 
            text += '  </ul>';
            text += '  </div>';
            $( "#"+widgetID+"channeldlg" ).html(text);
            $(".chselect-container .items .channel").click(function() {
                console.log("channel click");
                if (isSorting) return;
                var target=$(this).parent().find("[selected]").last();
                if (this.dataset.id) $(this).attr("selected")?$(this).removeAttr("selected"):$(this).attr("selected","");
                if ($(this).attr("selected")) {
                    $(this).insertAfter(target);
                } else {
                    $(this).parent().children().sort(function(a,b){
                       return (a.dataset.order+($(a).attr("selected")!="selected")*100000)-(b.dataset.order+($(b).attr("selected")!="selected")*100000);
                    }).appendTo($(this).parent());                    
                }
            });
            $(".chselect-container.sortable").sortable({
                items: ".items .channel[selected]",
                containment: "parent",
                revert: true,
                grid: [ 5, 5 ],
                opacity: 0.8,
                tolerance: "pointer",
                start: function( event, ui ) {
                    isSorting=true;
                },
                stop: function( event, ui ) {
                    isSorting=false;
                }
            });
            $( "#"+widgetID+"channeldlg" ).dialog({
                autoOpen: false,
                modal: false,
                position: { of: $("#"+widgetID) },
                width: $("#"+widgetID).width()*this.measures[widgetID].dialogwidthpercent,
                height: $("#"+widgetID).height()*this.measures[widgetID].dialogheightpercent,
                dialogClass: 'no-titlebar '+widgetID,
                zIndex: 10003,
                stack:false
            });
            this.copyStyles("font",$('#'+widgetID).get(0),$( "#"+widgetID+"channeldlg" ).get(0));
            this.copyStyles("color",$('#'+widgetID).get(0),$( "#"+widgetID+"channeldlg" ).get(0));
            this.copyStyles("background-color",$('#'+widgetID).get(0),$( "#"+widgetID+"channeldlg" ).get(0));
            $( "#"+widgetID+"channeldlg" ).dialog( "open" );
        },        
        getBroadcasts4Channel: function(el,widgetID,viewdate,tvprogram_oid) {
            var wItem=this.measures[widgetID].widthItem;
            var tItem=this.measures[widgetID].timeItem;
            var favorites = this.getFavorites(tvprogram_oid);
            var favhighlight;

            var sTime=new Date(el.events[0].airDate);
            sTime.setHours(5);
            sTime.setMinutes(0);
            var eTime=new Date(sTime);
            eTime.setDate(eTime.getDate()+1);
            var channel = this.channels.find(ch=>ch.id==el.channel);

            var aa=[];
            var text="";
            text += '    <li class="tv-item tv-head-left channel">';
            text += '      <img width="100%" height="100%" data-channelid="'+channel.channelId+'" src="https://tvfueralle.de/channel-logos/'+channel.channelId+'.png" alt="" class="channel-logo"  onclick="vis.binds.tvprogram.time1.onclickChannelSwitch(this)">';
            text += '    </li>'; 
            aa.push(text);

            for (var i=0;i<el.events.length;i++) {
                var event = el.events[i];
                var startTime= new Date(event.startTime);
                var endTime= new Date(event.endTime);
                if (startTime>=eTime) continue;
                if (endTime<=sTime) continue;
                if (i==0 && startTime > sTime) aa.push('<li class="tv-item broadcast" style="left:0px; width:'+   ((Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10))+'px;"></li>');
                if (startTime < sTime) startTime=sTime;
                if (endTime>eTime) endTime=eTime;
                favhighlight = (favorites.indexOf(event.title)>-1);
                text="";
                text+='<li class="tv-item broadcast" style="';
                text+='left:'+   (Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10)+'px;';
                text+='width:'+   ((Math.floor((endTime-startTime)/60000/tItem*wItem*10)/10))+'px;">';
                text+='<div class="broadcastelement '+((favhighlight)?'selected':'')+'" data-widgetid="'+widgetID+'" data-eventid="'+event.id+'" data-viewdate="'+viewdate+'" data-instance="'+tvprogram_oid+'" onclick="vis.binds.tvprogram.time1.onclickBroadcast(this)">';
                text+='<div class="broadcasttitle">'+ event.title;
                text+='<div class="star" data-viewdate="'+viewdate+'" data-eventid="'+event.id+'" onclick="return vis.binds.tvprogram.time1.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>';
                text+='</div>';
                var startTime= new Date(event.startTime);
                var endTime= new Date(event.endTime);
                text+='<div class="broadcasttime">';
                text+=("0"+startTime.getHours()).slice(-2)+":"+("0"+startTime.getMinutes()).slice(-2);
                text+=' - ';
                text+=("0"+endTime.getHours()).slice(-2)+":"+("0"+endTime.getMinutes()).slice(-2);
                text+='</div></div></li>';
                aa.push(text);
            }
            if (startTime<eTime && endTime < eTime) {
                startTime=endTime;
                endTime=eTime;
                text="";
                text+='<li class="tv-item broadcast" style="';
                text+='left:'+   (Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10)+'px;';
                text+='width:'+   ((Math.floor((endTime-startTime)/60000/tItem*wItem*10)/10))+'px;">';
                text+='</li>';
                aa.push(text);
            }
            return aa;
        },
        onclickRecord: function(tvprogram_oid,widgetID,el,evt) {
            var eventid = el.dataset.eventid||0;
            var viewdate = el.dataset.viewdate||0;
            if (eventid ==0||viewdate==0) return;
            this.getServerEvent(tvprogram_oid,eventid,viewdate,function(el,serverdata) {
                var event=serverdata;
                var channel = event.channel ? this.channels.find(el=>el.id==event.channel) : null;
                var record = {
                    startTime:event.startTime,
                    endTime:event.endTime,
                    title:event.title,
                    channel:event.channel,
                    channelid:channel.channelId
                }
            vis.setValue(tvprogram_oid+".record",JSON.stringify(record));
            }.bind(this,el));
            evt.stopPropagation();
        },
        onclickCopy: function(tvprogram_oid,widgetID,el,evt) {
            var aux = document.createElement("input");
            aux.setAttribute("value", $('#'+widgetID+'broadcastdlg .event-data').get(0).textContent);
            document.body.appendChild(aux);
            aux.focus();
            aux.select();
            document.execCommand("copy");
            document.body.removeChild(aux);
            evt.stopPropagation();
        },
        onclickFavorite: function(tvprogram_oid,widgetID,el,evt) {
            var eventid = el.dataset.eventid||0;
            var viewdate = el.dataset.viewdate||0;
            if (eventid ==0||viewdate==0) return;
            this.getServerEvent(tvprogram_oid,eventid,viewdate,function(el,serverdata) {
                event=serverdata;
                var favorites = this.getFavorites(tvprogram_oid);
                var index = favorites.indexOf(event.title);
                if (index>-1) {
                    favorites.splice(index, 1);
                    if ($(el).hasClass("button")) $(el).removeClass("selected");
                } else {
                    favorites.push(event.title);
                    if ($(el).hasClass("button")) $(el).addClass("selected");
                }
                this.setFavorites(tvprogram_oid,favorites);
            }.bind(this,el));
            evt.stopPropagation();
        },
        getConfig: function(tvprogram_oid) {
            var config;
            var attr = vis.states.attr(tvprogram_oid+".config.val");
            if (typeof attr !== 'undefined' && attr !== "null") {
                config = JSON.parse(attr);
            } else {
                config = {};
            }
            return config;
        },
        setConfig: function(tvprogram_oid,config) {
            vis.setValue(tvprogram_oid+".config",JSON.stringify(config));
        },
        getChannelfilter: function(tvprogram_oid,widgetID) {
            var config=this.getConfig(tvprogram_oid);
            if (!config[widgetID]) config[widgetID]={};
            if (!config[widgetID]["channelfilter"]) config[widgetID]["channelfilter"]=[];
            return config[widgetID]["channelfilter"];
        },
        setChannelfilter: function(tvprogram_oid,widgetID,channelfilter) {
            var config=this.getConfig(tvprogram_oid);
            if (!config[widgetID]) config[widgetID]={};
            config[widgetID]["channelfilter"]=channelfilter;
            this.setConfig(tvprogram_oid,config);
        },
        getFavorites: function(tvprogram_oid) {
            var config=this.getConfig(tvprogram_oid);
            if (!config["favorites"]) config["favorites"]=[];
            return config["favorites"];
        },
        setFavorites: function(tvprogram_oid,favorites) {
            var config=this.getConfig(tvprogram_oid);
            config["favorites"]=favorites;
            this.setConfig(tvprogram_oid,config);
        },
        onclickBroadcast: function(el) {
            var eventid = el.dataset.eventid||0;
            var widgetID = el.dataset.widgetid||0;
            var viewdate = el.dataset.viewdate||0;
            var instance = el.dataset.instance||"";
            if (eventid ==0||widgetID==0) return;
            this.getServerEvent(instance,eventid,viewdate,function(widgetID, serverdata){
                event=serverdata;
                var startTime= new Date(event.startTime);
                var endTime= new Date(event.endTime);            
                var category = event.content.category ? this.categories.find(el=>el.id==event.content.category) : null;
                var channel = event.channel ? this.channels.find(el=>el.id==event.channel) : null;
                var channeltime="";
                channeltime+= (channel)     ? channel.name+" ":"";
                channeltime+=("0"+startTime.getHours()).slice(-2)+":"+("0"+startTime.getMinutes()).slice(-2);
                channeltime+=' - ';
                channeltime+=("0"+endTime.getHours()).slice(-2)+":"+("0"+endTime.getMinutes()).slice(-2);
                var meta = "";
                meta+= (event.content.country)  ? event.content.country+" ":"";
                meta+= (event.content.year)     ? event.content.year+" ":"";
                meta+= (category)     ? category.title+" ":"";
                var season="",episode="";
                if (event.content.seasonNumber) {
                    season = event.content.seasonNumber;
                    season = (season<100) ? "S"+("0"+season).slice(-2):"S"+season;
                }
                if (event.content.episodeNumber) {
                    episode = event.content.episodeNumber;
                    episode = (episode<100) ? "E"+("0"+episode).slice(-2):"E"+episode;
                }
                meta+= (season || episode) ? season+episode+" ":"";
                var content=(event.content.texts.Long.value) ? event.content.texts.Long.value:(event.content.texts.VeryShort.value)?event.content.texts.VeryShort.value:"";
                var photourl=(event.photo.url) ? "https://tvfueralle.de" + event.photo.url : "https://tvfueralle.de/tv-logo-no-image.svg";
                var favorites = this.getFavorites(instance);
                var favhighlight = (favorites.indexOf(event.title)>-1);

                var layout = ($("#"+widgetID).width()*this.measures[widgetID].dialogwidthpercent > $("#"+widgetID).height()*this.measures[widgetID].dialogheightpercent)?" row":" col";
                var text="";
                text += '  <div class="event-container'+layout+'">';
                text += '    <div class="event-picture dialogcolumn'+layout+'">';
                text += '    <img src="'+photourl+'">';
                text += '    </div>';
                text += '    <div class="event-data dialogcolumn'+layout+'">';
                text += '      <div class="buttoncontainer">';
                text+='          <div class="record button" data-viewdate="'+viewdate+'" data-eventid="'+event.id+'" onclick="return vis.binds.tvprogram.time1.onclickRecord(this,event)"><svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg></div>';
                text+='          <div class="copy button" onclick="return vis.binds.tvprogram.time1.onclickCopy(this,event)"><svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg></div>';
                text+='          <div class="star button '+((favhighlight)?'selected':'')+'" data-viewdate="'+viewdate+'" data-eventid="'+event.id+'" onclick="return vis.binds.tvprogram.time1.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>';
                if (startTime<new Date() && new Date()<endTime) text += '        <div class="channelselect button" data-channelid="'+channel.channelId+'" onclick="vis.binds.tvprogram.time1.onclickChannelSwitch(this)"><svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg></div>';
                text += '      </div>';
                text += '      <div style="padding: 0px 0px 5px;">'+channeltime+'</div>';
                text += '      <div style="font-weight: bold;padding: 0px 0px 5px;">'+event.title+'</div>';
                text += '      <div style="padding: 0px 0px 5px;">'+meta+'</div>';
                text += '      <div>'+content+'</div>';
                text += '    </div>';
                text += '  </div>';
                text += '  </div>';

                $( "#"+widgetID+"broadcastdlg" ).html(text);
                $( "#"+widgetID+"broadcastdlg" ).dialog({
                    autoOpen: false,
                    modal: false,
                    position: { of: $("#"+widgetID), within: $("#"+widgetID)},
                    width: $("#"+widgetID).width()*this.measures[widgetID].dialogwidthpercent,
                    height: $("#"+widgetID).height()*this.measures[widgetID].dialogheightpercent,
                    dialogClass: 'no-titlebar '+widgetID,
                    zIndex: 10003,
                    stack:false,
                    collision:"none"
                });
                this.copyStyles("font",$('#'+widgetID).get(0),$( "#"+widgetID+"broadcastdlg" ).get(0));
                this.copyStyles("color",$('#'+widgetID).get(0),$( "#"+widgetID+"broadcastdlg" ).get(0));
                this.copyStyles("background-color",$('#'+widgetID).get(0),$( "#"+widgetID+"broadcastdlg" ).get(0));
                $( "#"+widgetID+"broadcastdlg" ).dialog("open");
            }.bind(this, widgetID));
        },        
        getEvents: function(tvprogram,filter) {
            var tv=[],i;
            tvprogram.map((el)=>{
                if (( i=filter.indexOf(el.channel))>-1) {
                    if (!tv[i]) tv[i]={};
                    if (!tv[i].events) tv[i].events=[];
                    tv[i].channel=el.channel;
                    tv[i].events.push(el);
                }
            });
            return tv;
        },
        getTimetable: function() {
            var tt=[];
            for(var i=0;i<24;i++) {
                tt.push('<li class="tv-item time"><span>'+("0"+i).slice(-2)+":00</span></li>");
                tt.push('<li class="tv-item time"><span>'+("0"+i).slice(-2)+":30</span></li>");
            }
            return [].concat(tt.slice(10),tt.slice(0,10));
        },
        getButtonHeader: function(datestring) {
            var hh=[];
                hh.push('<li class="tv-item tv-head-topleft tv-head-left button burger"><svg width="100%" height="100%" ><use xlink:href="#burger-icon"></use></svg></li>');
                hh.push('<li class="tv-item button nav prevD"><svg width="100%" height="100%" ><use xlink:href="#nav-prevD-icon"></use></svg></li>');
                hh.push('<li class="tv-item button nav center"><svg width="100%" height="100%" ><use xlink:href="#nav-center-icon"></use></svg></li>');
                hh.push('<li class="tv-item button nav nextD"><svg width="100%" height="100%" ><use xlink:href="#nav-nextD-icon"></use></svg></li>');
                hh.push('<li class="tv-item button zoom minus"><svg width="100%" height="100%" ><use xlink:href="#zoom-minus-icon"></use></svg></li>');
                hh.push('<li class="tv-item button zoom center"><svg width="100%" height="100%" ><use xlink:href="#zoom-center-icon"></use></svg></li>');
                hh.push('<li class="tv-item button zoom plus"><svg width="100%" height="100%" ><use xlink:href="#zoom-plus-icon"></use></svg></li>');
                hh.push('<li class="tv-item dateinfo">'+new Date(datestring).toLocaleDateString(navigator.language,{weekday:"short"})+", "+new Date(datestring).toLocaleDateString()+'</li>');
            return hh;
        },
        onChange: function(widgetID, view, data, style,tvprogram_oid,e, newVal, oldVal) {
            if (e.type=="tvprogram.0.config.val") {
                console.log("changed "+widgetID+" type:"+e.type +" val:"+newVal);
                this.createWidget(widgetID, view, data, style);
            }
            if (e.type=="tvprogram.0.cmd.val") {
                if (newVal && newVal != "") {
                    console.log("changed "+widgetID+" type:"+e.type +" val:"+newVal);
                    var obj = newVal.split("|");
                    if (obj[0]=="new") {
                        if (obj[1] != "program") {
                            this.getServerData(tvprogram_oid,widgetID,obj[1],function(widgetID, view, data, style, serverdata){
                                this[obj[1]]=serverdata;
                                this.createWidget(widgetID, view, data, style);
                                return;
                            }.bind(this, widgetID, view, data, style));
                        }
                        if (obj[1] == "program") {
                            if (this.tvprogram[obj[2]]) this.getServerData(tvprogram_oid,widgetID,'program.'+obj[2],function(widgetID, view, data, style,datestring,serverdata){
                                if (serverdata!="error") {
                                    this.tvprogram[datestring]=serverdata;
                                    this.createWidget(widgetID, view, data, style);
                                    return;
                                }
                            }.bind(this, widgetID, view, data, style,obj[2]));
                        }
                    }
                }
            }
        },
        getDate: function(d,add) {
            var d1=new Date(d);
            d1.setDate(d1.getDate() + add);
            return d1.getFullYear()+"-"+('0' + (d1.getMonth()+1)).slice(-2) + '-' + ('0' + (d1.getDate())).slice(-2)
        },
        realBackgroundColor: function(elem) {
            var transparent = 'rgba(0, 0, 0, 0)';
            var transparentIE11 = 'transparent';
            if (!elem) return transparent;

            var bg = getComputedStyle(elem).backgroundColor;
            if (bg === transparent || bg === transparentIE11) {
                return this.realBackgroundColor(elem.parentElement);
            } else {
                return bg;
            }
        },
        getServerData: function(instance,widgetID,dataname,callback) {
            if (!this.pending[instance]) this.pending[instance]={};
            if (!this.pending[instance][widgetID]) this.pending[instance][widgetID]={};
            if (!this.pending[instance][widgetID][dataname]) { 
                this.pending[instance][widgetID][dataname]=true;
                console.log("getServerData request "+instance+"."+dataname);
                vis.conn._socket.emit('sendTo', instance, 'getServerData', dataname,function (data) {
                    console.log("getServerData received "+instance+"."+dataname);
                    this.pending[instance][widgetID][dataname]=false;
                    if (callback) callback(data);
                }.bind(this));
            }
        },
        getServerEvent: function(instance,eventid,viewdate,callback) {
            console.log("getServerEvent request "+eventid+"."+viewdate);
            vis.conn._socket.emit('sendTo', instance, 'getServerEvent', {eventid:eventid,viewdate:viewdate},function (data) {
                console.log("getServerEvent received "+instance+"."+viewdate+"."+eventid );
                if (callback) callback(data);
            }.bind(this));
        },
        setServerData: function(instance,dataname,data,callback) {
//            vis.conn._socket.emit('sendTo', instance, 'getServerData', {dataname:dataname,data:data},function (data) {
//                callback(data);
//            });        
        },
        
    },
    getTvprogramId: function(tvprogram_oid) {
        var idParts = tvprogram_oid.split('.');
        if (idParts.length<2) return "";
        idParts=idParts.slice(0,2);
        return idParts.join('.');
    },
    bindStates: function (elem, bound, change_callback) {
        console.log("bindStates");
        var $div = $(elem);
        var boundstates = $div.data('bound');
        if (boundstates) {
            for (var i = 0; i < boundstates.length; i++) {
                vis.states.unbind(boundstates[i], change_callback);
            }
        }
        $div.data('bound', null);
        $div.data('bindHandler', null);

        vis.conn.gettingStates = 0;
        vis.conn.getStates(bound, function (error, states) {

            vis.conn.subscribe(bound);
            for (var i=0;i<bound.length;i++) {
                bound[i]=bound[i]+'.val';
                vis.states.bind(bound[i] , change_callback);            
            }
            vis.updateStates(states);
            $div.data('bound', bound);
            $div.data('bindHandler', change_callback);
        }.bind({change_callback}));                
    },
};

vis.binds["tvprogram"].showVersion();

jQuery.fn.mydelay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};
