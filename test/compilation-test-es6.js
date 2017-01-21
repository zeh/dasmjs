import { expect } from "chai";
import dasm from "./../lib/index";
import * as fs from "fs";
import * as path from "path";

function bufferToArray(b) {
	const arr = new Uint8Array(b.length);
	return arr.map((v, i) => b[i]);
}

function filterList(lines) {
	// dasm is not deterministic; it runs a different number of passes
	// sometimes, specially between es5/es6 versions. But the final pass
	// should contain the same symbols. So we filter superfluous information
	// before comparing the list output
	var newLines = [];
	lines.forEach((line) => {
		if (!line.startsWith("------- ") && !line.match(/\?{4}/)) {
			newLines.push(line);
		}
	});
	return newLines;
}

describe("dasm (ES6)", () => {
	it("is a function", function() {
		expect(dasm).to.be.a.function;
	});

	it("compiles simple code (clock)", function() {
		const pathSrc = path.join(__dirname, "/roms/clock.asm");
		const pathOut = path.join(__dirname, "/roms/clock.out");
		const pathSym = path.join(__dirname, "/roms/clock.sym");
		const pathLst = path.join(__dirname, "/roms/clock.lst");

		// Read
		const src = fs.readFileSync(pathSrc, { "encoding": "utf8" });
		expect(src.length).to.equal(15515);

		// Compile
		const result = dasm(src, { format: 3 });

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).to.equal(4096);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).to.deep.equal(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw.split("\n");
		const fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).to.deep.equal(filterList(fileLst));

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).to.equal(fileSym);
	});

	it("compiles complex code (combat)", function() {
		const pathSrc = path.join(__dirname, "/roms/dicombat.asm");
		const pathOut = path.join(__dirname, "/roms/dicombat.out");
		const pathSym = path.join(__dirname, "/roms/dicombat.sym");
		const pathLst = path.join(__dirname, "/roms/dicombat.lst");

		// Read
		const src = fs.readFileSync(pathSrc, { "encoding": "utf8" });
		expect(src.length).to.equal(68825);

		// Compile
		const result = dasm(src, { format: 3, machine: "atari2600" });

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).to.equal(2048);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).to.deep.equal(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw.split("\n");
		const fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).to.deep.equal(filterList(fileLst));

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).to.equal(fileSym);
	});

	it("compiles complex code with includes (combat)", function() {
		const pathSrc = path.join(__dirname, "/roms/dicombat.asm");
		const pathOut = path.join(__dirname, "/roms/dicombat.out");
		const pathSym = path.join(__dirname, "/roms/dicombat.sym");
		const pathLst = path.join(__dirname, "/roms/dicombat.lst");
		const pathVcsh = path.join(__dirname, "/roms/atari2600/vcs.h")

		// Read
		const src = fs.readFileSync(pathSrc, { "encoding": "utf8" });
		const vcsh = fs.readFileSync(pathVcsh, { "encoding": "utf8" });

		// Compile
		const result = dasm(src, { format: 3, includes: { "vcs.h": vcsh }});

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).to.equal(2048);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).to.deep.equal(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw.split("\n");
		const fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).to.deep.equal(filterList(fileLst));

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).to.equal(fileSym);
	});

	it("fails gracefuly (simple)", function() {
		const src = " a";

		// Compile
		const result = dasm(src);

		expect(result.success).to.equal(false);
		expect(result.list.length).to.equal(1);
		expect(result.list[0].errorMessage).to.exist;
	});

	it("fails gracefuly (aborted)", function() {
		const src = " a = 10\n processor";

		// Compile
		const result = dasm(src);

		expect(result.success).to.equal(false);
		expect(result.list.length).to.equal(2);
		expect(result.list[0].errorMessage).to.exist;
		expect(result.list[1].errorMessage).to.exist;
	});

	it("fails gracefuly (missing file)", function() {
		const src = " include doesntexist\n include somethingelse";

		// Compile
		const result = dasm(src);

		expect(result.success).to.equal(true); // It will still compile
		expect(result.list.length).to.equal(2);
		expect(result.list[0].errorMessage).to.exist;
		expect(result.list[1].errorMessage).to.exist;
	});

	it("fails gracefuly (missing file), doesn't mismatch error location", function() {
		const src = " include doesntexist\n include somethingelse";

		// Compile
		const result = dasm(" ; vcs.h\n include vcs.h");

		expect(result.success).to.equal(true); // It will still compile
		expect(result.list.length).to.equal(2);
		expect(result.list[0].errorMessage).to.not.exist;
		expect(result.list[1].errorMessage).to.exist;
	});

	it("fails gracefuly (missing symbol)", function() {
		const src = " processor 6502\n lda NOTHING\n lda NOTHING\n";

		// Compile
		const result = dasm(src);

		expect(result.success).to.equal(true); // It will still compile, value will be 0
		expect(result.list.length).to.equal(3);
		expect(result.list[1].errorMessage).to.exist;
		expect(result.list[2].errorMessage).to.exist;
	});
});
