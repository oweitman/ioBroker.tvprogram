const path = require("path");
const { tests } = require("@iobroker/testing");
const { expect } = require("chai");
const manifest = require("../package.json");

// Validate the package files
tests.packageFiles(path.join(__dirname, ".."));

describe("Widget package contents", () => {
    it("includes the widget entry and bundle without broad widget globs", () => {
        expect(manifest.files).to.include("widgets/tvprogram.html");
        expect(manifest.files).to.include("widgets/tvprogram/dist/*.js");
        expect(manifest.files).to.include("widgets/tvprogram/css/*.css");
        expect(manifest.files).to.include("widgets/tvprogram/i18n/*.json");
        expect(manifest.files.some(pattern => pattern.startsWith("widgets/**"))).to.equal(false);
        expect(manifest.files.some(pattern => pattern.startsWith("widgets/tvprogram/js/"))).to.equal(false);
        expect(manifest.files.some(pattern => pattern.includes("node_modules"))).to.equal(false);
    });
});
