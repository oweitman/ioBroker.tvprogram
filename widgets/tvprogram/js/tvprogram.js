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
        today:null,
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

            $('#' + widgetID+' .tv-container').html("Datapoints loading...");

            if (Object.keys(this.categories).length==0) this.getServerData(tvprogram_oid,'categories',function(widgetID, view, data, style, serverdata){
                this.categories=serverdata.category;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));
            if (Object.keys(this.channels).length==0) this.getServerData(tvprogram_oid,'channels',function(widgetID, view, data, style,serverdata){
                this.channels=serverdata.channels;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));
            if (Object.keys(this.genres).length==0) this.getServerData(tvprogram_oid,'genres',function(widgetID, view, data, style,serverdata){
                this.genres=serverdata.genres;
                this.createWidget(widgetID, view, data, style);
            }.bind(this, widgetID, view, data, style));


            function check(prop) {
                if (!prop) return true;
                if (Object.keys(prop)==0) return true;
                return false;
            }

            var d = this.calcDate();
            var datestring = this.getDate(d,0);
            var viewdate = this.getDate(d,0);
            if (check(this.tvprogram[datestring])) this.getServerData(tvprogram_oid,'program.'+datestring,function(widgetID, view, data, style,datestring,serverdata){
                if (serverdata!="error") {
                    this.tvprogram[datestring]=serverdata.events;
                    this.createWidget(widgetID, view, data, style);
                }
            }.bind(this, widgetID, view, data, style,datestring));
            /*
            for (var i=-1;i<5;i++) {
                datestring = this.getDate(d,i);
                if (check(this.tvprogram[datestring])) this.getServerData(tvprogram_oid,'program.'+datestring,function(widgetID, view, data, style,datestring,serverdata){
                    if (serverdata!="error") {
                        this.tvprogram[datestring]=serverdata.events;
                    }
                }.bind(this, widgetID, view, data, style,datestring));
            }
            */
            if (Object.keys(this.categories).length==0 || Object.keys(this.channels).length==0 || Object.keys(this.categories).length==0) return;
            if (check(this.tvprogram[datestring])) return;
            
            
            
            
            
            if(!this.bound[tvprogram_oid]) this.bound[tvprogram_oid]={};
            if(!this.bound[tvprogram_oid][widgetID]) this.bound[tvprogram_oid][widgetID]=false;

            if (this.onChange.name=="onChange") this.onChange = this.onChange.bind(this, widgetID, view, data, style);
            if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (1 || !vis.editMode) {
                    this.bound[tvprogram_oid][widgetID]=true;
                    vis.binds["tvprogram"].bindStates($div,[
//                        tvprogram_oid + '.categories',
//                        tvprogram_oid + '.channels',
//                        tvprogram_oid + '.genres',
                        tvprogram_oid + '.config',
                        //tvprogram_oid + '.program.'+this.getDate(d,-1),
//                        tvprogram_oid + '.program.'+this.getDate(d,+0),
                        //tvprogram_oid + '.program.'+this.getDate(d,+1),
                        //tvprogram_oid + '.program.'+this.getDate(d,+2),
                        //tvprogram_oid + '.program.'+this.getDate(d,+3),
                        //tvprogram_oid + '.program.'+this.getDate(d,+4)
                        ],this.onChange);
                }
            }
//            try {
//                var tvprogram  = JSON.parse(vis.states.attr( tvprogram_oid + '.program.'+this.getDate(d,+0) + '.val'));
//                var channels  = JSON.parse(vis.states.attr( tvprogram_oid + '.channels.val')).channels;
//                var categories  = JSON.parse(vis.states.attr( tvprogram_oid + '.categories.val')).category;
//            } catch {
//                $('#' + widgetID+' .tv-container').html("Datapoints loading...");
//                return;
//            }
//            if (Object.keys(tvprogram).length==0 || Object.keys(channels).length==0 || Object.keys(categories).length==0) return;
            if (this.onclickBroadcast.name=="onclickBroadcast")     this.onclickBroadcast = this.onclickBroadcast.bind(this);
            if (this.onclickChannel.name=="onclickChannel")         this.onclickChannel = this.onclickChannel.bind(this,widgetID,tvprogram_oid);
            if (this.onclickChannelSave.name=="onclickChannelSave") this.onclickChannelSave = this.onclickChannelSave.bind(this,widgetID,tvprogram_oid);
            if (this.updateMarker.name=="updateMarker")             this.updateMarker = this.updateMarker.bind(this,widgetID,d);

