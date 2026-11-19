'use strict';

/*
 * The answer of the message "help": what the instance answers, written for AI agents (e.g. ioBroker.pi-agent or
 * the MCP server with send_to) and script authors. Keep it in sync with onMessage in main.js and processMessages in
 * lib/tvprogramserver.js.
 */

/** Every command the adapter answers; write = it changes something. */
const COMMANDS = [
    { command: 'help', write: false },
    { command: 'getServerData', write: false },
    { command: 'getServerInfo', write: false },
    { command: 'getServerTVProgram', write: false },
    { command: 'getServerBroadcastNow', write: false },
    { command: 'getServerBroadcastDate', write: false },
    { command: 'getServerBroadcastRange', write: false },
    { command: 'getServerBroadcastFind', write: false },
    { command: 'getServerBroadcast', write: false },
    { command: 'getFavoritesData', write: false },
    { command: 'setValueAck', write: true },
    { command: 'getServerTest', write: false },
    { command: 'getServerTVs', write: false },
];

const HELP = `ioBroker.tvprogram: downloads the TV programme (source "TV für alle" or IPTV-EPG.org by country) for every
configured TV and shows it in vis widgets (timetable, favorites, control, search). An agent can tell what is on now
or at a time, search broadcasts by text or category, list the coming broadcasts of favorite titles, and change the
favorites, the channel selection or the channel to switch to of a TV.

TVs: each configured TV is the device tvprogram.0.<tv> (<tv> = its name in lower case without spaces, e.g. "tv1").
tv = "<tv>" or any state ID below it selects the programme source of that TV; without tv (also when the message is
a plain text or a list) the first source is used.
Channels have a numeric id (in channelfilter and as channel of the broadcasts), a channelId of the source (e.g.
"ard" or "DasErste.de") and a name. Broadcast days (date, viewdate, airDate) are "YYYY-MM-DD"; broadcasts between
00:00 and 04:59 belong to the day before. getServerInfo lists the days that are loaded. startTime and endTime are
date-time texts; times in requests are any text that Date() reads, e.g. "2026-11-19T20:15" (local time).

Commands (sendTo tvprogram.0; the message must not be empty, send at least {}):
- getServerData {dataname, tv?} or "channels": dataname = channels, categories or genres: channels [{id, channelId,
  name, order, logo, ...}], categories and genres [{id, title}]; "nodata" if not loaded, "error1" without dataname.
- getServerInfo {tv?}: the loaded broadcast days: {tvprogram: ["YYYY-MM-DD", ...]}.
- getServerTVProgram {date, channelfilter?, tv?} or "YYYY-MM-DD": the broadcasts of a broadcast day, short: [{id,
  channel, title, startTime, endTime, airDate, photo: {url}}]; channelfilter = list of channel ids; "nodata" if the
  day is not loaded, "error" without date.
- getServerBroadcastNow [channel ids]: what runs now on these channels (first source): [{channel, events:
  [broadcast]}] in the order of the list; entries may be null.
- getServerBroadcastDate {channelfilter, date, tv?}: what runs at the time date on these channels, like
  getServerBroadcastNow; "error" if no day around date is loaded.
- getServerBroadcastRange {channelfilter, startdate, enddate, tv?}: the broadcasts that overlap this time range:
  [{channel, events}] per channel and day; entries may be null.
- getServerBroadcastFind {channelfilter, datefrom, datetill, textfilter?, categoryfilter?, maxresults?, tv?}: the
  broadcasts completely within datefrom..datetill on these channels whose title or description contains textfilter
  (ignoring case; empty = all) and whose category is in categoryfilter (category ids; empty = all): [{channel,
  events}]; maxresults (default 10) counts per channel and broadcast day.
- getServerBroadcast {viewdate, eventid, tv?}: one broadcast with its details: {id, channel, title, startTime,
  endTime, airDate, content: {category, texts: {Long: {value}, VeryShort: {value}}, ...}, photo: {url}}; "error"
  if the day is not loaded, no value if the id is unknown.
- getFavoritesData {favorites, channelfilter?, tv?} or [titles]: the broadcasts of the current broadcast day (also
  the ones already over) and the next 5 days whose title equals a favorite exactly, sorted by start: [broadcast +
  {viewdate, channelid, channelname}].
- setValueAck {id, value}: writes a state of this instance with ack true, as the widgets do; id e.g.
  "tvprogram.0.tv1.favorites", value a text. Answer {}.
- getServerTest, getServerTVs: for tests (getServerTVs always answers "error"), not for agents.

States (tvprogram.0.<tv>.*, texts; change them with setValueAck, not with a command):
- channelfilter: the selected channels as JSON list of channel ids in display order (use it as channelfilter).
- favorites: the favorite titles as JSON list of texts.
- selectchannel: the channelId to switch to (written by a click on a channel logo; user scripts switch the TV).
- record: JSON {startTime, endTime, title, channel, channelid, channelname, eventid} written by the record button
  (user scripts may program a recorder with it).

How to talk to the user:
- For "what is on" use the channelfilter of the TV. If several TVs are configured and the user names none, reading
  from the first one is fine; ask which TV before changing anything.
- Name channels by name (getServerData channels), not by id; give times in local time.
- setValueAck changes the favorites or the channel selection, or switches the TV (selectchannel) or starts a
  recording (record): only on the user's request. Read the state first and write back the whole list.`;

module.exports = { COMMANDS, HELP };
