
const http = require('https');

function tvprogramclass(adapter) {
    
    const api_channels       = "https://tvfueralle.de/api/channels";
    const api_categories     = "https://tvfueralle.de/api/categories";
    const api_genres         = "https://tvfueralle.de/api/genres";
    const api_program        = "https://tvfueralle.de/api/broadcasts/%DATE%";

    this.stateTemplate = {
        'channels': {
            name:   'channels',
            read:   true,
            write:  false,
            type:   'string',
            role:   'value'
        },
        'categories': {
            name:   'categories',
            read:   true,
            write:  false,
            type:   'string',
            role:   'value'
        },
        'genres': {
            name:   'genres',
            read:   true,
            write:  false,
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
        'program': {
            name:   'program',
            read:   true,
            write:  false,
            type:   'string',
            role:   'value'
        }
    };

    this.adapter = adapter;
    this.log = {};
    this.logsilly = true;
    this.logdebug = true;
    this.observers = [];

    this.init = function() {
        this.setState('connection', true, 'info');
        this.doObserver();
    };
    this.doObserver = function() {
        this.log.silly('doObserver');       
        this.getData();
        this.setTimeout('doObserver',this.doObserver.bind(this),60000*1000);
    };

    this.getData = function() {
        this.log.silly('getData');

        this.getCategories(function(data){
            var stateTemplate = this.stateTemplate['categories'];
            this.createObject(stateTemplate,null,null,function(){
                this.setState(stateTemplate.name,JSON.stringify(data));
            }.bind(this));
        }.bind(this));
        this.getChannels(function(data){
            var stateTemplate = this.stateTemplate['channels'];
            this.createObject(stateTemplate,null,null,function(){
                this.setState(stateTemplate.name,JSON.stringify(data));
            }.bind(this));
        }.bind(this));
        this.getGenres(function(data){
            var stateTemplate = this.stateTemplate['genres'];
            this.createObject(stateTemplate,null,null,function(){
                this.setState(stateTemplate.name,JSON.stringify(data));
            }.bind(this));
        }.bind(this));
        var stateTemplate = this.stateTemplate['config'];
        this.getState(stateTemplate.name,false,false,function(err,data) {
            this.createObject(stateTemplate,null,null,function(){
                if (!data) data={val:""};
                this.setState(stateTemplate.name,data.val);
            }.bind(this));
        }.bind(this));
        var dstart = new Date();
        var dend = new Date();
        dend.setDate(dend.getDate()+5);
        while(dstart <= dend){

            this.getProgram(dstart,function(dstart,data){
                var stateTemplate = JSON.parse(JSON.stringify(this.stateTemplate['program']));
                stateTemplate.name=dstart;
                this.createObject(stateTemplate,"program",null,function(){
                    this.setState(stateTemplate.name,JSON.stringify(data),"program");
                }.bind(this));
            }.bind(this,dstart.getFullYear()+"-"+('0' + (dstart.getMonth()+1)).slice(-2) + '-' + ('0' + (dstart.getDate())).slice(-2)));
            dstart.setDate(dstart.getDate() + 1);
        }
    }

    this.getProgram = function(datum,callback) {
        this.log.silly('getProgram');               
        if (!(datum && datum.getUTCDay())) return "";
        var options = {
            "%DATE%": datum.getFullYear()+"-"+('0' + (datum.getMonth()+1)).slice(-2) + '-' + ('0' + (datum.getDate())).slice(-2),
        };
        return this.request(this.getUrlFromTemplate(options,api_program),callback.bind("123"));                
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