//            this.channels=channels;
//            this.categories=categories;
//            this.tvprogram=tvprogram;
            

            var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
            if (!config[widgetID]) config[widgetID]={};
            if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
            var channelfilter = config[widgetID].channelfilter;
            if (channelfilter.length==0) channelfilter = this.channels.reduce((acc,el,i)=>{if (i<4) acc.push(el.id);return acc;},[]);
            
            var widthitem = 120;
            var widthchannel = 35;
            var heightrow = 35;
            var widthtvrow = (48*widthitem)+widthchannel;
            var backgroundColor = this.realBackgroundColor($("#"+widgetID)[0]);
            var scrollbarWidth= this.getScrollbarWidth();

            var text ='';
            
            text += '<style> \n';

            text += '#'+widgetID + ' .tv-container {\n';
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   white-space:nowrap; \n';
            text += '   overflow:auto; \n';
            text += '   position:relative; \n';
            text += '} \n';
            
            text += '#'+widgetID + ' .tv-container * {\n';
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
            text += '   width: 120px; \n';
            text += '   height: 35px; \n';
            text += '   font-weight: 700; \n';
            text += '   font-size: 125%; \n';
            text += '   padding: 5px 5px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channel {\n';
            text += '   width: 35px; \n';
            text += '   height: 35px; \n';
            text += '   padding: 1px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .burger {\n';
            text += '   width: 35px; \n';
            text += '   height: 35px; \n';
            text += '   padding: 7px; \n';
            text += '} \n';

            text += '#'+widgetID + ' svg rect {\n';
            text += '   fill: '+$("#"+widgetID).css("color")+'; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcast {\n';
            text += '   height: 35px; \n';
            text += '   padding: 3px; \n';
            text += '   font-size: 75%; \n';
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

            text += '#'+widgetID + ' .line {\n';
            text += '   position: absolute; \n';
            text += '   top: 0; \n';
            text += '   width: 2px; \n';
            text += '   background-color: red; \n';
            text += '   opacity: 0.8; \n';
            text += '   z-index: 12; \n';
            text += '   height: '+((channelfilter.length+1)*heightrow)+'px; \n';
            text += '   float: left; \n';
            text += '} \n';

            text += '</style> \n';            
          
            text += '  <div class="line"></div>';
            text += '  <ul class="tv-row tv-head-top">';

            text += '    <li class="tv-item tv-head-topleft tv-head-left burger" onclick="vis.binds.tvprogram.time1.onclickChannel(this)">';
            text += '      <svg width="100%" height="100%" viewBox="0 0 25 25">';
            text += '        <rect width="25" height="5" fill="white" y="0"></rect>';
            text += '        <rect y="10" width="25" height="5" fill="white"></rect>';
            text += '        <rect y="20" width="25" height="5" fill="white"></rect>';
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
            
            this.updateMarker(widgetID,d);
            if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(this.updateMarker,15000);
            } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(this.updateMarker,15000);
            }

        },
        calcDate: function() {
            var d = new Date();
            var time = d.getHours()+d.getMinutes()/60;
            if (time>=0 && time <5) d.setDate(d.getDate()-1);
            return d;
        },
        updateMarker: function(widgetID,d) {
            var wItem=120;//2 border, 4 padding
            var tItem=30;
            var wChannel=35;
            var sTime=new Date(this.calcDate());
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
            $('#'+widgetID+' .tv-container').scrollLeft(left-$('#'+widgetID+' .tv-container').width()/2);
            
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
            //channels.sort((a, b) => a.order - b.order).map( el=> {
            channels.sort((a, b) => (a.order+(filter.indexOf(a.id)==-1)*100000) - (b.order+(filter.indexOf(b.id)==-1)*100000)).map( el=> {
                var selected=(filter.findIndex(el1=>el1==el.id)>-1) ? " selected":"";
                cc.push('<ul class="listitem channel" data-order="'+el.order+'" data-id="'+el.id+'"'+selected+'><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+el.channelId+'.png" alt="" class="channel-logo"></li></ul>');
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
            var wItem=120;//2 border, 4 padding
            var wBorder=2;
            var wPadding=0;
            var tItem=30;
            var min=1*60*1000;
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
                if (i==0 && startTime > sTime) aa.push('<li class="tv-item broadcast" style="left:0px; width:'+   ((Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10))+'px;"></li>');
                if (endTime>eTime) endTime=eTime;
                text="";
                text+='<li class="tv-item broadcast" style="';
                text+='left:'+   (Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10)+'px;';
                text+='width:'+   ((Math.floor((endTime-startTime)/60000/tItem*wItem*10)/10))+'px;">';
                //text+='<div class="broadcastelement" data-widgetid="'+widgetID+'" data-eventid="'+event.id+'" data-viewdate="'+viewdate+'" data-instance="'+tvprogram_oid+'" onclick="vis.binds.tvprogram.time1.onclickBroadcast(this)">';
                text+='<div class="broadcastelement" data-widgetid="'+widgetID+'" data-eventid="'+event.id+'" data-viewdate="'+viewdate+'" data-instance="'+tvprogram_oid+'" onclick="vis.binds.tvprogram.time1.onclickBroadcast1(this)">';
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
            if (eventid ==0||widgetID==0) return;
            var event = this.tvprogram[viewdate].find(el=>el.id==eventid);
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
            var content=(event.content.texts.Long) ? event.content.texts.Long.value:(event.content.texts.VeryShort)?event.content.texts.VeryShort.value:"";
            var photourl=(event.photo) ? "https://tvfueralle.de" + event.photo.url : "https://tvfueralle.de/tv-logo-no-image.svg";
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
        },
        onclickBroadcast1: function(el) {
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
                tt.push('<li class="tv-item time">'+("0"+i).slice(-2)+":00</li>");
                tt.push('<li class="tv-item time">'+("0"+i).slice(-2)+":30</li>");
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
        getServerData: function(instance,dataname,callback) {
            if (!this.pending[instance]) this.pending[instance]={};
            if (!this.pending[instance][dataname]) { 
                this.pending[instance][dataname]=true;
                console.log("getServerData request "+instance+"."+dataname);
                vis.conn._socket.emit('sendTo', instance, 'getServerData', dataname,function (data) {
                    console.log("getServerData received "+instance+"."+dataname);
                    this.pending[instance][dataname]=false;
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
            
    timex: {
        tvprogram:  {},
        channels:   {},
        categories: {},
        bound:      {},
        today:null,
        createWidget: function (widgetID, view, data, style) {
            console.log("createWidget init");
            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["tvprogram"].time.createWidget(widgetID, view, data, style);
                }, 100);
            }
            console.log("createWidget start");
            var tvprogram_oid;
            if (!data.tvprogram_oid || (tvprogram_oid = vis.binds["tvprogram"].getTvprogramId(data.tvprogram_oid))==false) return;
            if(!this.bound[tvprogram_oid]) this.bound[tvprogram_oid]=false;
            var d = new Date();

            if (this.onChange.name=="onChange") this.onChange = this.onChange.bind(this,widgetID, view, data, style);
            if (tvprogram_oid && !this.bound[tvprogram_oid]) {
                if (1 || !vis.editMode) {
                    this.bound[tvprogram_oid]=true;
                    vis.binds["tvprogram"].bindStates($div,[
                        tvprogram_oid + '.categories',
                        tvprogram_oid + '.channels',
                        tvprogram_oid + '.genres',
                        tvprogram_oid + '.config',
                        tvprogram_oid + '.program.'+this.getDate(d,-1),
                        tvprogram_oid + '.program.'+this.getDate(d,+0),
                        tvprogram_oid + '.program.'+this.getDate(d,+1),
                        tvprogram_oid + '.program.'+this.getDate(d,+2),
                        tvprogram_oid + '.program.'+this.getDate(d,+3),
                        tvprogram_oid + '.program.'+this.getDate(d,+4)
                        ],this.onChange);
                }
            }
            var tvprogram  = vis.states.attr( tvprogram_oid + '.program.'+this.getDate(d,+0) + '.val') ? JSON.parse(vis.states.attr( tvprogram_oid + '.program.'+this.getDate(d,+0) + '.val')):{};
            if (Object.keys(tvprogram).length==0) return;
            var channels  = data.channels_oid ? JSON.parse(vis.states.attr(data.channels_oid + '.val')).channels : {};
            var categories  = data.categories_oid ? JSON.parse(vis.states.attr(data.categories_oid + '.val')).category : {};
            this.onclickEvent = this.onclickEvent.bind(this);
            this.onclickChannel = this.onclickChannel.bind(this);
            this.onclickChannelSave = this.onclickChannelSave.bind(this);
            
            this.channels=channels;
            this.categories=categories;
            this.tvprogram=tvprogram;
            

            var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
            if (!config[widgetID]) config[widgetID]={};
            if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
            var channelfilter = config[widgetID].channelfilter;
            if (channelfilter.length==0) channelfilter = channels.reduce((acc,el,i)=>{if (i<4) acc.push(el.id);return acc;},[]);

            var text ='';
            
            text += '<style> \n';
            text += '#'+widgetID + ' ol, '+ '#'+widgetID + ' ul  {\n';
            text += '   list-style: none; \n'
            text += '   margin: 0; \n'
            text += '   padding: 0; \n'
            text += '} \n';
            text += '#'+widgetID + ' .tv-container {\n';
            text += '   width: 100%; \n';
            text += '   height: 100%; \n';
            text += '   display: flex; \n';
            text += '} \n';

            text += '#'+widgetID + ' .tv-container * {\n';
            text += '   box-sizing: border-box; \n';
            text += '} \n';
            
            text += '#'+widgetID + ' .channels {\n';
            text += '   width: 60px; \n';
            text += '   xdisplay: flex; \n';
            text += '   flex-direction: column; \n';
            text += '   justify-content: center; \n';
            text += '   flex: 0 0 auto; \n';
            text += '} \n';
            text += '#'+widgetID + ' .broadcasts-container {\n';
            text += '   overflow: hidden; \n';
            text += '   overflow-x: scroll; \n';
            text += '   cursor: grab; \n';
            text += '} \n';
            text += '#'+widgetID + ' .channels-container {\n';
            text += '   xoverflow: hidden; \n';
            text += '} \n';
            text += '#'+widgetID + ' .broadcastlists {\n';
            text += '   width: 6720px; \n';
            text += '   left: 0px; \n';
            text += '   position: relative; \n';
            text += '   list-style: none; \n';
            text += '   margin: 0; \n';
            text += '   padding: 0; \n';
            text += '   height: 100%; \n';
            text += '} \n';
            text += '#'+widgetID + ' .broadcastlists .header {\n';
            text += '   width: 100%; \n';
            text += '   position: relative; \n';
            text += '} \n';
            text += '#'+widgetID + ' .channellists {\n';
            text += '   width: 35px; \n';
            text += '   left: 0px; \n';
            text += '   position: relative; \n';
            text += '   list-style: none; \n';
            text += '   margin: 0; \n';
            text += '   padding: 0; \n';
            text += '} \n';
            text += '#'+widgetID + ' .channellists .header {\n';
            text += '   width: 100%; \n';
            text += '   position: relative; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channels ul li {\n';
            text += '   overflow: hidden; \n';
            text += '   display: flex; \n';
            text += '   height: 48px; \n';
            text += '   justify-content: center; \n';
            text += '   align-items: center; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channel-logo {\n';
            text += '   width: 33px; \n';
            text += '   height: 33px; \n';
            text += '   background-size: 33px auto; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastsublist .listitem li {\n';
            text += '   float: left; \n';
            text += '   position: absolute; \n';
            text += '   vertical-align: top; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width: 1px 0px 0px 1px; \n';
            text += '   overflow: hidden; \n';
            text += '   white-space: nowrap; \n';
            text += '   text-overflow: ellipsis; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channelsublist .listitem li {\n';
            text += '   float: left; \n';
            text += '   position: absolute; \n';
            text += '   vertical-align: top; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width: 1px 1px 0px 1px; \n';
            text += '   overflow: hidden; \n';
            text += '   white-space: nowrap; \n';
            text += '   text-overflow: ellipsis; \n';
            text += '} \n';
            
            text += '#'+widgetID + ' .broadcastlists .header .listitem li {\n';
            text += '   float: left; \n';
            text += '   vertical-align: middle; \n';
            text += '   width: 140px; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width: 1px 0px 0px 1px; \n';
            text += '   font-weight: 700; \n';
            text += '   font-size: 20px; \n';
            text += '   padding: 5px 5px; \n';         
            text += '} \n';

            text += '#'+widgetID + ' .channellists .header .listitem li {\n';
            text += '   float: left; \n';
            text += '   vertical-align: middle; \n';
            text += '   border: solid #80808033; \n';
            text += '   border-width: 1px 0px 0px 1px; \n';
            text += '   font-weight: 700; \n';
            text += '   font-size: 20px; \n';
            text += '   padding: 5px 5px; \n';         
            text += '} \n';

            text += '#'+widgetID + ' .listitem {\n';
            text += '   float: none; \n';
            text += '   clear: both; \n';
            text += '   height: 25px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastsublist {\n';
            text += '   width: 100%; \n';
            text += '   position: relative; \n';
            text += '   overflow-y: scroll; \n';
            text += '   height: 100%; \n';
            text += '   user-select: none; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channelsublist {\n';
            text += '   width: 100%; \n';
            text += '   position: relative; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcast {\n';
            text += '   height:35px; \n';
            text += '   padding:0px; \n';
            text += '   font-size:12px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .channel {\n';
            text += '   height:35px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .time {\n';
            text += '   height:30px; \n';
            text += '} \n';

            text += '#'+widgetID + ' .broadcastelement {\n';
            text += '   padding:3px; \n';
            text += '} \n';

            text += '#'+widgetID + 'eventdlg .dialogcolumn {\n';
            text += '   float:left; \n';
            text += '} \n';

            text += '#'+widgetID + 'eventdlg .event-container {\n';
            text += '   height:100%; \n';
            text += '} \n';

            text += '#'+widgetID + 'eventdlg .event-container:after {\n';
            text += '   content: ""; \n';
            text += '   display: table; \n';
            text += '   clear: both; \n';
            text += '} \n';

            text += '#'+widgetID + 'eventdlg .event-container * {\n';
            text += '   box-sizing: border-box; \n';
            text += '} \n';

            text += '#'+widgetID + 'eventdlg .event-picture {\n';
            text += '   height:100%; \n';
            text += '   width:50%; \n';
            text += '   padding:5px; \n';
            text += '} \n';

            text += '#'+widgetID + 'eventdlg .event-picture img {\n';
            text += '   width:auto; \n';
            text += '   height:100%; \n';
            text += '   display:block; \n';
            text += '   margin:auto; \n';
            text += '} \n';
            
            text += '#'+widgetID + 'eventdlg .event-picture {\n';
            text += '   height:100%; \n';
            text += '   width:50%; \n';
            text += '   padding:5px; \n';
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

            text += '</style> \n';            

            text += '<div class="tv-container">';               //program-block usholder
            text += '  <div class="channels-container">';                 //program-channel
            text += '    <ul class="channellists">';          //program-info-list slidercontent
            text += '      <li class="header">';                //title top
            text += '        <ul class="listitem time">';
            text += '          <li class="time" style="display: flex;" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time.onclickChannel(this)">';

            text += '            <svg width="100%" height="100%" viewBox="0 0 25 25">';
            text += '              <rect width="25" height="5" fill="white" y="0"></rect>';
            text += '              <rect y="10" width="25" height="5" fill="white"></rect>';
            text += '              <rect y="20" width="25" height="5" fill="white"></rect>';
            text += '            </svg>';

            text += '          </li>';
            
            
            text += '        </ul>';
            text += '      </li>';

            text += '      <li class="channelsublist">';      //uslisting
            text += this.getChannels(this.filterChannels(channels,channelfilter)).join("\n"); 
            text += '      </li>';
            text += '    </ul>';


            text += '  </div>';
            text += '  <div class="broadcasts-container">';     //program-info uslisting sliderholder
            text += '    <ul class="broadcastlists">';          //program-info-list slidercontent
            text += '      <li class="header">';                //title top
            text += '        <ul class="listitem time">';
            text += this.getTimetable().join("\n"); 
            text += '        </ul>';
            text += '      </li>';

            text += '      <li class="broadcastsublist">';      //uslisting
            var events = this.getEvents(this.tvprogram,channelfilter);
            channelfilter.map(el=>{
                text += '        <ul class="listitem broadcast">';            //channel-list
                text += this.getBroadcasts4Channel(events,el,widgetID).join("\n"); 
                text += '        </ul>';
            });
            text += '      </li>';
            text += '    </ul>';
            text += '  </div>';
            text += '</div>';
            
            text += '<div class="dialog" id="'+widgetID+'eventdlg"></div>';
            text += '<div data-dp="'+tvprogram_oid+'" id="'+widgetID+'channeldlg"></div>';
            $('#' + widgetID).html(text);
            var scrollContent = $(".broadcastlists");
            var scrollPane = $(".broadcasts-container");
            $( '#'+widgetID + ' .slider' ).slider({
                slide: function(event, ui) {
                    if (scrollContent.width() > scrollPane.width()) {
                        scrollContent.css("margin-left", Math.round(
                        ui.value / 100 * (scrollPane.width() - scrollContent.width())) + "px");
                    } else {
                        scrollContent.css("margin-left", 0);
                    }
                }
            });
            $( "#"+widgetID+"eventdlg" ).dialog({
                autoOpen: false,
                position: { of: $("#"+widgetID) },
                width: $("#"+widgetID).width()*0.9,
                height: $("#"+widgetID).height()*0.9,
                dialogClass: 'no-titlebar '+widgetID
            });
            $( "#"+widgetID+"channeldlg" ).dialog({
                autoOpen: false,
                position: { of: $("#"+widgetID) },
                width: $("#"+widgetID).width()*0.9,
                height: $("#"+widgetID).height()*0.9,
                dialogClass: 'no-titlebar '+widgetID
            });
            $( "#"+widgetID+"eventdlg" ).click(function(){
                $( "#"+widgetID+"eventdlg" ).dialog("close");
            });
            $('.broadcasts-container').on('scroll', function () {
                $('.channels-container').scrollTop($(this).scrollTop());
            });
            var scrollcontainer = $('.broadcasts-container')[0];
            let pos = { top: 0, left: 0, x: 0, y: 0 };
            function mouseDownHandler(e) {
                scrollcontainer.style.cursor = 'grabbing';
                scrollcontainer.style.userSelect = 'none';

                pos = {
                    left: scrollcontainer.scrollLeft,
                    top: scrollcontainer.scrollTop,
                    // Get the current mouse position
                    x: e.clientX,
                    y: e.clientY,
                };

                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            }
            function mouseMoveHandler(e) {
                // How far the mouse has been moved
                const dx = e.clientX - pos.x;
                const dy = e.clientY - pos.y;

                // Scroll the element
                scrollcontainer.scrollTop = pos.top - dy;
                scrollcontainer.scrollLeft = pos.left - dx;
            }
            function mouseUpHandler (e) {
                scrollcontainer.style.cursor = 'grab';
                scrollcontainer.style.removeProperty('user-select');

                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }
            scrollcontainer.addEventListener('mousedown', mouseDownHandler);
            
            
        },
        onChange: function(widgetID, view, data, style,e, newVal, oldVal) {
            console.log("changed "+e.type );
            this.createWidget(widgetID, view, data, style);
        },
        getDate: function(d,add) {
            var d1=new Date(d);
            d1.setDate(d1.getDate() + add);
            return d1.getFullYear()+"-"+('0' + (d1.getMonth()+1)).slice(-2) + '-' + ('0' + (d1.getDate())).slice(-2)
        },
        getTimetable: function() {
            var tt=[];
            for(var i=0;i<24;i++) {
                tt.push('<li class="time">'+("0"+i).slice(-2)+":00</li>");
                tt.push('<li class="time">'+("0"+i).slice(-2)+":30</li>");
            }
            return [].concat(tt.slice(10),tt.slice(0,10));
        },
        getChannels: function(channels,filter=[]) {
            var cc=[];
            //channels.sort((a, b) => a.order - b.order).map( el=> {
            channels.sort((a, b) => (a.order+(filter.indexOf(a.id)==-1)*100000) - (b.order+(filter.indexOf(b.id)==-1)*100000)).map( el=> {
                var selected=(filter.findIndex(el1=>el1==el.id)>-1) ? " selected":"";
                cc.push('<ul class="listitem channel" data-order="'+el.order+'" data-id="'+el.id+'"'+selected+'><li class="channel"><img width="100%" height="100%" src="https://tvfueralle.de/channel-logos/'+el.channelId+'.png" alt="" class="channel-logo"></li></ul>');
            });
            return cc;
        },
        filterChannels: function(channels,filter) {
            return channels.filter(el=>filter.indexOf(el.id)>-1);
        },
        getEvents: function(tvprogram,filter) {
            var tv=[];
            tvprogram.events.map(el=>{
                if (filter.indexOf(el.channel)>-1) {
                    if (!tv[el.channel]) tv[el.channel]=[];
                    tv[el.channel].push(el);
                }
            });
            return tv;
        },
        getBroadcasts4Channel: function(events,channel,widgetID) {
            var wItem=140;//2 border, 4 padding
            var wBorder=2;
            var wPadding=0;
            var tItem=30;
            var min=1*60*1000;
            var sTime=new Date(events[channel][0].airDate);
            sTime.setHours(5);
            sTime.setMinutes(0);
            var eTime=new Date(sTime);
            eTime.setDate(eTime.getDate()+1);
            

            var aa=[];
            for (var i=0;i<events[channel].length;i++) {
                var event = events[channel][i];
                var startTime= new Date(event.startTime);
                var endTime= new Date(event.endTime);
                if (startTime>=eTime) continue;
                if (i==0 && startTime > sTime) aa.push('<li class="broadcast" style="left:0px; width:'+   ((Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10))+'px;"></li>');
                if (endTime>eTime) endTime=eTime;
                var text="";
                text+='<li class="broadcast" style="';
                text+='left:'+   (Math.floor((startTime-sTime)/60000/tItem*wItem*10)/10)+'px;';
                text+='width:'+   ((Math.floor((endTime-startTime)/60000/tItem*wItem*10)/10))+'px;">';
                text+='<div class="broadcastelement" data-widgetid="'+widgetID+'" data-eventid="'+event.id+'" onclick="vis.binds.tvprogram.time.onclickEvent(this)">';
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
        onclickChannelSave: function(el,save) {
            var widgetID = el.dataset.widgetid||0;
            if (save) {
                var tvprogram_oid = el.dataset.dp;
                var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
                if (!config[widgetID]) config[widgetID]={};
                if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
                config[widgetID]['channelfilter'] = $(".chselect-container .channel[selected]").toArray().map(el=>parseInt(el.dataset.id));
                vis.setValue(tvprogram_oid+".config",JSON.stringify(config));
            }
            $( "#"+widgetID+"channeldlg" ).dialog( "close" );
        },
        onclickChannel: function(el) {
            var widgetID = el.dataset.widgetid||0;
            var tvprogram_oid = $( "#"+widgetID+"channeldlg" )[0].dataset.dp;            
            var channels = this.channels;
            var config = JSON.parse(vis.states.attr(tvprogram_oid+".config.val")||"{}");
            if (!config[widgetID]) config[widgetID]={};
            if (!config[widgetID]['channelfilter']) config[widgetID]['channelfilter']=[];
            var channelfilter = config[widgetID].channelfilter;
            if (channelfilter.length==0) channelfilter = channels.filter((el,i)=>i<4);
            var text="";
            text += '  <div class="chselect-container">';
            text += '    <ul class="listitem channel" data-dp="'+tvprogram_oid+'" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time.onclickChannelSave(this,true)" ><li class="channel"><svg class="MuiSvgIcon-root jss160" focusable="false" viewBox="0 0 24 24" aria-hidden="true" tabindex="-1" title="Check" data-ga-event-category="material-icons" data-ga-event-action="click" data-ga-event-label="Check"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg></li></ul>';
            text += '    <ul class="listitem channel" data-widgetid="'+widgetID+'" onclick="vis.binds.tvprogram.time.onclickChannelSave(this,false)"><li class="channel"><svg class="MuiSvgIcon-root jss160" focusable="false" viewBox="0 0 24 24" aria-hidden="true" tabindex="-1" title="Clear" data-ga-event-category="material-icons" data-ga-event-action="click" data-ga-event-label="Clear"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></li></ul>';
            text += '  </div>';

            text += '  <div class="chselect-container sortable">';
            text += this.getChannels(channels,channelfilter).join("\n"); 
            text += '  </div>';
            $( "#"+widgetID+"channeldlg" ).html(text);
            $(".chselect-container ul.channel").click(function() {
                var a =0;
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
              items: "ul.channel[selected]"
            });
            $( "#"+widgetID+"channeldlg" ).dialog( "open" );
        },
        onclickEvent: function(el) {
            var eventid = el.dataset.eventid||0;
            var widgetID = el.dataset.widgetid||0;
            if (eventid ==0||widgetID==0) return;
            var event = this.tvprogram.events.find(el=>el.id==eventid);
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
            var content=(event.content.texts.Long) ? event.content.texts.Long.value:(event.content.texts.VeryShort)?event.content.texts.VeryShort.value:"";
            var photourl=(event.photo) ? "https://tvfueralle.de" + event.photo.url : "https://tvfueralle.de/tv-logo-no-image.svg";
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
            $( "#"+widgetID+"eventdlg" ).html(text);
            $( "#"+widgetID+"eventdlg" ).dialog( "open" );

        }
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
    createWidget: function (widgetID, view, data, style) {
        var $div = $("#" + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["tvprogram"].createWidget(widgetID, view, data, style);
            }, 100);
        }

        var text = "";
        text += "OID: " + data.oid + "</div><br>";
        text += 'OID value: <span class="tvprogram-value">' + vis.states[data.oid + ".val"] + "</span><br>";
        text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + "</span><br>";
        text += "extraAttr: " + data.extraAttr + "<br>";
        text += "Browser instance: " + vis.instance + "<br>";
        text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || "") + "</textarea><br>";

        $("#" + widgetID).html(text);

        // subscribe on updates of value
        function onChange(e, newVal, oldVal) {
            $div.find(".template-value").html(newVal);
        }
        if (data.oid) {
            vis.states.bind(data.oid + ".val", onChange);
            //remember bound state that vis can release if didnt needed
            $div.data("bound", [data.oid + ".val"]);
            //remember onchange handler to release bound states
            $div.data("bindHandler", onChange);
        }
    }
};

vis.binds["tvprogram"].showVersion();