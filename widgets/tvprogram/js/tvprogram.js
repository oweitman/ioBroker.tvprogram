/*
    ioBroker.vis tvprogram Widget-Set

    Copyright 2020 oweitman oweitman@gmx.de
*/
'use strict';
//import axios from 'axios';

/* global vis, $, systemDictionary, window, jQuery */

// add translations for edit mode

import { version as pkgVersion } from '../../../package.json';
import search from './search.js';
import control from './control.js';
import favorites from './favorites.js';
import time1 from './time1.js';
import shared from './shared.js';

fetch('widgets/tvprogram/i18n/translations.json').then(async res => {
    const i18n = await res.json();

    $.extend(true, systemDictionary, i18n);
});
$.extend(true, systemDictionary, {
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
});

// this code can be placed directly in tvprogram.html
vis.binds['tvprogram'] = {
    version: pkgVersion,
    showVersion: function () {
        if (vis.binds['tvprogram'].version) {
            console.log(`Version tvprogram: ${vis.binds['tvprogram'].version}`);
            vis.binds['tvprogram'].version = null;
        }
    },
    pending: {},
    categories: null,
    channels: null,
    genres: null,
    tvprogram: [],
    infos: null,
    requests: [],
    search,
    control,
    favorites,
    time1,
    ...shared,
};

vis.binds['tvprogram'].showVersion();

jQuery.fn.mydelay = function (time, type) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
    type = type || 'fx';

    return this.queue(type, function (next, hooks) {
        const timeout = window.setTimeout(next, time);
        hooks.stop = function () {
            window.clearTimeout(timeout);
        };
    });
};
//https://services.sg1.etvp01.sctv.ch/catalog/tv/channels/list/ids=25;level=enorm;start=202102182000
//https://services.sg2.etvp01.sctv.ch/portfolio/tv/channels
//https://services.sg1.etvp01.sctv.ch/catalog/tv/channels/list/ids=25,656;level=normal;start=202102180500;end=202102190500
//tv.blue.ch
