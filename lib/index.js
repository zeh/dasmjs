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
var didCompile = false;
// Methods and functions
function logLine(s) {
    log.push(s);
}
function logErrorLine(s) {
    logLine("[ERROR] " + s);
}
function parseList(listFile) {
    var lines = [];
    var rawLines = listFile.split("\n");
    var metaFind = /^------- /;
    var unknownFind = /^ *[0-9]+ *[0-9A-Fa-f]{4,5} \?{4}/;
    var addressFind = /^ *[0-9]+ *([0-9A-Fa-fU]{4,5})/;
    var commentFind = /;(.*)$/;
    var byteCodeFind = /^.*\t\t *([0-9a-fA-F ]+)\t/;
    var commandFind = /.*?\t\t.*?\t([^;]*)/;
    var errorFind = /^[\w\.]* \(([0-9]+)\): error: (.*)/;
    rawLines.forEach(function (rawLine) {
        if (rawLine && !rawLine.match(metaFind)) {
            // Default values
            var lineNumber = lines.length + 1;
            var errorMessage = undefined;
            var address = -1;
            var comment = undefined;
            var bytes = undefined;
            var command = undefined;
            // First, catch errors
            var errorMatches = rawLine.match(errorFind);
            if (errorMatches) {
                errorMessage = errorMatches[2];
                lineNumber = parseInt(errorMatches[1], 10);
                didCompile = false;
            }
            else {
                // If not, parse properly
                // Address
                if (!rawLine.match(unknownFind)) {
                    // Known location
                    address = parseNumber(rawLine.match(addressFind)[1]);
                }
                // Comment
                var commentMatches = rawLine.match(commentFind);
                if (commentMatches) {
                    comment = commentMatches[1];
                }
                // Bytes
                var byteMatches = rawLine.match(byteCodeFind);
                if (byteMatches) {
                    bytes = parseBytes(byteMatches[1]);
                }
                // Commands
                var commandMatches = rawLine.match(commandFind);
                if (commandMatches) {
                    command = commandMatches[1];
                    if (!command.trim())
                        command = undefined;
                }
            }
            lines.push({
                number: lineNumber,
                address: address,
                bytes: bytes,
                raw: rawLine,
                errorMessage: errorMessage,
                comment: comment,
                command: command,
            });
        }
    });
    return lines;
}
function parseBytes(value) {
    var values = value.split(" ");
    var bytes = new Uint8Array(values.length);
    values.forEach(function (byteValue, index) {
        bytes[index] = parseInt(byteValue, 16);
    });
    return bytes;
}
function parseNumber(value) {
    value = value.toLowerCase();
    var inValue = value.substr(1);
    if (value.substr(0, 1) === "0") {
        // Octal
        return parseInt(inValue, 8);
    }
    else if (value.substr(0, 1) === "%") {
        // Binary
        return parseInt(inValue, 2);
    }
    else if (value.substr(0, 1) === "u") {
        // Unsigned decimal integer (not documented?)
        return parseInt(inValue, 10);
    }
    else if (value.substr(0, 1) === "f") {
        // Hexadecimal (not documented?)
        return parseInt(inValue, 16);
    }
    else {
        console.warn("dasm list parsing error: number [" + value + "] could not be properly parsed with the known formats. Assuming decimal.");
        return parseInt(value, 10);
    }
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
    didCompile = true;
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
    if (options.parameters) {
        args = args.concat(options.parameters.split(" "));
    }
    // Include files as needed
    if (options.includes) {
        for (var fileName in options.includes) {
            Module.FS.writeFile(fileName, options.includes[fileName]);
        }
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
        exitStatus: Module.getStatus(),
        success: didCompile,
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=index.js.map