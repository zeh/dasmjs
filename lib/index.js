Object.defineProperty(exports, "__esModule", { value: true });
var dasm = require("./dasm");
// Re-exports
var resolveIncludes_1 = require("./resolveIncludes");
exports.resolveIncludes = resolveIncludes_1.default;
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
    var rawLinesOriginal = listFile.split("\n");
    var rawLines = rawLinesOriginal.map(function (line) { return convertTabsToSpaces(line); });
    var metaFileFind = /^------- FILE\s(.+?)(\s|$)/;
    var lineNumberFind = /^\s+([0-9]+)\s/;
    var unknownFind = /^\s*[0-9]+\s*[0-9A-Fa-fUuDd%]{4,5}\s\?{4}/;
    var addressFind = /^.{7} ([ 0-9A-Fa-fUuDd%]{5})/;
    var commentFind = /;(.*)$/;
    var byteCodeFind = /^[^;]{30} ([0-9a-fFuUdD% ]{8})/;
    var commandFind = /^([^;]*)/;
    var errorFind = /^[\w\.]* \(([0-9]+)\): error: (.*)/;
    var abortFind = /^Aborting assembly/;
    var breakingErrors = [];
    var currentLine = -1;
    var filename = undefined;
    rawLines.forEach(function (rawLine, index) {
        var rawLineOriginal = rawLinesOriginal[index];
        if (rawLine) {
            var metaFileMatches = rawLine.match(metaFileFind);
            if (metaFileMatches) {
                // File start
                filename = metaFileMatches[1];
                if (filename === FILENAME_IN)
                    filename = undefined;
            }
            else {
                // Default values
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
                    currentLine = parseInt(errorMatches[1], 10);
                    didCompile = false;
                    wasBreakingError = true;
                }
                else if (rawLine.match(abortFind)) {
                    didCompile = false;
                    skip = true;
                }
                else {
                    // If not, parse properly
                    // Current line
                    var lineNumberMatches = rawLine.match(lineNumberFind);
                    if (lineNumberMatches) {
                        currentLine = parseInt(lineNumberMatches[1], 10);
                    }
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
                    var commandMatches = substrWithTabSpaces(rawLineOriginal, 43).match(commandFind);
                    if (commandMatches) {
                        command = commandMatches[1];
                        if (!command.trim())
                            command = undefined;
                    }
                }
                if (!skip) {
                    var newLine = {
                        number: currentLine,
                        filename: filename,
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
            }
        }
    });
    // Merge breaking errors with their lines
    lines = mergeLinesWithGlobalErrors(lines, breakingErrors);
    return lines;
}
function substrWithTabSpaces(text, start, length) {
    if (length === void 0) { length = -1; }
    // Returns a sub-string of the a string, but counting outside tabs as spaces in a similar fashion to convertTabsToSpaces()
    var pos = 0;
    var char = 0;
    while (pos < start) {
        if (text.charAt(char) === "\t") {
            pos += 8 - (pos % 8);
        }
        else {
            pos += 1;
        }
        char++;
    }
    return length < 0 ? text.substr(char) : text.substr(char, length);
}
function convertTabsToSpaces(line) {
    // The list file uses a strange format where it replaces 8 spaces with a tab whenever it needs to jump forward
    // The catch is that if there's one char + 7 spaces, it still uses a tab since it tabs relative to column positions
    var newLine = line;
    var pos = newLine.indexOf("\t");
    while (pos > -1) {
        var numSpaces = 8 - (pos % 8);
        newLine = newLine.substr(0, pos) + (("        ").substr(0, numSpaces)) + newLine.substr(pos + 1);
        pos = newLine.indexOf("\t");
    }
    return newLine;
}
function mergeLinesWithGlobalErrors(lines, errorLines) {
    var newLines = [];
    errorLines.forEach(function (error) {
        var errorLine = lines.find(function (line) { return line.number === error.number && line.filename === error.filename; });
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
        var lineNumber = -1;
        var lineNumbers = [];
        var filename = undefined;
        var filenames = [];
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
                    var lineIndex = findStringInLines(listLines, symbolName);
                    while (lineIndex > -1) {
                        lineNumbers.push(listLines[lineIndex].number);
                        filenames.push(listLines[lineIndex].filename);
                        lineIndex = findStringInLines(listLines, symbolName, lineIndex + 1);
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
                        var lineIndex = findStringInLines(listLines, fileMatch[1]);
                        if (lineIndex > -1) {
                            lineNumber = listLines[lineIndex].number;
                            filename = listLines[lineIndex].filename;
                        }
                    }
                }
            }
        }
        if (errorMessage) {
            var newLine_1 = {
                number: lineNumber,
                filename: filename,
                address: -1,
                bytes: undefined,
                raw: outputLine,
                errorMessage: errorMessage,
                comment: undefined,
                command: undefined,
            };
            if (lineNumbers.length > 0) {
                // Applies to more than one line
                lineNumbers.forEach(function (lineNumberItem, index) {
                    newLines.push(Object.assign({}, newLine_1, {
                        number: lineNumberItem,
                        filename: filenames[index],
                    }));
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
function findStringInLines(lines, needle, startLineIndex) {
    if (startLineIndex === void 0) { startLineIndex = 0; }
    if (!lines)
        return -1;
    var commentStart;
    var lineRaw;
    for (var i = startLineIndex; i < lines.length; i++) {
        lineRaw = lines[i].raw;
        if (lineRaw) {
            commentStart = lineRaw.indexOf(";");
            if (commentStart > -1)
                lineRaw = lineRaw.substr(0, commentStart);
            if (lineRaw.indexOf(needle) > -1)
                return i;
        }
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
    value = value.trim().toLowerCase();
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
function parseSymbols(symbolsFile, list) {
    var symbols = [];
    var lines = symbolsFile.split("\n");
    lines.forEach(function (line) {
        if (line.length === 47 && line.substr(0, 3) !== "---") {
            var name_1 = line.substr(0, 25).trim();
            var value = line.substr(25, 4).trim();
            var isLabel = value.substr(0, 1) === "f";
            var flags = line.substr(44, 2).trim();
            var definitionFilename = undefined;
            var definitionLineNumber = -1;
            var definitionColumnStart = -1;
            var definitionColumnEnd = -1;
            if (list) {
                var definitionLine = list.find(function (listLine) { return listLine.command !== undefined && listLine.command.trim().startsWith(name_1); });
                if (definitionLine) {
                    definitionFilename = definitionLine.filename;
                    definitionLineNumber = definitionLine.number;
                    definitionColumnStart = definitionLine.command ? definitionLine.command.indexOf(name_1) : -1;
                    definitionColumnEnd = definitionColumnStart > -1 ? definitionColumnStart + name_1.length : -1;
                }
            }
            symbols.push({
                name: name_1,
                isLabel: isLabel,
                isConstant: !isLabel,
                value: parseInt(isLabel ? value.substr(1) : value, 16),
                wasReferenced: Boolean(flags.match(/r/i)),
                wasPseudoOpCreated: Boolean(flags.match(/s/i)),
                definitionFilename: definitionFilename,
                definitionLineNumber: definitionLineNumber,
                definitionColumnStart: definitionColumnStart,
                definitionColumnEnd: definitionColumnEnd,
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
function createFile(FS, path, contents, isBinary) {
    if (isBinary === void 0) { isBinary = false; }
    try {
        var folders = path.split("/");
        for (var i = 0; i < folders.length - 1; i++) {
            FS.mkdir(folders.slice(0, i + 1).join("/"));
        }
        FS.writeFile(path, contents, { encoding: isBinary ? "binary" : "utf8" });
    }
    catch (e) {
        console.error("Error writing file " + path, e);
    }
}
function createIncludeFiles(includes) {
    for (var _i = 0, includes_1 = includes; _i < includes_1.length; _i++) {
        var include = includes_1[_i];
        createFile(Module.FS, include.entryRelativeUri, include.contents, include.isBinary);
        createIncludeFiles(include.includes);
    }
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
        if (Array.isArray(options.includes)) {
            // Arrays of IInclude
            createIncludeFiles(options.includes);
        }
        else {
            // Object with key uri:value contents
            for (var fileName in options.includes) {
                var content = options.includes[fileName];
                createFile(Module.FS, fileName, content, typeof (content) !== "string");
            }
        }
        // showDirectory();
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
        symbols: symbolsFile ? parseSymbols(symbolsFile, list ? list : []) : undefined,
        symbolsRaw: symbolsFile,
        exitStatus: Module.getStatus(),
        success: didCompile,
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map