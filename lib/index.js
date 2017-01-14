var dasm = require("./dasm");
// Configuration constants
var FILENAME_IN = "file.a";
var FILENAME_OUT = "file.out";
var FILENAME_LIST = "file.lst";
var FILENAME_SYMBOLS = "file.sym";
// Variables used
var Module;
var didCompile = false;
var log = [];
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
    var unknownFind = /^\s*[0-9]+\s*[0-9A-Fa-f]{4,5}\s\?{4}/;
    var addressFind = /^\s*[0-9]+\s*([0-9A-Fa-fU]{4,5})/;
    var commentFind = /;(.*)$/;
    var byteCodeFind = /^.*\t\t *([0-9a-fA-F ]+)\t/;
    var commandFind = /.*?\t\t.*?\t([^;]*)/;
    var errorFind = /^[\w\.]* \(([0-9]+)\): error: (.*)/;
    var abortFind = /^Aborting assembly/;
    var breakingErrors = [];
    var lineOffset = 0;
    var currentLine = 1;
    rawLines.forEach(function (rawLine) {
        if (rawLine && !rawLine.match(metaFind)) {
            // Default values
            var lineNumber = currentLine + lineOffset;
            var errorMessage = undefined;
            var address = -1;
            var comment = undefined;
            var bytes = undefined;
            var command = undefined;
            var skip = false;
            var wasBreakingError = false;
            // First, catch errors
            var errorMatches = rawLine.match(errorFind);
            if (errorMatches) {
                errorMessage = errorMatches[2];
                lineNumber = parseInt(errorMatches[1], 10);
                didCompile = false;
                wasBreakingError = true;
                lineOffset--;
            }
            else if (rawLine.match(abortFind)) {
                didCompile = false;
                skip = true;
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
            if (!skip) {
                var newLine = {
                    number: lineNumber,
                    address: address,
                    bytes: bytes,
                    raw: rawLine,
                    errorMessage: errorMessage,
                    comment: comment,
                    command: command,
                };
                if (wasBreakingError) {
                    breakingErrors.push(newLine);
                }
                else {
                    lines.push(newLine);
                }
            }
            currentLine++;
        }
    });
    // Merge breaking errors with their lines
    lines = mergeLinesWithGlobalErrors(lines, breakingErrors);
    return lines;
}
function mergeLinesWithGlobalErrors(lines, errorLines) {
    var newLines = [];
    errorLines.forEach(function (error) {
        var errorLine = lines.find(function (line) { return line.number === error.number; });
        if (errorLine) {
            errorLine.errorMessage = error.errorMessage;
        }
        else {
            // No line, will create one
            newLines.push(error);
        }
    });
    // Merges errors with no proper lines
    return lines.concat(newLines);
}
function parseListFromOutput(listLines, outputLines) {
    // Adds messages from the output to the line-based list
    var newLines = [];
    var warningFind = /^Warning: (.*)/;
    var unresolvedSymbolStartFind = /^--- Unresolved Symbol List/;
    var unresolvedSymbolEndFind = /^--- [0-9]+ Unresolved Symbol/;
    var unresolvedSymbolFind = /^(.*?)\s/;
    var fileNotFoundErrorFind = /Unable to open '(.*)'$/;
    var isListingUnresolvedSymbols = false;
    outputLines.forEach(function (outputLine) {
        var errorMessage = undefined;
        var lineNumber = 0;
        var lineNumbers = [];
        if (isListingUnresolvedSymbols) {
            var unresolvedSymbolEndMatches = outputLine.match(unresolvedSymbolEndFind);
            if (unresolvedSymbolEndMatches) {
                // List of unresolved symbols - END
                isListingUnresolvedSymbols = false;
            }
            else {
                // Unresolved symbol
                var unresolvedSymbolMatches = outputLine.match(unresolvedSymbolFind);
                if (unresolvedSymbolMatches) {
                    var symbolName = unresolvedSymbolMatches[1];
                    // Injected error message
                    errorMessage = "Undefined Symbol '" + symbolName + "'";
                    lineNumber = findStringInLines(listLines, symbolName);
                    while (lineNumber > 0) {
                        lineNumbers.push(lineNumber);
                        lineNumber = findStringInLines(listLines, symbolName, lineNumber);
                    }
                }
            }
        }
        else {
            var unresolvedSymbolStartMatches = outputLine.match(unresolvedSymbolStartFind);
            if (unresolvedSymbolStartMatches) {
                // List of unresolved symbols - START
                isListingUnresolvedSymbols = true;
            }
            else {
                // Warnings
                var warningMatches = outputLine.match(warningFind);
                if (warningMatches) {
                    errorMessage = warningMatches[1];
                    var fileMatch = errorMessage.match(fileNotFoundErrorFind);
                    if (fileMatch) {
                        lineNumber = findStringInLines(listLines, fileMatch[1]);
                    }
                }
            }
        }
        if (errorMessage) {
            var newLine_1 = {
                number: lineNumber > -1 ? lineNumber : 0,
                address: -1,
                bytes: undefined,
                raw: outputLine,
                errorMessage: errorMessage,
                comment: undefined,
                command: undefined,
            };
            if (lineNumbers.length > 0) {
                // Applies to more than one line
                lineNumbers.forEach(function (lineNumberItem) {
                    newLines.push(Object.assign({}, newLine_1, { number: lineNumberItem }));
                });
            }
            else {
                // Just one line
                newLines.push(newLine_1);
            }
        }
    });
    // Merge global errors with their lines
    return listLines ? mergeLinesWithGlobalErrors(listLines, newLines) : newLines;
}
function findStringInLines(lines, needle, startLine) {
    if (startLine === void 0) { startLine = 0; }
    if (!lines)
        return -1;
    for (var i = startLine; i < lines.length; i++) {
        if (lines[i].raw && lines[i].raw.indexOf(needle) > -1)
            return lines[i].number;
    }
    return -1;
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
function fileExists(FS, path) {
    var stream;
    try {
        stream = FS.open(path, "r");
    }
    catch (e) {
        return false;
    }
    FS.close(stream);
    return true;
}
/*
// For testing purposes
function showDirectory() {
    console.log(logDir(Module.FS.lookupPath("/", {}).node, 0));
}

function logDir(node, level) {
    const spaces = "                             ";
    let str = node.name;
    if (level < 6) {
        //str += "\n" + typeof(node.contents);
        if (!(node.contents instanceof Uint8Array)) {
            for (var ff in node.contents) {
                str += "\n" + logDir(node.contents[ff], level + 1);
            }
        }
    }
    return spaces.substr(0, level * 2) + str;
}
*/
// Final export
function default_1(src, options) {
    if (options === void 0) { options = {}; }
    // Prepare vars
    log.length = 0;
    didCompile = true;
    var moduleOptions = {
        noInitialRun: true,
        print: logLine,
        printErr: logErrorLine,
        ENVIRONMENT: "WEB",
    };
    Module = dasm.DASM(Object.assign({}, moduleOptions));
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
    if (options.machine) {
        args.push("-I" + "/machines/" + options.machine + "/");
    }
    // Include files as needed
    if (options.includes) {
        for (var fileName in options.includes) {
            Module.FS.writeFile(fileName, options.includes[fileName]);
        }
    }
    // Finally, call it
    try {
        Module.callMain([FILENAME_IN].concat(args));
    }
    catch (e) {
        // Fatal error: impossible to determine why
        didCompile = false;
        console.error("Fatal error when calling module", e);
    }
    // Get other output files
    var listFile = undefined;
    var symbolsFile = undefined;
    if (!options.quick) {
        if (fileExists(Module.FS, FILENAME_SYMBOLS))
            symbolsFile = Module.FS.readFile(FILENAME_SYMBOLS, { encoding: "utf8" });
        if (fileExists(Module.FS, FILENAME_LIST))
            listFile = Module.FS.readFile(FILENAME_LIST, { encoding: "utf8" });
    }
    // The list can also include injected data from the output
    var list = listFile ? parseList(listFile) : undefined;
    if (list) {
        list = parseListFromOutput(list, log);
    }
    // Return results
    return {
        data: fileExists(Module.FS, FILENAME_OUT) ? (Module.FS.readFile(FILENAME_OUT)) : new Uint8Array(0),
        output: log.concat(),
        list: list,
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