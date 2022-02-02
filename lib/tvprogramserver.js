
const http  = require("https");
const utils = require("@iobroker/adapter-core");
const fs    = require("fs");

function tvprogramclass(adapter) {

    const api_channels       = "https://tvfueralle.de/api/channels";
    const api_categories     = "https://tvfueralle.de/api/categories";
    const api_genres         = "https://tvfueralle.de/api/genres";
    const api_program        = "https://tvfueralle.de/api/broadcasts/%DATE%";

    const dataDir           = utils.getAbsoluteDefaultDataDir()+adapter.name+"/";

    this.stateTemplate = {
        "selectchannel": {
            name:   "selectchannel",
            read:   true,
            write:  true,
            type:   "string",
            role:   "value"
        },
        "name": {
            name:   "name",
            read:   true,
            write:  true,
            type:   "string",
            role:   "value"
        },
        "config": {
            name:   "config",
            read:   true,
            write:  false,
            type:   "string",
            role:   "value"
        },
        "favorites": {
            name:   "favorites",
            read:   true,
            write:  false,
            type:   "string",
            role:   "value"
        },
        "channelfilter": {
            name:   "channelfilter",
            read:   true,
            write:  false,
            type:   "string",
            role:   "value"
        },
        "show": {
            name:   "show",
            read:   true,
            write:  false,
            type:   "string",
            role:   "value"
        },
        "cmd": {
            name:   "cmd",
            read:   true,
            write:  false,
            type:   "string",
            role:   "value"
        },
        "record": {
            name:   "record",
            read:   true,
            write:  true,
            type:   "string",
            role:   "value"
        }
    };

    this.adapter = adapter;
    this.log = {};
    this.logsilly = true;
    this.logdebug = true;
    this.observers = [];
    this.tvdata = {};
    this.tvdata.program = {};

    this.init = function() {
        this.setState("connection", true, "info");
        this.checkFilesystem();
        this.doObserver();
    };
    this.doObserver = function() {
        this.log.silly("doObserver");
        this.getTVDatapoints((tvs)=>this.newTVDatapoints(tvs,this.getData.bind(this)));
        this.setTimeout("doObserver",this.doObserver.bind(this),60*60*1000);
    };
    this.removeFiles = function() {
        fs.readdir(dataDir+"program/", (err, files) => {
            files.forEach(file => {
                if ((new Date() - new Date(file.split(".")[0]))/(1000 * 60 * 60 * 24)>5) fs.unlinkSync(dataDir+"program/"+file);
            });
        });
    };
    this.checkFilesystem = function() {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        if (!fs.existsSync(dataDir+"program/")) {
            fs.mkdirSync(dataDir+"program/");
        }
    };

    this.processMessages = function(msg) {
        this.log.debug("processMessages " + JSON.stringify(msg));
        if (msg.command === "getServerData") {
            this.log.debug("send getServerData");
            this.getServerDataMsg(msg);
        }
        if (msg.command === "getServerTVProgram") {
            this.log.debug("send getServerData");
            this.getServerTVProgramMsg(msg);
        }
        if (msg.command === "getServerBroadcast") {
            this.log.debug("send getServerBroadcast");
            this.getServerBroadcastMsg(msg);
        }
        if (msg.command === "getServerTest") {
            this.log.debug("send getServerTest");
            this.getServerTestMsg(msg);
        }
        if (msg.command === "getFavoritesDatax") {
            this.log.debug("send getFavoritesData");
            this.getFavoritesDataMsg(msg);
        }
        if (msg.command === "getServerBroadcastNow") {
            this.log.debug("send getServerBroadcastNow");
            this.getServerBroadcastNowMsg(msg);
        }
        if (msg.command === "getServerBroadcastDate") {
            this.log.debug("send getServerBroadcastDate");
            this.getServerBroadcastDateMsg(msg);
        }
        if (msg.command === "getServerBroadcastFind") {
            this.log.debug("send getServerBroadcastFind");
            this.getServerBroadcastFindMsg(msg);
        }
        if (msg.command === "getServerTVs") {
            this.log.debug("send getServerTVs");
            this.getServerTVsMsg(msg);
        }
        if (msg.command === "getServerInfo") {
            this.log.debug("send getServerInfo");
            this.getServerInfoMsg(msg);
        }
        if (msg.command === "setValueAck") {
            this.log.debug("send setValueAck");
            this.setValueAckMsg(msg);
        }
    };
    this.doStateChange = function(id,state) {
        this.log.silly("doStateChange");
        // Warning, state can be null if it was deleted
        if (!id || !state  ) {
            return;
        }
        const idParts = id.split(".");
        idParts.shift();
        idParts.shift();
        if ( state.ack && idParts[1] === "cmd") {
            if (idParts[1] === "cmd" )           this.doStateChangeCmd(idParts,state);
        } else {
            return;
        }
        if (idParts[1] === "selectchannel" ) this.doStateChangeSelectChannel(idParts,state);
        if (idParts[1] === "name" )          this.doStateChangeName(idParts,state);
        if (idParts[1] === "config" )        this.doStateChangeConfig(idParts,state);
        if (idParts[1] === "favorites" )     this.doStateChangeFavorites(idParts,state);
        if (idParts[1] === "channelfilter" ) this.doStateChangeChannelfilter(idParts,state);
        if (idParts[1] === "show" )          this.doStateChangeShow(idParts,state);
        if (idParts[1] === "record" )        this.doStateChangeRecord(idParts,state);
    };
    this.doStateChangeName = function(idParts,state) {
        this.log.debug("doStateChangeName");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val || "",idParts[0]);
        }
    };
    this.doStateChangeConfig = function(idParts,state) {
        this.log.debug("doStateChangeConfig");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val || "",idParts[0]);
        }
    };
    this.doStateChangeFavorites = function(idParts,state) {
        this.log.debug("doStateChangeFavorites");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val || "[]",idParts[0]);
        }
    };
    this.doStateChangeChannelfilter = function(idParts,state) {
        this.log.debug("doStateChangeChannelfilter");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val || "[]",idParts[0]);
        }
    };
    this.doStateChangeShow = function(idParts,state) {
        this.log.debug("doStateChangeShow");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val || "1",idParts[0]);
        }
    };
    this.doStateChangeSelectChannel = function(idParts,state) {
        this.log.debug("doStateChangeSelectChannel");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val || "",idParts[0]);
        }
    };
    this.doStateChangeCmd = function(idParts,state) {
        this.log.debug("doStateChangeCmd");
        if (typeof state.val === "string" && state.val!=="") {
            this.setState(idParts[1],"",idParts[0]);
        }
    };
    this.doStateChangeRecord = function(idParts,state) {
        this.log.debug("doStateChangeRecord");
        if (typeof state.val === "string") {
            this.setState(idParts[1],state.val,idParts[0]);
        }
    };
    this.getServerDataMsg = function(msg) {
        this.log.silly("getServerDataMsg ");
        let data="error1";
        if (typeof msg.message==="string" && msg.message!=="") {
            if (this.tvdata[msg.message]) {
                data = this.tvdata[msg.message];
            } else {
                data="nodata";
            }
        }
        this.log.debug("getServerDataMsg send" + msg.from+" "+msg.command+" "+JSON.stringify(data).substring(0,100)+" "+msg.callback);
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerTVProgramMsg = function(msg) {
        this.log.silly("getServerTVProgramMsg ");
        let data="error";
        if (typeof msg.message==="string" && msg.message!=="") {
            const datum = msg.message;
            if (this.tvdata["program"][datum]) {
                data = JSON.parse(JSON.stringify(this.tvdata["program"][datum]));
                data = this.shrinkTVProgramNoText(data);
            } else {
                data="nodata";
            }
        }
        this.log.debug("getServerDataMsg send" + msg.from+" "+msg.command+" "+JSON.stringify(data).substring(0,100)+" "+msg.callback);
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerTVsMsg = function(msg) {
        this.log.silly("getServerTVsMsg ");
        const data="error";
        /*
        if (typeof msg.message==="object") {
            this.adapter.getForeignObjects
        }
*/
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerBroadcastNowMsg = function(msg) {
        this.log.silly("getServerBroadcastNowMsg ");
        let data=[];
        if (typeof msg.message==="object") {
            const channelfilter = msg.message;
            const dstart = new Date();
            const dend = new Date();
            dstart.setDate(dstart.getDate()-1);
            dend.setDate(dend.getDate()+1);
            while(dstart <= dend){
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {

                    data = data.concat(this.tvdata.program[datum].reduce((acc,el)=>{
                        let i;
                        if ( (i=channelfilter.indexOf(el.channel))>-1 && new Date(el.startTime)<=new Date() && new Date(el.endTime)>new Date() ) {
                            if (!acc[i]) acc[i]={};
                            if (!acc[i].events) acc[i].events=[];
                            acc[i].channel=el.channel;
                            acc[i].events.push(el);
                        }
                        return acc;
                    },[]));
                }
                dstart.setDate(dstart.getDate() + 1);
            }
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerBroadcastFindMsg = function(msg) {
        this.log.silly("getServerBroadcastFindMsg ");
        let data=[];
        if (typeof msg.message==="object") {
            const channelfilter = msg.message.channelfilter||[];
            const categoryfilter = msg.message.categoryfilter||[];
            let textfilter = msg.message.textfilter||"";
            textfilter = textfilter.trim().toLowerCase();
            const dstart = new Date(msg.message.datefrom);
            const dend = new Date(msg.message.datetill);
            const dstartfind = new Date(msg.message.datefrom);
            const dendfind = new Date(msg.message.datetill);
            const maxresults = msg.message.maxresults||10;
            dstart.setDate(dstart.getDate()-1);
            dend.setDate(dend.getDate()+1);
            while(dstart <= dend){
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {

                    data = data.concat(this.tvdata.program[datum].reduce((acc,el)=>{
                        let i,count=0;
                        if (    (i=channelfilter.indexOf(el.channel))>-1 &&
                                new Date(el.startTime)>=dstartfind &&
                                new Date(el.endTime)<=dendfind &&
                                ((categoryfilter.length===0) || categoryfilter.includes(el.content.category)) &&
                                ((textfilter==="")?true:(el.title + el.content.texts.Long.value||"" + el.content.texts.VeryShort.value || "").toLowerCase().includes(textfilter))
                        ) {
                            if (count<maxresults) {
                                if (!acc[i]) acc[i]={};
                                if (!acc[i].events) acc[i].events=[];
                                acc[i].channel=el.channel;
                                acc[i].events.push(el);
                                count++;
                            }
                        }
                        return acc;
                    },[]));
                }
                dstart.setDate(dstart.getDate() + 1);
            }
            data =data.filter((el)=>el!=null);
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerBroadcastDateMsg = function(msg) {
        this.log.silly("getServerBroadcastDateMsg ");
        const data="error";
        if (typeof msg.message==="object") {
            const channelfilter = msg.message.channelfilter;
            const date = new Date(msg.message.date);
            const dstart = new Date(date);
            const dend = new Date(date);
            dstart.setDate(dstart.getDate()-1);
            dend.setDate(dend.getDate()+1);
            while(dstart <= dend){
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    this.tvdata.program[datum].forEach((el)=>{
                        const data=[];
                        let i;
                        if ( (i=channelfilter.indexOf(el.channel))>-1 && new Date(el.startTime)<=date && new Date(el.endTime)>date ) {
                            if (!data[i]) data[i]={};
                            if (!data[i].events) data[i].events=[];
                            data[i].channel=el.channel;
                            data[i].events.push(el);
                        }
                    });
                }
                dstart.setDate(dstart.getDate() + 1);
            }
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getFavoritesDataMsg = function(msg) {
        this.log.silly("getFavoritesDataMsg ");
        let data="error";
        if (typeof msg.message==="object") {
            const favorites = msg.message;
            let result = [];
            const dstart = new Date();
            const dend = new Date();
            const channels = this.tvdata.channels;
            dend.setDate(dend.getDate()+5);
            while(dstart <= dend){
                const datum = this.formatedDate(this.calcDate(dstart));
                if (this.tvdata.program[datum]) {
                    result=result.concat(
                        this.tvdata.program[datum].filter(
                            (el)=> favorites.includes(el.title)
                        ).map(
                            function(channels,el) {
                                const channel= channels.find(ch=>ch.id===el.channel);
                                el.viewdate=datum;
                                el.channelid = channel.channelId||"";
                                el.channelname = channel.name||"";
                                return el;
                            }.bind(this,channels)
                        )
                    );
                }
                dstart.setDate(dstart.getDate() + 1);
            }
            data=result.sort((a,b)=> new Date(a.startTime) - new Date(b.startTime));
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerTestMsg = function(msg) {
        this.log.silly("getServerTestMsg ");
        let data="error";
        let events;
        if (typeof msg.message==="object") {
            if (this.tvdata["program"][msg.message.viewdate]) events = this.tvdata["program"][msg.message.viewdate];
            if (events) data=events.find(el=>el.id===msg.message.eventid);
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.setValueAckMsg = function(msg) {
        this.log.silly("setValueAckMsg ");
        const data={};
        if (typeof msg.message==="object") {
            const id = msg.message.id;
            const value = msg.message.value;
            this.setState(id,value);
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerInfoMsg = function(msg) {
        this.log.silly("getServerInfoMsg ");
        const data={};
        data.tvprogram = Object.keys(this.tvdata["program"]).sort();
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getServerBroadcastMsg = function(msg) {
        this.log.silly("getServerBroadcastMsg ");
        let data="error";
        let events;
        if (typeof msg.message==="object") {
            msg.message.eventid=parseInt(msg.message.eventid);
            if (this.tvdata["program"][msg.message.viewdate]) events = this.tvdata["program"][msg.message.viewdate];
            if (events) data=events.find(el=>el.id===msg.message.eventid);
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    };
    this.getTVDatapoints = function(callback) {
        this.log.silly("getTVDatapoints ");
        const id = this.adapter.namespace;
        const options = {startkey: id + ".", endkey: id + ".\u9999", include_docs: true};
        this.adapter.getObjectView("system","state",options).then( (objects) => {
            const _objects = {};
            if (objects && objects.rows) {
                for (let i = 0; i < objects.rows.length; i++) {
                    _objects[objects.rows[i].id] = objects.rows[i].value;
                }
            }
            objects=_objects;
            const tvs=[];
            for (const prop in objects) {
                if (prop.split(".")[3]==="config") tvs.push(prop.split(".")[2]);
            }
            tvs.sort();
            callback(tvs);
        });
    };
    this.newTVDatapoints = function(tvs,callback) {
        this.log.silly("newTVDatapoints ");
        const promises=[];
        if (this.adapter.config.tvcount !== tvs.length) {
            for (let i=1;tvs.length<this.adapter.config.tvcount;i++) {
                if (!tvs.includes("tv"+i)) {
                    promises.push(
                        new Promise((resolve)=> this.createDatapointsPath("tv"+i,resolve)
                        ));
                    tvs.push("tv"+i);
                }
            }
        }
        Promise.all(promises).then(() => {
            if (callback) callback(tvs);
        });
    };
    this.shrinkTVProgramWithText = function(tvprogram) {
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
                    texts: {
                        VeryShort: {
                            value: valuevs=undefined
                        } = {},
                        Long: {
                            value: valuel =undefined
                        } = {}
                    }
                },
                photo: {
                    url=undefined,
                } = {}
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
                            value: valuevs
                        },
                        Long: {
                            value: valuel
                        }
                    }
                },
                photo: {
                    url: url,
                }
            }))(el);
        });
        return tvprogram;

    };
    this.shrinkTVProgramNoText = function(tvprogram) {
        tvprogram.forEach((el, index) => {
            tvprogram[index] = (({
                id,
                channel,
                title,
                startTime,
                endTime,
                airDate,
                photo: {
                    url=undefined,
                } = {}
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
    this.createDatapointsPath = function(path=null,callback) {
        const pName = new Promise((resolve)=>{
            const stateTemplatename = JSON.parse(JSON.stringify(this.stateTemplate["name"]));
            this.createObjectNotExist(stateTemplatename,path,null,function(resolve){
                this.setState(stateTemplatename.name,path,path);
                resolve();
            }.bind(this,resolve));
        });
        const pConfig = new Promise((resolve)=>{
            const stateTemplateconfig = JSON.parse(JSON.stringify(this.stateTemplate["config"]));
            this.createObjectNotExist(stateTemplateconfig,path,null,function(resolve){
                this.setState(stateTemplateconfig.name,"{}",path);
                resolve();
            }.bind(this,resolve));
        });
        const pFavorites = new Promise((resolve)=>{
            const stateTemplatefavorites = JSON.parse(JSON.stringify(this.stateTemplate["favorites"]));
            this.createObjectNotExist(stateTemplatefavorites,path,null,function(resolve){
                this.setState(stateTemplatefavorites.name,"[]",path);
                resolve();
            }.bind(this,resolve));
        });
        const pChannelfilter = new Promise((resolve)=>{
            const stateTemplatechannelfilter = JSON.parse(JSON.stringify(this.stateTemplate["channelfilter"]));
            this.createObjectNotExist(stateTemplatechannelfilter,path,null,function(resolve){
                this.setState(stateTemplatechannelfilter.name,"[]",path);
                resolve();
            }.bind(this,resolve));
        });
        const pShow = new Promise((resolve)=>{
            const stateTemplateshow = JSON.parse(JSON.stringify(this.stateTemplate["show"]));
            this.createObjectNotExist(stateTemplateshow,path,null,function(resolve){
                this.setState(stateTemplateshow.name,"1",path);
                resolve();
            }.bind(this,resolve));
        });
        const pChannel = new Promise((resolve)=>{
            const stateTemplateselch = JSON.parse(JSON.stringify(this.stateTemplate["selectchannel"]));
            this.createObjectNotExist(stateTemplateselch,path,null,function(resolve){
                this.setState(stateTemplateselch.name,"",path);
                resolve();
            }.bind(this,resolve));
        });
        const pCmd = new Promise((resolve)=>{
            const stateTemplateselcmd = JSON.parse(JSON.stringify(this.stateTemplate["cmd"]));
            this.createObjectNotExist(stateTemplateselcmd,path,null,function(resolve){
                this.setState(stateTemplateselcmd.name,"",path);
                resolve();
            }.bind(this,resolve));
        });
        const pRecord = new Promise((resolve)=>{
            const stateTemplateselrecord = JSON.parse(JSON.stringify(this.stateTemplate["record"]));
            this.createObjectNotExist(stateTemplateselrecord,path,null,function(resolve){
                this.setState(stateTemplateselrecord.name,"",path);
                resolve();
            }.bind(this,resolve));
        });
        Promise.all([pName, pConfig, pFavorites, pChannelfilter, pShow, pChannel, pCmd, pRecord]).then(() => {
            if (callback) callback();
        });
    };
    this.getData = function(tvs) {
        this.log.silly("getData");
        this.getCategories((data) => {
            if (data==="error") {
                data = this.readFileSync("categories.json");
                if (data==="error") data={category:[]};
            }
            if (JSON.stringify(this.tvdata.categories) !== JSON.stringify(data.category)) {
                this.log.debug("getData first request or changed data categories");
                this.writeFile("categories.json",data.category);
                this.tvdata.categories=data.category;
                tvs.map((tv)=> this.setState("cmd","new|categories",tv));
            }
        });
        this.getChannels((data)=>{
            if (data==="error") {
                data = this.readFileSync("channels.json");
                if (data==="error") data={channels:[]};
            }
            if (JSON.stringify(this.tvdata.channels) !== JSON.stringify(data.channels)) {
                this.log.debug("getData first request or changed data channels");
                this.writeFile("channels.json",data.channels);
                this.tvdata.channels=data.channels;
                tvs.map((tv)=> this.setState("cmd","new|channels",tv));
            }
        });
        this.getGenres((data)=>{
            if (data==="error") {
                data = this.readFileSync("genres.json");
                if (data==="error") data={genres:[]};
            }
            if (JSON.stringify(this.tvdata.genres) !== JSON.stringify(data.genres)) {
                this.log.debug("getData first request or changed data genres");
                this.writeFile("genres.json",data.genres);
                this.tvdata.genres=data.genres;
                tvs.map((tv)=> this.setState("cmd","new|genres",tv));
            }
        });

        let dstart = new Date();
        let dend = new Date();
        dend.setDate(dend.getDate()+5);
        while(dstart <= dend){
            this.getProgram(dstart,function(datum,data){
                if (data==="error") {
                    data = this.readFileSync("program/"+datum+".json");
                    if (data==="error") data={events:[]};
                }
                data.events = this.shrinkTVProgramWithText(data.events);
                if (JSON.stringify(this.tvdata.program[datum]) !== JSON.stringify(data.events)) {
                    this.log.debug("getData first request or changed data events " + datum);
                    this.writeFile("program/"+datum+".json",data);
                    this.tvdata.program[datum]=data.events;
                    tvs.map((tv)=> this.setState("cmd","new|program|"+datum,tv));
                }
            }.bind(this,this.formatedDate(dstart)));
            dstart.setDate(dstart.getDate() + 1);
        }
        dstart = new Date();
        dstart.setDate(dstart.getDate() - 1);
        dend = new Date();
        dend.setDate(dend.getDate()-5);

        while(dstart >= dend){
            const data = this.readFileSync("program/"+this.formatedDate(dstart)+".json");
            if (data==="error") {
                dstart.setDate(dstart.getDate() - 1);
                continue;
            }
            this.tvdata.program[this.formatedDate(dstart)]=data.events;
            dstart.setDate(dstart.getDate() - 1);
        }
        this.removeFiles();
    };
    this.getProgram = function(datum,callback) {
        this.log.silly("getProgram");
        if (!(datum && datum.getUTCDate())) return "";
        const options = {
            "%DATE%": this.formatedDate(datum),
        };
        return this.request(this.getUrlFromTemplate(options,api_program),callback);
    };
    this.formatedDate = function(datum) {
        return datum.getFullYear()+"-"+("0" + (datum.getMonth()+1)).slice(-2) + "-" + ("0" + (datum.getDate())).slice(-2);
    };
    this.calcDate = function(datum) {
        const d = new Date(datum);
        const time = d.getHours()+d.getMinutes()/60;
        if (time>=0 && time <5) d.setDate(d.getDate()-1);
        return d;
    };
    this.getCategories = function(callback) {
        this.log.silly("getCategories");
        return this.request(api_categories,callback);
    };
    this.getChannels = function(callback) {
        this.log.silly("getChannels");
        return this.request(api_channels,callback);
    };
    this.getGenres = function(callback) {
        this.log.silly("getData");
        return this.request(api_genres,callback);
    };
    this.getUrlFromTemplate = function(options,urltemplate) {
        return urltemplate.replace(/%\w+%/g, function(option) {
            return options[option] || option;
        });
    };
    this.request = function(url,callback) {
        this.log.debug("request url " + url);
        http.get(url, (res) => {
            const {
                statusCode
            } = res;
            const contentType = res.headers["content-type"];

            let error;
            if (statusCode !== 200) {
                error = new Error("Request Failed.\n" +
                        `Status Code: ${statusCode} ` + res.connection.servername + res.req.path);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error("Invalid content-type.\n" +
                        `Expected application/json but received ${contentType} ` + res.connection.servername + res.req.path);
            }
            if (error) {
                this.log.error(error.message);
                res.resume();
                callback("error");
                return;
            }

            res.setEncoding("utf8");
            let rawData = "";
            res.on("data", (chunk) => {
                rawData += chunk;
            });
            res.on("end", () => {
                try {
                    this.log.silly("request rawData");
                    const parsedData = JSON.parse(rawData);
                    callback(parsedData);
                } catch (e) {
                    this.log.error(e.message);
                }
            });
        }).on("error", (e) => {
            switch (e.code) {
                case "ECONNRESET":
                    this.log.error("Server didnt Respond: " + e.hostname + " Please try again later. " + e.message);
                    break;
                case "ENOTFOUND":
                    this.log.error("Address not found: " + e.hostname + " " + e.message);
                    break;
                default:
                    this.log.error(e.message);
                    break;
            }
            callback("error");
        });
    };
    this.createObject = function(stateTemplate,level1path=false,level2path=false,callback=false) {
        this.log.debug("createObject " + stateTemplate.name);
        const name = (level1path ? level1path + "." : "") + (level2path ? level2path + "." : "") + stateTemplate.name;
        this.adapter.getObject(name, (err, obj) => {
            const newobj = {
                type: "state",
                common: stateTemplate,
                native: {}
            };
            if (!obj) {
                (callback) ? this.adapter.setObject(name,newobj,callback) : this.adapter.setObject(name,newobj);
            } else {
                if (callback) callback();
            }
        });
    };
    this.createObjectNotExist = function(stateTemplate,level1path=false,level2path=false,callback=false) {
        this.log.debug("createObjectNotExist " + stateTemplate.name);
        const name = (level1path ? level1path + "." : "") + (level2path ? level2path + "." : "") + stateTemplate.name;
        const newobj = {
            type: "state",
            common: stateTemplate,
            native: {}
        };
        (callback) ? this.adapter.setObjectNotExists(name,newobj,callback) : this.adapter.setObjectNotExists(name,newobj);
    };
    this.getState = function(id, level1path=false,level2path=false,callback) {
        this.log.debug("getState " + id);
        const name = (level1path ? level1path + "." : "") + (level2path ? level2path + "." : "") + id;
        this.adapter.getState(name, callback);
    };
    this.setState = function(name, value,level1path=false,level2path=false,callback=false) {
        this.log.debug("setState " + name);
        name = (level1path ? level1path + "." : "") + (level2path ? level2path + "." : "") + name;
        this.adapter.log.debug("setState name: " + name /*+ ' value: ' + value*/);
        (callback) ? this.adapter.setState(name, value, true, callback) : this.adapter.setState(name, value, true);
    };
    this.setStateNoAck = function(name, value,level1path=false,level2path=false,callback=false) {
        this.log.debug("setState " + name);
        name = (level1path ? level1path + "." : "") + (level2path ? level2path + "." : "") + name;
        this.adapter.log.debug("setState name: " + name /*+ ' value: ' + value*/);
        (callback) ? this.adapter.setState(name, value, false, callback) : this.adapter.setState(name, value, false);
    };
    this.writeFile = function(filename,data,callback=null) {
        if (typeof data != "string") data=JSON.stringify(data);
        fs.writeFile(dataDir+filename, data, (err) => {
            if (err) {
                this.log.debug("Error saving file "+filename+"! " + err.message);
            } else {
                this.log.debug("The file "+filename+" has been saved!");
            }
            if (callback) callback(err);
        });
    };
    this.readFile = function(filename,callback) {
        fs.readFile(dataDir+filename,  (err,data) => {
            if (err) {
                this.log.debug("Error loading file "+filename+"! " + err.message);
                callback("error");
            } else {
                this.log.debug("The file "+filename+" has been loaded!");
                try {
                    callback(JSON.parse(data));
                } catch {
                    callback(data);
                }
            }
        });

    };
    this.readFileSync = function(filename) {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataDir+filename));
        } catch {
            data="error";
        }
        return data;
    };
    this.setTimeout = function(id,callback,time) {
        this.clearTimeout(id);
        this.observers[id]= setTimeout(callback.bind(this),time);
    };
    this.clearTimeout = function(id) {
        if (this.observers[id]) clearTimeout(this.observers[id]);
        delete this.observers[id];
    };
    this.deleteObservers = function() {
        this.log.debug("deleteObservers");
        this.clearTimeout("doObserver");
    };
    this.closeConnections = function() {
        this.log.debug("closeConnections");
        this.deleteObservers();
    };

    this.log.silly = function(s) {
        if (this.logsilly) this.adapter.log.silly(s);
    }.bind(this);
    this.log.debug = function(s) {
        if (this.logdebug) this.adapter.log.debug(s);
    }.bind(this);
    this.log.error = function(s) {
        this.adapter.log.error(s);
    }.bind(this);
    this.log.info = function(s) {
        this.adapter.log.info(s);
    }.bind(this);

    this.init.bind(this)();
}
module.exports = tvprogramclass;

