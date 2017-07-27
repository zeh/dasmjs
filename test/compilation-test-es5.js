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

describe("dasm (ES5)", function() {
	test("is a function", function() {
		expect(typeof dasm).toBe("function");
	});

	test("compiles simple code (clock)", function() {
		var pathSrc = path.join(__dirname, "/roms/clock.asm");
		var pathOut = path.join(__dirname, "/roms/clock.out");
		var pathSym = path.join(__dirname, "/roms/clock.sym");
		var pathLst = path.join(__dirname, "/roms/clock.lst");

		// Read
		var src = fs.readFileSync(pathSrc, { encoding: "utf8" });
		expect(src.length).toEqual(15515);

		// Compile
		var result = dasm(src, { format: 3 });
		expect(result.output).toMatchSnapshot();

		// Check ROM
		var myOut = result.data;
		expect(myOut.length).toEqual(4096);

		var fileOut = fs.readFileSync(pathOut);
		expect(myOut).toEqual(bufferToArray(fileOut));

		// Check list
		var myLst = result.listRaw.split("\n");
		var fileLst = fs.readFileSync(pathLst, { encoding: "utf8" }).split("\n");
		expect(filterList(myLst)).toEqual(filterList(fileLst));
		expect(result.list).toMatchSnapshot();

		// Check symbols
		var mySym = result.symbolsRaw;
		var fileSym = fs.readFileSync(pathSym, { encoding: "utf8" });
		expect(mySym).toEqual(fileSym);
		expect(result.symbols).toMatchSnapshot();
	});
});
