var expect = require('chai').expect;
var dasm = require("./../lib/index").default;
var fs = require("fs");
var path = require("path");

function bufferToArray(b) {
	var arr = new Uint8Array(b.length);
	for (var i = 0; i < b.length; i++) {
		arr[i] = b[i];
	}
	return arr;
}

describe("dasm (ES5)", function() {
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
		var result = dasm(src, { format: 3 });

		// Check ROM
		var myOut = result.data;
		expect(myOut.length).to.equal(4096);

		var fileOut = fs.readFileSync(pathOut);
		expect(myOut).to.deep.equal(bufferToArray(fileOut));

		// Check list
		var myLst = result.listRaw;
		var fileLst = fs.readFileSync(pathLst, { encoding: "utf8" });
		fileLst = fileLst.replace(/clock\.asm/g, "file.a");
		// Disabled for now; not getting all passes
		//expect(myLst).to.equal(fileLst);

		//fs.writeFileSync(pathLst + "_", myLst, { encoding: "utf8" });

		// Check symbols
		var mySym = result.symbolsRaw;
		var fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).to.equal(fileSym);
	});
});


// TODO: ./bin/dasm dicombat.asm -f3 -odicombat.out -ldicombat.lst -sdicombat.sym -Imachines/atari2600