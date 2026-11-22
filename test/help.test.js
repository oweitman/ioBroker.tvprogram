'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');
const { COMMANDS, HELP } = require('../lib/help');

/**
 * The commands of onMessage (main.js) and processMessages (lib/tvprogramserver.js)
 *
 * @returns {string[]} command names
 */
function answeredCommands() {
    const main = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
    const server = fs.readFileSync(path.join(__dirname, '../lib/tvprogramserver.js'), 'utf8');
    const start = server.indexOf('this.processMessages = ');
    const end = server.indexOf('this.doStateChange = ');
    expect(start).to.be.greaterThan(0);
    expect(end).to.be.greaterThan(start);
    const names = [main, server.slice(start, end)].flatMap(text =>
        [...text.matchAll(/\.command === '([^']+)'/g)].map(m => m[1]),
    );
    return [...new Set(names)];
}

describe('help', () => {
    it('lists exactly the commands the adapter answers, each once', () => {
        const listed = COMMANDS.map(entry => entry.command);
        expect(new Set(listed).size).to.equal(listed.length);
        expect([...listed].sort()).to.deep.equal(answeredCommands().sort());
    });

    it('marks only setValueAck as write', () => {
        expect(COMMANDS.filter(entry => entry.write).map(entry => entry.command)).to.deep.equal(['setValueAck']);
    });

    it('names every command and keeps the lines short', () => {
        for (const { command } of COMMANDS.filter(entry => entry.command !== 'help')) {
            expect(HELP, command).to.include(command);
        }
        expect(HELP).to.include('Commands (sendTo tvprogram.0');
        expect(HELP).to.include('How to talk to the user:');
        for (const line of HELP.split('\n')) {
            expect(line.length, line).to.be.at.most(120);
        }
    });
});
