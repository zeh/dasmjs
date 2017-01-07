var dasm = require("./dasm");
// Configuration constants
var FILENAME_IN = "file.a";
var FILENAME_OUT = "file.out";
var FILENAME_LIST = "file.lst";
var FILENAME_SYMBOLS = "file.sym";
// Variables used
var moduleOptions = {
    noInitialRun: true,
    print: logLine,
    printErr: logErrorLine,
    noExitRuntime: true,
};
var Module = dasm.DASM(moduleOptions);
var log = [];
// Methods and functions
function logLine(s) {
    log.push(s);
}
function logErrorLine(s) {
    log.push("[ERROR] " + s);
}
function parseList(listFile) {
    return listFile;
}
function parseSymbols(symbolsFile) {
    var symbols = [];
    var lines = symbolsFile.split("\n");
    lines.forEach(function (line) {
        if (line.length === 47 && line.substr(0, 3) !== "---") {
            var value = line.substr(25, 4).trim();
            var isLabel = value.substr(0, 1) === "f";
            var flags = line.substr(44, 2).trim();
            symbols.push({
                name: line.substr(0, 25).trim(),
                isLabel: isLabel,
                isConstant: !isLabel,
                value: parseInt(isLabel ? value.substr(1) : value, 16),
                wasReferenced: Boolean(flags.match(/r/i)),
                wasPseudoOpCreated: Boolean(flags.match(/s/i)),
            });
        }
    });
    return symbols;
}
// Final export
function default_1(src, options) {
    if (options === void 0) { options = {}; }
    // Prepare vars
    log.length = 0;
    // Prepare source
    Module.FS.writeFile(FILENAME_IN, src);
    // Prepare argument list
    var args = [];
    args.push("-o" + FILENAME_OUT);
    if (options.format) {
        args.push("-f" + options.format);
    }
    if (!options.quick) {
        args.push("-l" + FILENAME_LIST);
        args.push("-s" + FILENAME_SYMBOLS);
    }
    // Finally, call it
    Module.callMain([FILENAME_IN].concat(args));
    // Get other output files
    var listFile = options.quick ? undefined : Module.FS.readFile(FILENAME_LIST, { encoding: "utf8" });
    var symbolsFile = options.quick ? undefined : Module.FS.readFile(FILENAME_SYMBOLS, { encoding: "utf8" });
    // Return results
    return {
        data: Module.FS.readFile(FILENAME_OUT),
        output: log.concat(),
        list: listFile ? parseList(listFile) : undefined,
        listRaw: listFile,
        symbols: symbolsFile ? parseSymbols(symbolsFile) : undefined,
        symbolsRaw: symbolsFile,
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=index.js.map