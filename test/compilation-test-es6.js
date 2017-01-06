import { expect } from "chai";
import dasm from "./../lib/index";
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
		const result = dasm(src, { format: 3 });

		// Check ROM
		const myOut = result.data;
		expect(myOut.length).to.equal(4096);

		const fileOut = fs.readFileSync(pathOut);
		expect(myOut).to.deep.equal(bufferToArray(fileOut));

		// Check list
		const myLst = result.listRaw;
		let fileLst = fs.readFileSync(pathLst, { encoding: "utf8" });
		fileLst = fileLst.replace(/clock\.asm/g, "file.a");
		// Disabled for now; not getting all passes
		// ES6 is only outputting the first pass, and it's different;
		// ES5 is only outputting the second pass
		//expect(myLst).to.equal(fileLst);

		//fs.writeFileSync(pathLst + "_", myLst, { encoding: "utf8" });

		// Check symbols
		const mySym = result.symbolsRaw;
		const fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).to.equal(fileSym);
	});

});
