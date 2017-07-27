/**
 * Resolve all file includes in the source
 */

import * as path from "path";

const INCLUDE_REGEXP = /^[^;\n]*[ \t]\binclude[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
const INCDIR_REGEXP = /^[^;\n]*[ \t]\bincdir[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
const INCBIN_REGEXP = /^[^;\n]*[ \t]\bincbin[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;

import { IIncludeInfo } from "./index";

interface ISearchResult {
	line: number;
	column: number;
	value: string;
};

export type IGefFileFunc = (entryRelativeUri: string, isBinary:boolean) => string|Uint8Array|undefined;

export default function resolveIncludes(entrySource:string, getFile?:IGefFileFunc, baseDir:string = ""):IIncludeInfo[] {
	// All the base folders a file can have for included files
	const defaultDir = { line: -1, column: -1, value: "" };
	const includeDirs = [ defaultDir, ...searchInSource(entrySource, INCDIR_REGEXP)].map((includeDir) => includeDir.value);
	const textIncludes = searchInSource(entrySource, INCLUDE_REGEXP);
	const binaryIncludes = searchInSource(entrySource, INCBIN_REGEXP);

	let includes:IIncludeInfo[] = [];

	includes = includes.concat(textIncludes.map((textInclude) => {
		return createIncludeFromSearchResult(textInclude, false, baseDir, includeDirs, getFile);
	}));

	includes = includes.concat(binaryIncludes.map((binaryInclude) => {
		return createIncludeFromSearchResult(binaryInclude, true, baseDir, includeDirs, getFile);
	}));

	return includes;
};

/**
 * Based on a search result, create an include file
 */
function createIncludeFromSearchResult(include:ISearchResult, isBinary:boolean, baseDir:string, includeDirs:string[], getFile?:IGefFileFunc) {
	let uri:string|undefined;
	let contents:string|Uint8Array|undefined;

	for (const includeDir of includeDirs) {
		uri = path.join(baseDir, includeDir, include.value);
		contents = uri && getFile ? getFile(uri, isBinary) : undefined;
		if (contents) {
			break;
		}
	}

	// Also parse the include file's own includes
	const childIncludes = getFile && contents && typeof(contents) === "string" ? resolveIncludes(contents, getFile, path.dirname(uri)) : [];

	return {
		line: include.line,
		column: include.column,
		entryRelativeUri: include.value,
		parentRelativeUri: uri ? uri : include.value,
		isBinary,
		includes: childIncludes,
		contents: contents ? contents : undefined,
	};
}

/**
 * Search for a string in a source document and returns all results (line, column, and value)
 */
function searchInSource(source:string, regexp:RegExp):ISearchResult[] {
	const results:ISearchResult[] = [];
	let match = regexp.exec(source);
	while (match) {
		const newResult = findMatchResult(match);
		if (newResult && !results.some((result) => result.value === newResult.value)) {
			results.push(newResult);
		}
		match = regexp.exec(source);
	}
	return results;
}

/**
 * Returns the first capturing group found in RegExp results
 */
function findMatchResult(match:RegExpExecArray|null):ISearchResult|undefined {
	if (match) {
		const value = match.find((possibleValue, index) => typeof(index) === "number" && index > 0 && Boolean(possibleValue));
		if (value) {
			// Also find where position of that specific match, searching within the result itself
			const fullMatch = match[0];
			const fullPos = match.index;
			// We are optimistically getting the match from the left;
			// this prevents false matches where the included file is called "include" too
			const valuePos = fullPos + fullMatch.lastIndexOf(value);
			// Convert the full position to a line and column
			const position = convertStringPosToLineColumn(match.input, valuePos);
			return {
				line: position.line,
				column: position.column,
				value,
			};
		}
	}
	return undefined;
}

/**
 * Given a string and a single char position, return the line and column in that string that the char position is
 */
function convertStringPosToLineColumn(source:string, position:number) {
	const LINE_REGEX = /(^)[\S\s]/gm;
	let line = 0;
	let column = 0;
	let lastPosition = 0;
	let match = LINE_REGEX.exec(source);
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
		line,
		column,
	};
}
