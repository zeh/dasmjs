import { expect } from "chai";
import dasm from "./../index";
import * as fs from "fs";
import * as path from "path";

function bufferToArray(b) {
	const arr = new Uint8Array(b.length);
	return arr.map((v, i) => b[i]);
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
		const result = dasm(src, "-f3", "-oa.out", "-la.lst", "-sa.sym", "-p3");

		// Check ROM
		const myOut = result.FS.readFile("a.out");
		expect(myOut.length).to.equal(4096);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).to.deep.equal(bufferToArray(fileOut));

		// Check list
		let myLst = result.FS.readFile("a.lst", { encoding: "utf8" });
		let fileLst = fs.readFileSync(pathLst, { encoding: "utf8" });
		// Ignore file name
		fileLst = fileLst.replace(/clock\.asm/g, "in.a");
		// Ignore number of passes
		fileLst = fileLst.replace(/PASS [0-9]$/gm, "PASS 1");
		// Ignore unknown symbols
		const unknownSymbolLine = /^ +[0-9]+  [0-9]{4,} \?{4}.*$/gm;
		fileLst = fileLst.replace(unknownSymbolLine, "");
		myLst = myLst.replace(unknownSymbolLine, "");
		expect(myLst).to.equal(fileLst);

		// Check symbols
		const mySym = result.FS.readFile("a.sym", { encoding: "utf8" });
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).to.equal(fileSym);
	});
});
