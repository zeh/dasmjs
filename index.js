const dasm = require("./lib/dasm.js");

function print(s) {
	console.log("[DASM] ", s);
}
function printErr(s) {
	console.error("[DASM] ", s);
}

function preRun() {
//	console.log("[TEST] [PRE RUN]");
}

var options = {
	noInitialRun: true,
	print: print,
	printErr: printErr,
	preRun: preRun,
	//arguments: ["_test.asm"],
	//preInit func
};

var Module = dasm.DASM(options);
var FS = Module ? Module['FS'] : undefined;

module.exports = function() {
	var src = arguments[0];
	var filename = "in.a";
	FS.writeFile(filename, src);
	var args = [filename].concat(Array.prototype.slice.call(arguments).slice(1));
	return Module;
}
