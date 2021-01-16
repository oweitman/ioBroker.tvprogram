"use strict";

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");
const tvprogramrequire = require(__dirname +"/lib/tvprogramserver.js");
let tvprogramserver;

class Tvprogram extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "tvprogram",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // Reset the connection indicator during startup
        this.setState("info.connection", true, true);

        // Initialize your adapter here
        if (!tvprogramserver) {
            this.log.debug("main onReady open tvprogramm");
            tvprogramserver = new tvprogramrequire(this);
        }

        this.subscribeStates("*");


    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.debug("main onUnload try");

            tvprogramserver.closeConnections();
            this.log.info("cleaned everything up...");
            // Reset the connection indicator during startup
            this.setState("info.connection", false, true);
            callback();
        } catch (e) {
            this.log.debug("main onUnload error");
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            if (tvprogramserver) tvprogramserver.doStateChange(id,state);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

     onMessage(obj) {
     	if (typeof obj === 'object' && obj.message) {
            tvprogramserver.processMessages(obj);
        }
     }    
    

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Tvprogram(options);
} else {
    // otherwise start the instance directly
    new Tvprogram();
}