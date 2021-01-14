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
            console.log("createWidget init");
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

            if (!this.olddata[widgetID]) this.olddata[widgetID] = data;
            if (!this.measures[widgetID] || (JSON.stringify(this.olddata[widgetID])!=JSON.stringify(data)) ) this.measures[widgetID]= {
                origwidthItem:parseInt(data.widthItem)||120,
                //widthItem:parseInt(data.widthItem)||120,
                timeItem:30,
                heightRow:parseInt(data.heightRow)||35,
                scrollbarWidth:this.getScrollbarWidth(),
            }
            if (!this.measures[widgetID].widthItem) this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;

            if (!((this.today||{})[widgetID]||{}).prevday) $('#' + widgetID+' .tv-container').html("Datapoints loading...");

            if (Object.keys(this.categories).length==0) this.getServerData(tvprogram_oid,widgetID,'categories',function(widgetID, view, data, style, serverdata){
                this.categories=serverdata.category;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));
            if (Object.keys(this.channels).length==0) this.getServerData(tvprogram_oid,widgetID,'channels',function(widgetID, view, data, style,serverdata){
                this.channels=serverdata.channels;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));
            if (Object.keys(this.genres).length==0) this.getServerData(tvprogram_oid,widgetID,'genres',function(widgetID, view, data, style,serverdata){
                this.genres=serverdata.genres;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));


            function check(prop) {
                if (!prop) return true;
                if (Object.keys(prop)==0) return true;
                return false;
            }

            if (!this.today[widgetID]) this.today[widgetID] = {today:new Date(),prevday:null};

            var d = this.calcDate(this.today[widgetID].today);
            var datestring = this.getDate(d,0);
            if (!this.viewday[widgetID]) this.viewday[widgetID] = {viewday:datestring,prevday:null};
            this.viewday[widgetID].viewday=datestring;

            var viewdate = this.getDate(d,0);

            if (check(this.tvprogram[datestring])) {
                this.getServerData(tvprogram_oid,widgetID,'program.'+datestring,function(widgetID, view, data, style,datestring,serverdata){
                    if (serverdata!="error") {
                        this.tvprogram[datestring]=serverdata.events;
                        $('#'+widgetID + ' .overlay').html(new Date(datestring).toLocaleDateString());
                        this.createWidget(widgetID, view, data, style);
                        return;
                    } else {
                        this.today[widgetID]["today"]=new Date(this.today[widgetID]["prevday"]);
                        this.viewday[widgetID]["viewday"]=new Date(this.viewday[widgetID]["prevday"]);
                        $('#'+widgetID + ' .overlay').html("no data for "+new Date(datestring).toLocaleDateString());
                        this.createWidget(widgetID, view, data, style);
                        return;
                        //$('#' + widgetID+' .tv-container').html("Error: Problem to load tvdata for "+datestring);
                    }
                }.bind(this, widgetID, view, data, style,datestring));
            } else {
                $('#'+widgetID + ' .overlay').html(new Date(datestring).toLocaleDateString());
            }
            if (Object.keys(this.categories).length==0 || Object.keys(this.channels).length==0 || Object.keys(this.categories).length==0) return;
            if (check(this.tvprogram[datestring])) return;

            if (this.viewday[widgetID]["viewday"]!=this.viewday[widgetID]["prevday"]) {
                $('#'+widgetID + ' .overlay').fadeTo(500,0.7).mydelay(500).fadeTo(500,0);
                this.viewday[widgetID]["prevday"]=this.viewday[widgetID]["viewday"];
            }

            if(!this.bound[tvprogram_oid]) this.bound[tvprogram_oid]={};
            if(!this.bound[tvprogram_oid][widgetID]) this.bound[tvprogram_oid][widgetID]=false;

            //if (this.onChange.name=="onChange") this.onChange = this.onChange.bind(this, widgetID, view, data, style);
            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (1 || !vis.editMode) {
                    this.bound[tvprogram_oid][widgetID]=true;
                    vis.binds["tvprogram"].bindStates($div,[
                        tvprogram_oid + '.config',
                        ],this.onChange.bind(this, widgetID, view, data, style)
                    );
                }
            }

            if (this.onclickBroadcast.name=="onclickBroadcast")     this.onclickBroadcast = this.onclickBroadcast.bind(this);
            //if (this.onclickChannel.name=="onclickChannel")         this.onclickChannel = this.onclickChannel.bind(this,widgetID,tvprogram_oid);
            if (this.onclickChannelSave.name=="onclickChannelSave") this.onclickChannelSave = this.onclickChannelSave.bind(this,widgetID,tvprogram_oid);
            //if (this.updateMarker.name=="updateMarker")             this.updateMarker = this.updateMarker.bind(this,widgetID,d);

            var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
            if (!config[widgetID]) config[widgetID]={};
            if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
            var channelfilter = config[widgetID].channelfilter;
            if (channelfilter.length==0) channelfilter = this.channels.reduce((acc,el,i)=>{if (i<4) acc.push(el.id);return acc;},[]);
            
