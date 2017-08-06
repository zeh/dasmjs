/**
 * Resolve all file includes in the source
 */
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var INCLUDE_REGEXP = /^[^;\n]*[ \t]\binclude[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
var INCDIR_REGEXP = /^[^;\n]*[ \t]\bincdir[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
var INCBIN_REGEXP = /^[^;\n]*[ \t]\bincbin[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
;
function resolveIncludes(entrySource, getFile, baseDir, recursive) {
    if (baseDir === void 0) { baseDir = ""; }
    if (recursive === void 0) { recursive = true; }
    // All the base folders a file can have for included files
    var defaultDir = { line: -1, column: -1, value: "" };
    var includeDirs = [defaultDir].concat(searchInSource(entrySource, INCDIR_REGEXP)).map(function (includeDir) { return includeDir.value; });
    var textIncludes = searchInSource(entrySource, INCLUDE_REGEXP);
    var binaryIncludes = searchInSource(entrySource, INCBIN_REGEXP);
    var includes = [];
    includes = includes.concat(textIncludes.map(function (textInclude) {
        return createIncludeFromSearchResult(textInclude, false, baseDir, recursive, includeDirs, getFile);
    }));
    includes = includes.concat(binaryIncludes.map(function (binaryInclude) {
        return createIncludeFromSearchResult(binaryInclude, true, baseDir, recursive, includeDirs, getFile);
    }));
    return includes;
}
exports.default = resolveIncludes;
;
/**
 * Based on a search result, create an include file
 */
function createIncludeFromSearchResult(include, isBinary, baseDir, recursive, includeDirs, getFile) {
    var uri;
    var contents;
    for (var _i = 0, includeDirs_1 = includeDirs; _i < includeDirs_1.length; _i++) {
        var includeDir = includeDirs_1[_i];
        uri = path.posix.join(baseDir, includeDir, include.value);
        contents = uri && getFile ? getFile(uri, isBinary) : undefined;
        if (contents) {
            break;
        }
    }
    // Also parse the include file's own includes
    var childIncludes = [];
    if (recursive && uri && getFile && typeof (contents) === "string") {
        childIncludes = childIncludes.concat(resolveIncludes(contents, getFile, path.posix.dirname(uri), recursive));
    }
    return {
        line: include.line,
        column: include.column,
        entryRelativeUri: include.value,
        parentRelativeUri: uri ? uri : include.value,
        isBinary: isBinary,
        includes: childIncludes,
        contents: contents ? contents : undefined,
    };
}
/**
 * Search for a string in a source document and returns all results (line, column, and value)
 */
function searchInSource(source, regexp) {
    var results = [];
    var match = regexp.exec(source);
    var _loop_1 = function () {
        var newResult = findMatchResult(match);
        if (newResult && !results.some(function (result) { return result.value === newResult.value; })) {
            results.push(newResult);
        }
        match = regexp.exec(source);
    };
    while (match) {
        _loop_1();
    }
    return results;
}
/**
 * Returns the first capturing group found in RegExp results
 */
function findMatchResult(match) {
    if (match) {
        var value = match.find(function (possibleValue, index) { return typeof (index) === "number" && index > 0 && Boolean(possibleValue); });
        if (value) {
            // Also find where position of that specific match, searching within the result itself
            var fullMatch = match[0];
            var fullPos = match.index;
            // We are optimistically getting the match from the left;
            // this prevents false matches where the included file is called "include" too
            var valuePos = fullPos + fullMatch.lastIndexOf(value);
            // Convert the full position to a line and column
            var position = convertStringPosToLineColumn(match.input, valuePos);
            return {
                line: position.line,
                column: position.column,
                value: value,
            };
        }
    }
    return undefined;
}
/**
 * Given a string and a single char position, return the line and column in that string that the char position is
 */
function convertStringPosToLineColumn(source, position) {
    var LINE_REGEX = /(^)[\S\s]/gm;
    var line = 0;
    var column = 0;
    var lastPosition = 0;
    var match = LINE_REGEX.exec(source);
    while (match) {
        if (match.index > position) {
            column = position - lastPosition;
            break;
        }
        lastPosition = match.index;
        line++;
        match = LINE_REGEX.exec(source);
    }
    return {
        line: line,
        column: column,
    };
}
//# sourceMappingURL=resolveIncludes.js.map