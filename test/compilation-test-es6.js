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
	test("is a function", () => {
		expect(typeof dasm).toBe("function");
	});

	test("compiles simple code (clock)", () => {
		const pathSrc = path.join(__dirname, "/roms/clock.asm");
		const pathOut = path.join(__dirname, "/roms/clock.out");
		const pathSym = path.join(__dirname, "/roms/clock.sym");
		const pathLst = path.join(__dirname, "/roms/clock.lst");

		// Read
		const src = fs.readFileSync(pathSrc, { "encoding": "utf8" });
		expect(src.length).toEqual(15515);

		// Compile
		const result = dasm(src, { format: 3 });

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).toEqual(4096);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).toEqual(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw.split("\n");
		const fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).toEqual(filterList(fileLst));

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).toEqual(fileSym);
	});

	test("compiles complex code (combat)", function() {
		const pathSrc = path.join(__dirname, "/roms/dicombat.asm");
		const pathOut = path.join(__dirname, "/roms/dicombat.out");
		const pathSym = path.join(__dirname, "/roms/dicombat.sym");
		const pathLst = path.join(__dirname, "/roms/dicombat.lst");

		// Read
		const src = fs.readFileSync(pathSrc, { "encoding": "utf8" });
		expect(src.length).toEqual(68825);

		// Compile
		const result = dasm(src, { format: 3, machine: "atari2600" });

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).toEqual(2048);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).toEqual(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw.split("\n");
		const fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).toEqual(filterList(fileLst));

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).toEqual(fileSym);
	});

	test("compiles complex code with includes (combat)", function() {
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
		expect(myOut.length).toEqual(2048);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).toEqual(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw.split("\n");
		const fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).toEqual(filterList(fileLst));

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).toEqual(fileSym);
	});

	test("fails gracefuly (simple)", function() {
		const src = " a";

		// Compile
		const result = dasm(src);

		expect(result.success).toEqual(false);
		expect(result.list.length).toEqual(1);
		expect(result.list[0].errorMessage).toBeDefined();
	});

	test("fails gracefuly (aborted)", function() {
		const src = " a = 10\n processor";

		// Compile
		const result = dasm(src);

		expect(result.success).toEqual(false);
		expect(result.list.length).toEqual(2);
		expect(result.list[0].errorMessage).toBeDefined();
		expect(result.list[1].errorMessage).toBeDefined();
	});

	test("fails gracefuly (missing file)", function() {
		const src = " include doesntexist\n include somethingelse";

		// Compile
		const result = dasm(src);

		expect(result.success).toEqual(true); // It will still compile
		expect(result.list.length).toEqual(2);
		expect(result.list[0].errorMessage).toBeDefined();
		expect(result.list[1].errorMessage).toBeDefined();
	});

	test("fails gracefuly (missing file), doesn't mismatch error location", function() {
		const src = " include doesntexist\n include somethingelse";

		// Compile
		const result = dasm(" ; vcs.h\n include vcs.h");

		expect(result.success).toEqual(true); // It will still compile
		expect(result.list.length).toEqual(2);
		expect(result.list[0].errorMessage).toBeUndefined();
		expect(result.list[1].errorMessage).toBeDefined();
	});

	test("fails gracefuly (missing symbol)", function() {
		const src = " processor 6502\n lda NOTHING\n lda NOTHING\n";

		// Compile
		const result = dasm(src);

		expect(result.success).toEqual(true); // It will still compile, value will be 0
		expect(result.list.length).toEqual(3);
		expect(result.list[1].errorMessage).toBeDefined();
		expect(result.list[2].errorMessage).toBeDefined();
	});
});