/*            var widthitem = 120;
            var widthchannel = 35;
            var heightrow = 35;
            var widthtvrow = (48*widthitem)+widthchannel;
            var backgroundColor = this.realBackgroundColor($("#"+widgetID)[0]);
            var scrollbarWidth= this.getScrollbarWidth();
*/
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

            text += '#'+widgetID + ' .tv-container {\n';
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   white-space:nowrap; \n';
            text += '   overflow:auto; \n';
            text += '   position:relative; \n';
            text += '} \n';
            
            text += '#'+widgetID + ' * {\n';
            text += '   box-sizing: border-box; \n';
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

            text += '#'+widgetID + ' .channel {\n';
            text += '   width: '+heightrow+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   padding: 1px; \n';
            text += '} \n';

            text += '#'+widgetID + ' ul.tv-row:nth-child(odd)> li.broadcast:nth-child(odd),#'+widgetID + ' ul.tv-row:nth-child(odd)> li.time:nth-child(odd) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.65); \n';
            text += '} \n';
            text += '#'+widgetID + ' ul.tv-row:nth-child(odd)> li.broadcast:nth-child(even),#'+widgetID + ' ul.tv-row:nth-child(odd)> li.time:nth-child(even) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.55); \n';
            text += '} \n';

            text += '#'+widgetID + ' ul.tv-row:nth-child(even)> li.broadcast:nth-child(odd) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.45); \n';
            text += '} \n';
            text += '#'+widgetID + ' ul.tv-row:nth-child(even)> li.broadcast:nth-child(even) {\n';
            text += '   background-color: rgba(128, 128, 128, 0.35); \n';
            text += '} \n';

            text += '#'+widgetID + ' .burger {\n';
            text += '   width: '+heightrow+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   padding: 5px; \n';
            text += '} \n';

            text += '#'+widgetID + ' svg rect {\n';
            text += '   fill: '+$("#"+widgetID).css("color")+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcast {\n';
            text += '   height: '+heightrow+'px; \n';
            text += '   padding: 3px; \n';
            text += '   font-size: '+broadcastfontpercent+'%; \n';
            text += '   overflow: hidden; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-head-top {\n';
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   top:0; \n';
            text += '   z-index:11; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-head-left {\n';
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   left:0; \n';
            text += '   z-index:10; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-head-topleft {\n';
            text += '   position:sticky; \n';
            text += '   position: -webkit-sticky; \n';
            text += '   top:0; \n';
            text += '   z-index:12; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '} \n';

            text += '.ui-dialog.'+widgetID + ' {\n';
            text += '   z-index:12; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg  {\n';
            text += '   z-index:12; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .dialogcolumn {\n';
            text += '   flex:50%; \n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-container {\n';
            text += '   height:100%; \n';
            text += '   display:flex; \n';
            text += '   overflow:hidden; \n';
            text += '   font-size:75%; \n';
            text += '} \n';

            text += '#'+widgetID + 'broadcastdlg .event-picture {\n';
            text += '   height:100%; \n';
            text += '   width:50%; \n';
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

            text += '#'+widgetID + 'channeldlg .chselect-container {\n';
            text += '   display: grid; \n';
            text += '   gap:5px; \n';
            text += '   grid-template-columns: repeat(auto-fill, minmax(60px, 60px)); \n';
            text += '   width:100%; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg .listitem .channel {\n';
            text += '   width:50px; \n';
            text += '   height:50px; \n';
            text += '   margin:auto; \n';
            text += '   list-style: none; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg div {\n';
            text += '   width:50px; \n';
            text += '   height:50px; \n';
            text += '   margin:auto; \n';
            text += '   list-style: none; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg ul.channel {\n';
            text += '   margin:0px; \n';
            text += '   padding:0px; \n';
            text += '} \n';

            text += '#'+widgetID + 'channeldlg ul.channel[selected] {\n';
            text += '   background-color:lightgray; \n';
            text += '} \n';

            text += '.'+widgetID + '.no-titlebar .ui-dialog-titlebar {\n';
            text += '   display:none; \n';
            text += '} \n';

            text += '#'+widgetID + ' .navcontainer {\n';
            text += '   position:absolute; \n';
            text += '   top:0px; \n';
            text += '   right:0px; \n';
            text += '   z-index:12; \n';
            text += '} \n';

            text += '#'+widgetID + ' .nav {\n';
            text += '   display:inline-block; \n';
            text += '   width: '+heightrow+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '   border: 1px solid; \n';
            text += '   border-radius: 5px; \n';
            text += '   vertical-align: middle; \n';
            text += '   padding: 5px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .nav svg rect {\n';
            text += '   fill: '+$("#"+widgetID).css("color")+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .zoomcontainer {\n';
            text += '   position:absolute; \n';
            text += '   top:'+zoompos+'px; \n';
            text += '   right:0px; \n';
            text += '   z-index:12; \n';
            text += '} \n';

            text += '#'+widgetID + ' .zoom {\n';
            text += '   display:inline-block; \n';
            text += '   width: '+heightrow+'px; \n';
            text += '   height: '+heightrow+'px; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '   border: 1px solid; \n';
            text += '   border-radius: 5px; \n';
            text += '   vertical-align: middle; \n';
            text += '   padding: 5px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .overlay {\n';
            text += '   position: absolute; \n';
            text += '   top: 0; \n';
            text += '   left: 0; \n';
            text += '   height: 100%; \n';
            text += '   width: 100%; \n';
            text += '   z-index: 12; \n';
            text += '   line-height: '+$("#"+widgetID).height()+'px; \n';
            text += '   vertical-align: middle; \n';
            text += '   text-align: center; \n';
            text += '   background-color: '+ backgroundColor +'; \n';
            text += '   opacity: 0; \n';
            text += '   font-size: 200%; \n';
            text += '   pointer-events: none; \n';

            text += '} \n';

            text += '#'+widgetID + ' .zoom svg rect {\n';
            text += '   fill: '+$("#"+widgetID).css("color")+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .line {\n';
            text += '   position: absolute; \n';
            text += '   top: 0; \n';
            text += '   width: 2px; \n';
            text += '   background-color: red; \n';
            text += '   opacity: 0.8; \n';
            text += '   z-index: 10; \n';
            text += '   height: '+Math.min(((channelfilter.length+1)*heightrow),$("#"+widgetID).height())+'px; \n';
            text += '   float: left; \n';
            text += '} \n';

            text += '</style> \n';            
          
            text += '  <div class="line"></div>';
            text += '  <ul class="tv-row tv-head-top">';

            //text += '    <li class="tv-item tv-head-topleft tv-head-left burger" onclick="vis.binds.tvprogram.time1.onclickChannel(this)">';
            text += '    <li class="tv-item tv-head-topleft tv-head-left burger">';
            text += '      <svg width="100%" height="100%" viewBox="0 0 24 24">';
            text += '          <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />';
            text += '      </svg>';

            
            
            //text += '      <svg width="100%" height="100%" viewBox="0 0 25 25">';
            //text += '        <rect width="25" height="5" fill="white" y="0"></rect>';
            //text += '        <rect y="10" width="25" height="5" fill="white"></rect>';
            //text += '        <rect y="20" width="25" height="5" fill="white"></rect>';
            text += '      </svg>';
            text += '    </li>'; 
            text += this.getTimetable().join(""); 
            text += '  </ul>';
            var events = this.getEvents(this.tvprogram[viewdate],channelfilter);
            events.map(el=>{
                text += '  <ul class="tv-row">';
                text += this.getBroadcasts4Channel(el,widgetID,viewdate,tvprogram_oid).join(""); 
                text += '  </ul>';
            });

            $('#' + widgetID+' .tv-container').html(text);

            $('#' + widgetID+' .navcontainer').css('visibility', 'visible');
            $('#' + widgetID+' .zoomcontainer').css('visibility', 'visible');

            console.log("Display day:"+datestring)
            if ($('.tv-container')[0].offsetHeight<$('.tv-container')[0].scrollHeight) {
                $('.navcontainer,.zoomcontainer').each((i,el)=>$(el).css("right",scrollbarWidth));
            }
            $( "#"+widgetID+" .burger" ).click(function(widgetID,tvprogram_oid,el){
                vis.binds.tvprogram.time1.onclickChannel(widgetID,tvprogram_oid,el);
            }.bind(this,widgetID,tvprogram_oid));

            $( "#"+widgetID+" .nav.prevD" ).off("click.onClickDay").on("click.onClickDay",this.onClickDay.bind(this,widgetID, view, data, style));
            $( "#"+widgetID+" .nav.nextD" ).off("click.onClickDay").on("click.onClickDay",this.onClickDay.bind(this,widgetID, view, data, style));

            $( "#"+widgetID+" .zoom.minus" ).off("click.onClickZoom").on("click.onClickZoom",this.onClickZoom.bind(this,widgetID, view, data, style));
            $( "#"+widgetID+" .zoom.plus" ).off("click.onClickZoom").on("click.onClickZoom",this.onClickZoom.bind(this,widgetID, view, data, style));

            $( "#"+widgetID+" .tv-container" ).scroll(function(a,b,c) {
                this.scroll[widgetID]=new Date();
            }.bind(this,widgetID));


            if (!$( "#"+widgetID+"broadcastdlg" ).hasClass('ui-dialog-content')) {
                $( "#"+widgetID+"broadcastdlg" ).dialog({
                    autoOpen: false,
                    modal: false,
                    position: { of: $("#"+widgetID) },
                    width: $("#"+widgetID).width()*0.9,
                    height: $("#"+widgetID).height()*0.9,
                    dialogClass: 'no-titlebar '+widgetID,
                    zIndex: 10003,
                    stack:false
                });
            }
            if (!$( "#"+widgetID+"channeldlg" ).hasClass('ui-dialog-content')) {
                $( "#"+widgetID+"channeldlg" ).dialog({
                    autoOpen: false,
                    modal: false,
                    position: { of: $("#"+widgetID) },
                    width: $("#"+widgetID).width()*0.9,
                    height: $("#"+widgetID).height()*0.9,
                    dialogClass: 'no-titlebar '+widgetID,
                    zIndex: 10003,
                    stack:false
                });
            }
            $( "#"+widgetID+"broadcastdlg" ).click(function(){
                $( "#"+widgetID+"broadcastdlg" ).dialog("close");
            });
            
            this.updateMarker(widgetID,this.today[widgetID].today);
            if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(this.updateMarker.bind(this,widgetID,this.today[widgetID].today),15000);
            } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(this.updateMarker.bind(this,widgetID,this.today[widgetID].today),15000);
            }
        },

        onClickZoom: function(widgetID, view, data, style,el) {
            console.log("ClickZoom:"+$(el.currentTarget).attr('class'));
            var day=0;
            if ($(el.currentTarget).hasClass("plus")) this.measures[widgetID].widthItem = this.measures[widgetID].widthItem+(this.measures[widgetID].origwidthItem/4);
            if ($(el.currentTarget).hasClass("minus")) this.measures[widgetID].widthItem = this.measures[widgetID].widthItem-(this.measures[widgetID].origwidthItem/4);
            if (this.measures[widgetID].widthItem < 20) this.measures[widgetID].widthItem=this.measures[widgetID].origwidthItem;
            this.scroll[widgetID]= new Date(new Date().getTime() - 180*1000);
            this.createWidget(widgetID, view, data, style);
        },
        onClickDay: function(widgetID, view, data, style,el) {
            console.log("ClickNav:"+$(el.currentTarget).attr('class'));
            var day=0;
            if ($(el.currentTarget).hasClass("prevD")) day=-1;
            if ($(el.currentTarget).hasClass("nextD")) day=1;
            this.today[widgetID]["prevday"]=new Date(this.today[widgetID]["today"]);
            this.today[widgetID]["today"]=new Date(this.today[widgetID]["today"].setDate(this.today[widgetID]["today"].getDate() + day));
            this.createWidget(widgetID, view, data, style);
        },
        calcDate: function(datum) {
            var d = new Date(datum);
            var time = d.getHours()+d.getMinutes()/60;
            if (time>=0 && time <5) d.setDate(d.getDate()-1);
            return d;
        },
        updateMarker: function(widgetID,today) {

            if (this.calcDate(today).toLocaleDateString() != this.calcDate(new Date()).toLocaleDateString()) {
                $('#'+widgetID+' .line').hide();
                return;
            } else {
                $('#'+widgetID+' .line').show();
            }
            var wItem=this.measures[widgetID].widthItem;
            var tItem=this.measures[widgetID].timeItem;
            var wChannel=this.measures[widgetID].heightRow;

            var sTime=new Date(this.calcDate(today));
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

            if (this.scroll[widgetID] && (new Date(this.scroll[widgetID].getTime() + 90*1000)>new Date())) return;
            this.scroll[widgetID]=new Date();
            $('#'+widgetID+' .tv-container').scrollLeft(left-$('#'+widgetID+' .tv-container').width()/4);
            
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
                cc.push('<ul class="listitem channel" data-order="'+ch.order+'" data-id="'+ch.id+'" selected><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+ch.channelId+'.png" alt="" class="channel-logo"></li></ul>');
            });
            channels.sort((a, b) => (a.order+(filter.indexOf(a.id)==-1)*100000) - (b.order+(filter.indexOf(b.id)==-1)*100000)).map( el=> {
                if (filter.findIndex(el1=>el1==el.id)==-1) cc.push('<ul class="listitem channel" data-order="'+el.order+'" data-id="'+el.id+'"><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+el.channelId+'.png" alt="" class="channel-logo"></li></ul>');
            });
            return cc;
        },
        onclickChannelSave: function(widgetID,tvprogram_oid,el,save) {
            if (save) {
                var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
                if (!config[widgetID]) config[widgetID]={};
                if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
                config[widgetID]['channelfilter'] = $(".chselect-container .channel[selected]").toArray().map(el=>parseInt(el.dataset.id));
                vis.setValue(tvprogram_oid+".config",JSON.stringify(config));
            }
            $( "#"+widgetID+"channeldlg" ).dialog( "close" );
        },
        onclickChannel: function(widgetID,tvprogram_oid,el) {
            var isSorting=false;
            var channels = this.channels;
            var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
            if (!config[widgetID]) config[widgetID]={};
            if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
            var channelfilter = config[widgetID].channelfilter;
            if (channelfilter.length==0) channelfilter = channels.reduce((acc,el,i)=>{if (i<4) acc.push(el.id);return acc;},[]);
            var text="";
            text += '  <div class="chselect-container">';
            text += '    <ul class="listitem channel" data-dp="'+tvprogram_oid+'" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,true)" ><li class="channel"><svg class="MuiSvgIcon-root jss160" focusable="false" viewBox="0 0 24 24" aria-hidden="true" tabindex="-1" title="Check" data-ga-event-category="material-icons" data-ga-event-action="click" data-ga-event-label="Check"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg></li></ul>';
            text += '    <ul class="listitem channel" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,false)"><li class="channel"><svg class="MuiSvgIcon-root jss160" focusable="false" viewBox="0 0 24 24" aria-hidden="true" tabindex="-1" title="Clear" data-ga-event-category="material-icons" data-ga-event-action="click" data-ga-event-label="Clear"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></li></ul>';
            text += '  </div>';

            text += '  <div class="chselect-container sortable">';
            text += this.getChannels(channels,channelfilter).join("\n"); 
            text += '  </div>';
            $( "#"+widgetID+"channeldlg" ).html(text);
            $(".chselect-container ul.channel").click(function() {
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
                items: "ul.channel[selected]",
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
            $( "#"+widgetID+"channeldlg" ).dialog( "open" );
        },        
        getBroadcasts4Channel: function(el,widgetID,viewdate,tvprogram_oid) {
/*
            var wItem=120;
            var tItem=30;
*/            //var min=1*60*1000;

            var wItem=this.measures[widgetID].widthItem;
            var tItem=this.measures[widgetID].timeItem;

            var sTime=new Date(el.events[0].airDate);
            sTime.setHours(5);
            sTime.setMinutes(0);
            var eTime=new Date(sTime);
            eTime.setDate(eTime.getDate()+1);
            var channel = this.channels.find(ch=>ch.id==el.channel);

            var aa=[];
            var text="";
            text += '    <li class="tv-item tv-head-left channel">';
            text += '      <img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+channel.channelId+'.png" alt="" class="channel-logo">';
            text += '    </li>'; 
            aa.push(text);

            for (var i=0;i<el.events.length;i++) {
                var event = el.events[i];
                var startTime= new Date(event.startTime);
                var endTime= new Date(event.endTime);
                if (startTime>=eTime) continue;
                if (endTime<=sTime) continue;
                if (i==0 && startTime > sTime) aa.push('<li class="tv-item broadcast" style="left:0px; width:'+   ((Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10))+'px;"></li>');
                if (i==0 && startTime < sTime) startTime=sTime;
                if (endTime>eTime) endTime=eTime;
                text="";
                text+='<li class="tv-item broadcast" style="';
                text+='left:'+   (Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10)+'px;';
                text+='width:'+   ((Math.floor((endTime-startTime)/60000/tItem*wItem*10)/10))+'px;">';
                text+='<div class="broadcastelement" data-widgetid="'+widgetID+'" data-eventid="'+event.id+'" data-viewdate="'+viewdate+'" data-instance="'+tvprogram_oid+'" onclick="vis.binds.tvprogram.time1.onclickBroadcast(this)">';
                text+='<div class="broadcasttitle">'+ event.title+'</div>';
                text+='<div class="broadcasttime">';
                text+=("0"+startTime.getHours()).slice(-2)+":"+("0"+startTime.getMinutes()).slice(-2);
                text+=' - ';
                text+=("0"+endTime.getHours()).slice(-2)+":"+("0"+endTime.getMinutes()).slice(-2);
                text+='</div></div></li>';
                aa.push(text);
            }
            return aa;
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
                var text="";
                text += '  <div class="event-container">';
                text += '    <div class="event-picture dialogcolumn">';
                text += '    <img src="'+photourl+'">';
                text += '    </div>';
                text += '    <div class="event-data dialogcolumn">';
                text += '    <div style="padding: 0px 0px 5px;">'+channeltime+'</div>';
                text += '    <div style="font-weight: bold;padding: 0px 0px 5px;">'+event.title+'</div>';
                text += '    <div style="padding: 0px 0px 5px;">'+meta+'</div>';
                text += '    <div>'+content+'</div>';
                text += '    </div>';
                text += '  </div>';
                text += '  </div>';
                $( "#"+widgetID+"broadcastdlg" ).html(text);
                $( "#"+widgetID+"broadcastdlg" ).dialog( "open" );                
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
        onChange: function(widgetID, view, data, style,e, newVal, oldVal) {
            console.log("changed "+widgetID+" type:"+e.type );
            this.createWidget(widgetID, view, data, style);
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
