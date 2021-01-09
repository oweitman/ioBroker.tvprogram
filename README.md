![Logo](admin/tvprogram.png)
# ioBroker.tvprogram

[![NPM version](http://img.shields.io/npm/v/iobroker.tvprogram.svg)](https://www.npmjs.com/package/iobroker.tvprogram)
[![Downloads](https://img.shields.io/npm/dm/iobroker.tvprogram.svg)](https://www.npmjs.com/package/iobroker.tvprogram)
![Number of Installations (latest)](http://iobroker.live/badges/tvprogram-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/tvprogram-stable.svg)
[![Dependency Status](https://img.shields.io/david/oweitman/iobroker.tvprogram.svg)](https://david-dm.org/oweitman/iobroker.tvprogram)
[![Known Vulnerabilities](https://snyk.io/test/github/oweitman/ioBroker.tvprogram/badge.svg)](https://snyk.io/test/github/oweitman/ioBroker.tvprogram)

[![NPM](https://nodei.co/npm/iobroker.tvprogram.png?downloads=true)](https://nodei.co/npm/iobroker.tvprogram/)

**Tests:** [![Travis-CI](http://img.shields.io/travis/oweitman/ioBroker.tvprogram/master.svg)](https://travis-ci.org/oweitman/ioBroker.tvprogram)

## tvprogram adapter for ioBroker

This adapter polls information about the television program at regular intervals. 
The data can be displayed in various widgets. 

The adapter is still in an alpha phase in which widgets / functions are still being tested, 
functions / widgets can be added and removed or completely exchanged.

References to issues or feature requests can be left or 
discussed in the iobroker forum in the corresponding thread

## Developer manual
The adapter can currently only be installed via github. This can be done in the iobroker in the "adapter" tab, 
with the expert view via the github button (cat symbol).

Then enter the url of the github repository xxx in the "any" tab and install it.

### Adapter Configuration

No configuration currently required

### Widgets

#### Time
Currently only the widget "time" exists. This shows the current TV program on a timeline by TV channel.

To set it up, the adapter must have already accessed and filled the necessary data points. 
In the configuration, the widget only needs to be filled with any data point of the adapter. 
The widget searches for all remaining data points automatically.

Functions:

- show tv data on timeline by tv channel
- show details about a tv broadcast if available
- show a marker of actual position with automatic scrolling
- configure displayed tv channels and order

### Todo

widget tvprogram: 
- zoomin/zoomout
- favorite broadcasts
- navigation next days

- Ideas for further widgets based on the existing TV program script
- broadcast reminders
- switch command via datapoint after click on logo
- Data adapter for other sources (Internet, hardware such as Enigma, VU-Box)

## Changelog

### 0.0.1
* (oweitman) initial release

## License
MIT License

Copyright (c) 2020 oweitman <oweitman@gmx.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.