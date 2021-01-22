
const http  = require('https');
const utils = require('@iobroker/adapter-core');
const fs    = require('fs');

function tvprogramclass(adapter) {
    
    const api_channels       = "https://tvfueralle.de/api/channels";
    const api_categories     = "https://tvfueralle.de/api/categories";
    const api_genres         = "https://tvfueralle.de/api/genres";
    const api_program        = "https://tvfueralle.de/api/broadcasts/%DATE%";
    
    const dataDir           = utils.getAbsoluteDefaultDataDir()+adapter.name+"/";

    this.stateTemplate = {
        'selectchannel': {
            name:   'selectchannel',
            read:   true,
            write:  true,
            type:   'string',
            role:   'value'
        },
        'config': {
            name:   'config',
            read:   true,
            write:  false,
            type:   'string',
            role:   'value'
        },
        'cmd': {
            name:   'cmd',
            read:   true,
            write:  false,
            type:   'string',
            role:   'value'
        },
        'record': {
            name:   'record',
            read:   true,
            write:  true,
            type:   'string',
            role:   'value'
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
        this.setState('connection', true, 'info');
        this.checkFilesystem();
        this.doObserver();
    };
    this.doObserver = function() {
        this.log.silly('doObserver');
        this.createDatapoints(this.getData.bind(this));
        this.setTimeout('doObserver',this.doObserver.bind(this),60*60*1000);
    };
    this.removeFiles = function() {
        fs.readdir(dataDir+'program/', (err, files) => {
          files.forEach(file => {
              if ((new Date() - new Date(file.split(".")[0]))/(1000 * 60 * 60 * 24)>5) fs.unlinkSync(dataDir+'program/'+file);
          });
        });
    }
    this.checkFilesystem = function() {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        if (!fs.existsSync(dataDir+'program/')) {
            fs.mkdirSync(dataDir+'program/');
        }
    }
    
    this.processMessages = function(msg) {
        this.log.debug('processMessages ' + JSON.stringify(msg));
        if (msg.command === 'getServerData') {
            this.log.debug('send getServerData');
            this.getServerDataMsg(msg);
        }
        if (msg.command === 'getServerEvent') {
            this.log.debug('send getServerEvent');
            this.getServerEventMsg(msg);
        }
    }
    this.doStateChange = function(id,state) {
        this.log.silly("doStateChange");
        // Warning, state can be null if it was deleted
        if (!id || !state || state.ack ) {
            return;
        }
        const idParts = id.split(".");
        idParts.shift();
        idParts.shift();
        if (idParts[0] == 'selectchannel' ) this.doStateChangeSelectChannel(idParts,state);
        if (idParts[0] == 'config' )        this.doStateChangeConfig(idParts,state);
        if (idParts[0] == 'cmd' )           this.doStateChangeCmd(idParts,state);
        if (idParts[0] == 'record' )        this.doStateChangeRecord(idParts,state);
    };
    this.doStateChangeConfig = function(idParts,state) {
        this.log.debug("doStateChangeConfig");
        if (typeof state.val == "string") {
            this.setState(idParts[0],state.val || "");
        }
    };
    this.doStateChangeSelectChannel = function(idParts,state) {
        this.log.debug("doStateChangeSelectChannel");
        if (typeof state.val == "string") {
            this.setState(idParts[0],state.val || "");
        }
    };
    this.doStateChangeCmd = function(idParts,state) {
        this.log.debug("doStateChangeCmd");
        if (typeof state.val == "string") {
            this.setState(idParts[0],"");
        }
    };
    this.doStateChangeRecord = function(idParts,state) {
        this.log.debug("doStateChangeRecord");
        if (typeof state.val == "string") {
            this.setState(idParts[0],state.val);
        }
    };
    this.getServerDataMsg = function(msg) {
        this.log.silly('getServerDataMsg ');
        var data='error';
        if (typeof msg.message=="string" && msg.message!="") {
            if (this.tvdata[msg.message]) data = this.tvdata[msg.message];
            if (msg.message.startsWith('program')) {
                if (this.tvdata['program'][msg.message.split('.')[1]]) {
                    data = JSON.parse(JSON.stringify(this.tvdata['program'][msg.message.split('.')[1]]));
                    data = this.shrinkTVProgramNoText(data);
                }
            } 
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    }
    this.getServerEventMsg = function(msg) {
        this.log.silly('getServerEventMsg ');
        var data='error';
        var events;
        if (typeof msg.message=="object") {
            if (this.tvdata['program'][msg.message.viewdate]) events = this.tvdata['program'][msg.message.viewdate];
            if (events) data=events.find(el=>el.id==msg.message.eventid);
        }
        if (msg.callback) this.adapter.sendTo(msg.from, msg.command, data, msg.callback);
    }
    this.shrinkTVProgramWithText = function(tvprogram) {
        tvprogram.forEach((el, index) => {
            tvprogram[index] = (({
                id: id,
                channel: channel,
                title: title,
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
                            value: valuevs=undefined
                        } = {},
                        Long: {
                            value: valuel =undefined
                        } = {}
                    }
                },
                photo: {
                    url: url=undefined,
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

    }
    this.shrinkTVProgramNoText = function(tvprogram) {
        tvprogram.forEach((el, index) => {
            tvprogram[index] = (({
                id: id,
                channel: channel,
                title: title,
                startTime: startTime,
                endTime: endTime,
                airDate: airDate,
            }) => ({
                id: id,
                channel: channel,
                title,
                startTime: startTime,
                endTime: endTime,
                airDate: airDate,
            }))(el);
        });
        return tvprogram;
    }
    this.createDatapoints = function(callback) {
        pConfig = new Promise((resolve, reject)=>{
            const stateTemplateconfig = JSON.parse(JSON.stringify(this.stateTemplate['config']));
            this.getState(stateTemplateconfig.name,false,false,function(resolve,err,data) {
                this.createObject(stateTemplateconfig,null,null,function(resolve){
                    if (!data) data={val:"{}"};
                    this.setState(stateTemplateconfig.name,data.val);
                    resolve();
                }.bind(this,resolve));
            }.bind(this,resolve));
        });

        pChannel = new Promise((resolve, reject)=>{
            stateTemplateselch = JSON.parse(JSON.stringify(this.stateTemplate['selectchannel']));
            this.getState(stateTemplateselch.name,false,false,function(resolve,err,data) {
                this.createObject(stateTemplateselch,null,null,function(resolve){
                    if (!data) data={val:""};
                    this.setState(stateTemplateselch.name,data.val);
                    resolve();
                }.bind(this,resolve));
            }.bind(this,resolve));
        });
        pCmd = new Promise((resolve, reject)=>{
            stateTemplateselcmd = JSON.parse(JSON.stringify(this.stateTemplate['cmd']));
            this.getState(stateTemplateselcmd.name,false,false,function(resolve,err,data) {
                this.createObject(stateTemplateselcmd,null,null,function(resolve){
                    if (!data) data={val:""};
                    this.setState(stateTemplateselcmd.name,data.val);
                    resolve();
                }.bind(this,resolve));
            }.bind(this,resolve));
        });
        pRecord = new Promise((resolve, reject)=>{
            stateTemplateselcmd = JSON.parse(JSON.stringify(this.stateTemplate['record']));
            this.getState(stateTemplateselcmd.name,false,false,function(resolve,err,data) {
                this.createObject(stateTemplateselcmd,null,null,function(resolve){
                    if (!data) data={val:""};
                    this.setState(stateTemplateselcmd.name,data.val);
                    resolve();
                }.bind(this,resolve));
            }.bind(this,resolve));
        });
        Promise.all([pConfig, pChannel, pCmd,pRecord]).then(() => {
            callback();
        });
    }
    this.getData = function() {
        this.log.silly('getData');

        this.getCategories(function(data){
            if (data=="error") {
                data = this.readFileSync('categories.json');
                if (data=="error") data={category:[]};
            }
            if (JSON.stringify(this.tvdata.categories) != JSON.stringify(data.category)) {
                this.log.debug('getData first request or changed data categories');
                this.writeFile('categories.json',data.category);
                this.tvdata.categories=data.category;
                this.setStateNoAck("cmd","new|categories");
            }
        }.bind(this));
        this.getChannels(function(data){
            if (data=="error") {
                data = this.readFileSync('channels.json');
                if (data=="error") data={channels:[]};
            }
            if (JSON.stringify(this.tvdata.channels) != JSON.stringify(data.channels)) {
                this.log.debug('getData first request or changed data channels');
                this.writeFile('channels.json',data.channels);
                this.tvdata.channels=data.channels;
                this.setStateNoAck("cmd","new|channels");
            }
        }.bind(this));
        this.getGenres(function(data){
            if (data=="error") {
                data = this.readFileSync('genres.json');
                if (data=="error") data={genres:[]};
            }
            if (JSON.stringify(this.tvdata.genres) != JSON.stringify(data.genres)) {
                this.log.debug('getData first request or changed data genres');
                this.writeFile('genres.json',data.genres);
                this.tvdata.genres=data.genres;
                this.setStateNoAck("cmd","new|genres");
            }
        }.bind(this));
        
        var dstart = new Date();
        var dend = new Date();
        dend.setDate(dend.getDate()+5);
        while(dstart <= dend){
            this.getProgram(dstart,function(dstart,data){
                if (data=="error") {
                    data = this.readFileSync('program/'+dstart+'.json');
                    if (data=="error") data={events:[]};
                }
                data.events = this.shrinkTVProgramWithText(data.events);
                if (JSON.stringify(this.tvdata.program[dstart]) != JSON.stringify(data.events)) {
                    this.log.debug('getData first request or changed data events ' + dstart);
                    this.writeFile('program/'+dstart+'.json',data);
                    this.tvdata.program[dstart]=data.events;
                    this.setStateNoAck("cmd","new|program|"+dstart);
                }
            }.bind(this,this.formatedDate(dstart)));
            dstart.setDate(dstart.getDate() + 1);
        }
        dstart = new Date();
        dstart.setDate(dstart.getDate() - 1);
        dend = new Date();
        dend.setDate(dend.getDate()-5);

        while(dstart >= dend){
            data = this.readFileSync('program/'+this.formatedDate(dstart)+'.json');
            if (data=="error") {
                dstart.setDate(dstart.getDate() - 1);
                continue;
            } 
            this.tvdata.program[this.formatedDate(dstart)]=data.events;
            dstart.setDate(dstart.getDate() - 1);
        }
        this.removeFiles();
    }
    this.getProgram = function(datum,callback) {
        this.log.silly('getProgram');               
        if (!(datum && datum.getUTCDate())) return "";
        var options = {
            "%DATE%": this.formatedDate(datum),
        };
        return this.request(this.getUrlFromTemplate(options,api_program),callback.bind("123"));                
    }
    this.formatedDate = function(datum) {
        return datum.getFullYear()+"-"+('0' + (datum.getMonth()+1)).slice(-2) + '-' + ('0' + (datum.getDate())).slice(-2);
    }
    this.getCategories = function(callback) {
        this.log.silly('getCategories');               
        return this.request(api_categories,callback);                
    }
    this.getChannels = function(callback) {
        this.log.silly('getChannels');
        return this.request(api_channels,callback);                
    }
    this.getGenres = function(callback) {
        this.log.silly('getData');               
        return this.request(api_genres,callback);                
    }
    this.getUrlFromTemplate = function(options,urltemplate) {
        return urltemplate.replace(/%\w+%/g, function(option) {
           return options[option] || option;
        });        
    }    
    this.request = function(url,callback) {
        this.log.debug("request url " + url);
         http.get(url, (res) => {
            const {
                statusCode
            } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode} ` + res.connection.servername + res.req.path);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType} ` + res.connection.servername + res.req.path);
            }
            if (error) {
                this.log.error(error.message);
                res.resume();
                callback("error");
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    this.log.silly('request rawData');
                    const parsedData = JSON.parse(rawData);
                    callback(parsedData);
                } catch (e) {
                    this.log.error(e.message);
                }
            });
         }).on('error', (e) => {
            this.log.error(e.message);
            callback("error");
         });
    }
    this.createObject = function(stateTemplate,level1path=false,level2path=false,callback=false) {
        this.log.debug('createObject ' + stateTemplate.name);
        const name = (level1path ? level1path + '.' : '') + (level2path ? level2path + '.' : '') + stateTemplate.name;
        this.adapter.getObject(name, (err, obj) => {
            var newobj = {
                    type: 'state',
                    common: stateTemplate,
                    native: {}
                };            
            if (!obj) {
                (callback) ? this.adapter.setObject(name,newobj,callback) : this.adapter.setObject(name,newobj);
            } else {
                if (callback) callback();
            }
        }); 
    }
    this.getState = function(id, level1path=false,level2path=false,callback) {
        this.log.debug("getState " + id);
        const name = (level1path ? level1path + "." : "") + (level2path ? level2path + "." : "") + id;
        this.adapter.getState(name, callback);
    };
    this.setState = function(name, value,level1path=false,level2path=false,callback=false) {
        this.log.debug('setState ' + name);
        name = (level1path ? level1path + '.' : '') + (level2path ? level2path + '.' : '') + name;
        this.adapter.log.debug('setState name: ' + name /*+ ' value: ' + value*/);
        (callback) ? this.adapter.setState(name, value, true, callback) : this.adapter.setState(name, value, true);
    };
    this.setStateNoAck = function(name, value,level1path=false,level2path=false,callback=false) {
        this.log.debug('setState ' + name);
        name = (level1path ? level1path + '.' : '') + (level2path ? level2path + '.' : '') + name;
        this.adapter.log.debug('setState name: ' + name /*+ ' value: ' + value*/);
        (callback) ? this.adapter.setState(name, value, false, callback) : this.adapter.setState(name, value, false);
    };
    this.writeFile = function(filename,data,callback=null) {
        if (typeof data != "string") data=JSON.stringify(data);
        fs.writeFile(dataDir+filename, data, (err) => {
            if (err) {
                this.log.debug('Error saving file '+filename+'! ' + err.message);
            } else {
                this.log.debug('The file '+filename+' has been saved!');
            }
            if (callback) callback(err);
        });
    };
    this.readFile = function(filename,callback) {
        fs.readFile(dataDir+filename,  (err,data) => {
            if (err) {
                this.log.debug('Error loading file '+filename+'! ' + err.message);
                callback("error");
            } else {
                this.log.debug('The file '+filename+' has been loaded!');
                try {
                    callback(JSON.parse(data));
                } catch {
                    callback(data);
                }
            }
        });
        
    };
    this.readFileSync = function(filename) {
        var data;
        try {
            data = JSON.parse(fs.readFileSync(dataDir+filename));
        } catch {
            data="error"
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
        this.log.debug('deleteObservers');        
        this.clearTimeout('doObserver');
    };
    this.closeConnections = function() {
        this.log.debug('closeConnections');        
        this.deleteObservers();
    }
    
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

