import { expect } from "chai";
import dasm from "./../index";
import * as fs from "fs";
import * as path from "path";

function bufferToArray(b) {
	var arr = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) {
        arr[i] = b[i];
    }
    return arr;
}

describe("dasm (ES6)", () => {
	it("is a function", function() {
		expect(dasm).to.be.a.function;
	});

	it("compiles simple code (clock)", function() {
		var pathSrc = path.join(__dirname, "/roms/clock.asm");
		var pathOut = path.join(__dirname, "/roms/clock.out");
		var pathSym = path.join(__dirname, "/roms/clock.sym");
		var pathLst = path.join(__dirname, "/roms/clock.lst");

		// Read
		var src = fs.readFileSync(pathSrc, { "encoding": "utf8" });
		expect(src.length).to.equal(15515);

		// Compile
		var result = dasm(src, "-f3", "-oa.out", "-la.lst", "-sa.sym");

		// Check ROM
		var myOut = result.FS.readFile("a.out");
		expect(myOut.length).to.equal(4096);
	});
});
