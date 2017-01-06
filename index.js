var dasm = require("./lib/dasm.js");
var FILENAME_IN = "file.a";
var FILENAME_OUT = "file.out";
var FILENAME_LIST = "file.lst";
var FILENAME_SYMBOLS = "file.sym";

function logLine(s) {
	log.push(s);
}

function logErrorLine(s) {
	log.push("[ERROR] " + s);
}

function parseSymbols(symbolsFile) {
	var symbols = [];
	if (symbolsFile) {
		var lines = symbolsFile.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.length === 47 && line.substr(0, 3) !== "---") {
				var value = line.substr(25, 4).trim();
				var isLabel = value.substr(0, 1) === "f";
				var flags = line.substr(44, 2).trim();
				symbols.push({
					name: line.substr(0, 25).trim(),
					isLabel: isLabel,
					isConstant: !isLabel,
					value: parseInt(isLabel ? value.substr(1) : value),
					wasReferenced: Boolean(flags.match(/r/i)),
					wasPseudoOpCreated: Boolean(flags.match(/s/i)),
				});
			}
		}
	}
	return symbols;
}

var options = {
	noInitialRun: true,
	print: logLine,
	printErr: logErrorLine,
	// Also available: preInit, preRun
};

var Module = dasm.DASM(options);
var FS = Module ? Module['FS'] : undefined;
var log = [];
var logErrors = [];

module.exports = function(src, options) {
	options = options || {};

	// Prepare vars
	log = [];

	// Prepare source
	var src = arguments[0];
	FS.writeFile(FILENAME_IN, src);

	// Prepare argument list
	var args = [];
	var isQuick = options.hasOwnProperty("quick") && options.quick;
	args.push("-o" + FILENAME_OUT);
	if (options.hasOwnProperty("format")) {
		args.push("-f" + options.format);
	} else {
		args.push("-f3");
	}
	if (!isQuick) {
		args.push("-L" + FILENAME_LIST);
		args.push("-s" + FILENAME_SYMBOLS);
	}

	// Finally, call it
	Module.callMain([FILENAME_IN].concat(args));
	return {
		data: Module.FS.readFile(FILENAME_OUT),
		output: log.concat(),
		list: isQuick ? undefined : Module.FS.readFile(FILENAME_LIST, { encoding: "utf8" }),
		symbols: isQuick ? undefined : parseSymbols(Module.FS.readFile(FILENAME_SYMBOLS, { encoding: "utf8" })),
	};
}
