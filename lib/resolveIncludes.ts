/**
 * Resolve all file includes in the source
 */

const INCLUDE_REGEXP = /[ \t]\binclude[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
const INCDIR_REGEXP = /[ \t]\bincdir[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;
const INCBIN_REGEXP = /[ \t]\bincbin[ \t]+(?:"([^;"\n]+?)"|'([^;'\n]+?)'|([^ ;'"\n]+)\b)/gmi;

import { IIncludeInfo } from "./index";

interface ISearchResult {
	line: number;
	column: number;
	value: string;
};

export default function(entrySource:string, getFile:(entryRelativeUri: string, isBinary: boolean) => string|undefined):IIncludeInfo[] {
	// All the base folders a file can have for included files
	const defaultDir = { line: -1, column: -1, value: "" };
	const incDirs = [ defaultDir, ...searchInSource(entrySource, INCDIR_REGEXP)];
	const textIncludes = searchInSource(entrySource, INCLUDE_REGEXP);
	const binaryIncludes = searchInSource(entrySource, INCBIN_REGEXP);

	let includes:IIncludeInfo[] = [];

	includes = includes.concat(textIncludes.map((textInclude) => {
		let uri:string|undefined;
		let contents:string|undefined;

		for (const incDir of incDirs) {
			uri = incDir.value + (incDir.value.length > 0 ? "/" : "") + textInclude.value;
			contents = getFile(uri, false);
			if (contents) {
				break;
			}
		}

		return {
			line: textInclude.line,
			column: textInclude.column,
			entryRelativeUri: textInclude.value,
			parentRelativeUri: uri ? uri : textInclude.value,
			isBinary: false,
			includes: [],
			contents: contents ? contents : undefined,
		};
	}));

	return includes;
};

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
		const value = match.find((value, index) => typeof(index) === "number" && index > 0 && Boolean(value));
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
