import * as dasm from "./dasm";

// Re-exports

export { default as resolveIncludes } from "./resolveIncludes";


// Configuration constants

const FILENAME_IN = "file.a";
const FILENAME_OUT = "file.out";
const FILENAME_LIST = "file.lst";
const FILENAME_SYMBOLS = "file.sym";


// Variables used

let Module:any;
let didCompile:boolean = false;
const log:string[] = [];


// Interfaces

export interface IOptions {
	quick?: boolean;
	format?: "1"|"2"|"3"|1|2|3;
	parameters?: string;
	machine?: "atari2600"|"channel-f";
	includes?: { [key:string]:string; };
}

export interface ISymbol {
	name: string;
	isLabel: boolean;
	isConstant: boolean;
	value: number;
	wasReferenced: boolean;
	wasPseudoOpCreated: boolean;
	definitionFilename?: string;
	definitionLineNumber: number;
	definitionColumnStart: number;
	definitionColumnEnd: number;
}

export interface ILine {
	number: number;
	filename?: string;
	address: number;
	bytes?: Uint8Array;
	raw: string;
	errorMessage?: string;
	comment?: string;
	command?: string;
}

export interface IIncludeInfo {
	line: number; // 0-based
	column: number;
	entryRelativeUri: string;
	parentRelativeUri: string;
	isBinary: boolean;
	includes: IIncludeInfo[];
	contents?: string|Uint8Array|undefined;
}


// Methods and functions

function logLine(s:string) {
	log.push(s);
}

function logErrorLine(s:string) {
	logLine("[ERROR] " + s);
}

function parseList(listFile:string):ILine[] {
	let lines:ILine[] = [];
	const rawLinesOriginal = listFile.split("\n");
	const rawLines = rawLinesOriginal.map((line) => convertTabsToSpaces(line));
	const metaFileFind = /^------- FILE\s(.+?)(\s|$)/;
	const lineNumberFind = /^\s+([0-9]+)\s/;
	const unknownFind = /^\s*[0-9]+\s*[0-9A-Fa-fUuDd%]{4,5}\s\?{4}/;
	const addressFind = /^.{7} ([ 0-9A-Fa-fUuDd%]{5})/;
	const commentFind = /;(.*)$/;
	const byteCodeFind = /^[^;]{30} ([0-9a-fFuUdD% ]{8})/;
	const commandFind = /^([^;]*)/;
	const errorFind = /^[\w\.]* \(([0-9]+)\): error: (.*)/;
	const abortFind = /^Aborting assembly/;
	const breakingErrors:ILine[] = [];
	let currentLine:number = -1;
	let filename:string|undefined = undefined;
	rawLines.forEach((rawLine, index) => {
		const rawLineOriginal = rawLinesOriginal[index];

		if (rawLine) {
			const metaFileMatches = rawLine.match(metaFileFind);
			if (metaFileMatches) {
				// File start
				filename = metaFileMatches[1] as string;
				if (filename === FILENAME_IN) filename = undefined;
			} else {
				// Default values
				let errorMessage = undefined;
				let address = -1;
				let comment = undefined;
				let bytes = undefined;
				let command = undefined;
				let skip = false;
				let wasBreakingError = false;

				// First, catch errors
				const errorMatches:any = rawLine.match(errorFind);
				if (errorMatches) {
					errorMessage = errorMatches[2] as string;
					currentLine = parseInt(errorMatches[1] as string, 10);
					didCompile = false;
					wasBreakingError = true;
				} else if (rawLine.match(abortFind)) {
					didCompile = false;
					skip = true;
				} else {
					// If not, parse properly

					// Current line
					const lineNumberMatches = rawLine.match(lineNumberFind);
					if (lineNumberMatches) {
						currentLine = parseInt(lineNumberMatches[1] as string, 10);
					}

					// Address
					if (!rawLine.match(unknownFind)) {
						// Known location
						address = parseNumber(((rawLine.match(addressFind) as any)[1] as string));
					}

					// Comment
					const commentMatches = rawLine.match(commentFind);
					if (commentMatches) {
						comment = commentMatches[1] as string;
					}

					// Bytes
					let byteMatches = rawLine.match(byteCodeFind);
					if (byteMatches) {
						bytes = parseBytes((byteMatches[1] as string));
					}

					// Commands
					let commandMatches = substrWithTabSpaces(rawLineOriginal, 43).match(commandFind);
					if (commandMatches) {
						command = commandMatches[1] as string;
						if (!command.trim()) command = undefined;
					}
				}

				if (!skip) {
					const newLine = {
						number: currentLine,
						filename,
						address,
						bytes,
						raw: rawLine,
						errorMessage,
						comment,
						command,
					};

					if (wasBreakingError) {
						breakingErrors.push(newLine);
					} else {
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

function substrWithTabSpaces(text:string, start:number, length:number = -1) {
	// Returns a sub-string of the a string, but counting outside tabs as spaces in a similar fashion to convertTabsToSpaces()
	let pos = 0;
	let char = 0;
	while (pos < start) {
		if (text.charAt(char) === "\t") {
			pos += 8 - (pos % 8);
		} else {
			pos += 1;
		}
		char++;
	}

	return length < 0 ? text.substr(char) : text.substr(char, length);
}

function convertTabsToSpaces(line:string) {
	// The list file uses a strange format where it replaces 8 spaces with a tab whenever it needs to jump forward
	// The catch is that if there's one char + 7 spaces, it still uses a tab since it tabs relative to column positions
	let newLine = line;
	let pos = newLine.indexOf("\t");
	while (pos > -1) {
		const numSpaces = 8 - (pos % 8);
		newLine = newLine.substr(0, pos) + (("        ").substr(0, numSpaces)) + newLine.substr(pos + 1);
		pos = newLine.indexOf("\t");
	}
	return newLine;
}

function mergeLinesWithGlobalErrors(lines:ILine[], errorLines:ILine[]) {
	const newLines:ILine[] = [];
	errorLines.forEach((error) => {
		const errorLine = lines.find((line) => line.number === error.number && line.filename === error.filename);
		if (errorLine) {
			errorLine.errorMessage = error.errorMessage;
		} else {
			// No line, will create one
			newLines.push(error);
		}
	});

	// Merges errors with no proper lines
	return lines.concat(newLines);
}

function parseListFromOutput(listLines:ILine[], outputLines:string[]):ILine[] {
	// Adds messages from the output to the line-based list
	let newLines:ILine[] = [];
	const warningFind = /^Warning: (.*)/;
	const unresolvedSymbolStartFind = /^--- Unresolved Symbol List/;
	const unresolvedSymbolEndFind = /^--- [0-9]+ Unresolved Symbol/;
	const unresolvedSymbolFind = /^(.*?)\s/;
	const fileNotFoundErrorFind = /Unable to open '(.*)'$/;
	let isListingUnresolvedSymbols = false;
	outputLines.forEach((outputLine) => {
		let errorMessage = undefined;
		let lineNumber = -1;
		let lineNumbers:number[] = [];
		let filename:string|undefined = undefined;
		let filenames:Array<string|undefined> = [];

		if (isListingUnresolvedSymbols) {
			const unresolvedSymbolEndMatches = outputLine.match(unresolvedSymbolEndFind);
			if (unresolvedSymbolEndMatches) {
				// List of unresolved symbols - END
				isListingUnresolvedSymbols = false;
			} else {
				// Unresolved symbol
				const unresolvedSymbolMatches = outputLine.match(unresolvedSymbolFind);
				if (unresolvedSymbolMatches) {
					const symbolName = unresolvedSymbolMatches[1] as string;
					// Injected error message
					errorMessage = "Undefined Symbol '" + symbolName + "'";
					let lineIndex = findStringInLines(listLines, symbolName);
					while (lineIndex > -1) {
						lineNumbers.push(listLines[lineIndex].number);
						filenames.push(listLines[lineIndex].filename);
						lineIndex = findStringInLines(listLines, symbolName, lineIndex + 1);
					}
				}
			}
		} else {
			const unresolvedSymbolStartMatches = outputLine.match(unresolvedSymbolStartFind);
			if (unresolvedSymbolStartMatches) {
				// List of unresolved symbols - START
				isListingUnresolvedSymbols = true;
			} else {
				// Warnings
				const warningMatches = outputLine.match(warningFind);
				if (warningMatches) {
					errorMessage = warningMatches[1] as string;
					const fileMatch = errorMessage.match(fileNotFoundErrorFind);
					if (fileMatch) {
						let lineIndex = findStringInLines(listLines, fileMatch[1] as string);
						if (lineIndex > -1) {
							lineNumber = listLines[lineIndex].number;
							filename = listLines[lineIndex].filename;
						}
					}
				}
			}
		}

		if (errorMessage) {
			const newLine = {
				number: lineNumber,
				filename,
				address: -1,
				bytes: undefined,
				raw: outputLine,
				errorMessage,
				comment: undefined,
				command: undefined,
			};
			if (lineNumbers.length > 0) {
				// Applies to more than one line
				lineNumbers.forEach((lineNumberItem, index) => {
					newLines.push(Object.assign({}, newLine, {
						number: lineNumberItem,
						filename: filenames[index],
					}));
				});
			} else {
				// Just one line
				newLines.push(newLine);
			}
		}
	});

	// Merge global errors with their lines
	return listLines ? mergeLinesWithGlobalErrors(listLines, newLines) : newLines;
}

function findStringInLines(lines:ILine[], needle:string, startLineIndex:number = 0) {
	if (!lines) return -1;

	let commentStart;
	let lineRaw;
	for (let i = startLineIndex; i < lines.length; i++) {
		lineRaw = lines[i].raw;
		if (lineRaw) {
			commentStart = lineRaw.indexOf(";");
			if (commentStart > -1) lineRaw = lineRaw.substr(0, commentStart);
			if (lineRaw.indexOf(needle) > -1) return i;
		}
	}

	return -1;
}

function parseBytes(value:string) {
	const values = value.split(" ");
	const bytes = new Uint8Array(values.length);
	values.forEach((byteValue, index) => {
		bytes[index] = parseInt(byteValue, 16);
	});
	return bytes;
}

function parseNumber(value:string) {
	value = value.trim().toLowerCase();
	const inValue = value.substr(1);
	if (value.substr(0, 1) === "0") {
		// Octal
		return parseInt(inValue, 8);
	} else if (value.substr(0, 1) === "%") {
		// Binary
		return parseInt(inValue, 2);
	} else if (value.substr(0, 1) === "u") {
		// Unsigned decimal integer (not documented?)
		return parseInt(inValue, 10);
	} else if (value.substr(0, 1) === "f") {
		// Hexadecimal (not documented?)
		return parseInt(inValue, 16);
	} else {
		console.warn("dasm list parsing error: number [" + value + "] could not be properly parsed with the known formats. Assuming decimal.");
		return parseInt(value, 10);
	}
}

function parseSymbols(symbolsFile:string, list:ILine[]):ISymbol[] {
	const symbols:ISymbol[] = [];
	const lines = symbolsFile.split("\n");
	lines.forEach((line) => {
		if (line.length === 47 && line.substr(0, 3) !== "---") {
			const name = line.substr(0, 25).trim();
			const value = line.substr(25, 4).trim();
			const isLabel = value.substr(0, 1) === "f";
			const flags = line.substr(44, 2).trim();
			let definitionFilename:string|undefined = undefined;
			let definitionLineNumber:number = -1;
			let definitionColumnStart:number = -1;
			let definitionColumnEnd:number = -1;
			if (list) {
				const definitionLine = list.find((listLine) => listLine.command !== undefined && listLine.command.trim().startsWith(name));
				if (definitionLine) {
					definitionFilename = definitionLine.filename;
					definitionLineNumber = definitionLine.number;
					definitionColumnStart = definitionLine.command ? definitionLine.command.indexOf(name) : -1;
					definitionColumnEnd = definitionColumnStart > -1 ? definitionColumnStart + name.length : -1;
				}
			}
			symbols.push({
				name,
				isLabel,
				isConstant: !isLabel,
				value: parseInt(isLabel ? value.substr(1) : value, 16),
				wasReferenced: Boolean(flags.match(/r/i)),
				wasPseudoOpCreated: Boolean(flags.match(/s/i)),
				definitionFilename,
				definitionLineNumber,
				definitionColumnStart,
				definitionColumnEnd,
			});
		}

	});
	return symbols;
}

function fileExists(FS:any, path:string):boolean {
	let stream;
	try {
		stream = FS.open(path, "r");
	} catch (e) {
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

export default function(src:string, options:IOptions = {}) {
	// Prepare vars
	log.length = 0;
	didCompile = true;

	const moduleOptions = {
		noInitialRun: true,
		print: logLine,
		printErr: logErrorLine,
		ENVIRONMENT: "WEB",
		// Also available: preInit, preRun, postRun
	};

	Module = (dasm as any).DASM(Object.assign({}, moduleOptions));

	// Prepare source
	Module.FS.writeFile(FILENAME_IN, src);

	// Prepare argument list
	let args = [];
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
		for (let fileName in options.includes) {
			try {
				const folders = fileName.split("/");
				for (let i = 0; i < folders.length - 1; i++) {
					Module.FS.mkdir(folders.slice(0, i + 1).join("/"));
				}
				Module.FS.writeFile(fileName, options.includes[fileName]);
			} catch (e) {
				console.error("Error writing file " + fileName, e);
			}
		}
		// showDirectory();
	}

	// Finally, call it
	try {
		Module.callMain([FILENAME_IN].concat(args));
	} catch (e) {
		// Fatal error: impossible to determine why
		didCompile = false;
		console.error("Fatal error when calling module", e);
	}

	// Get other output files
	let listFile:string|undefined = undefined;
	let symbolsFile:string|undefined = undefined;
	if (!options.quick) {
		if (fileExists(Module.FS, FILENAME_SYMBOLS)) symbolsFile = Module.FS.readFile(FILENAME_SYMBOLS, { encoding: "utf8" });
		if (fileExists(Module.FS, FILENAME_LIST)) listFile = Module.FS.readFile(FILENAME_LIST, { encoding: "utf8" });
	}

	// The list can also include injected data from the output
	let list = listFile ? parseList(listFile) : undefined;
	if (list) {
		list = parseListFromOutput(list, log);
	}

	// Return results
	return {
		data: fileExists(Module.FS, FILENAME_OUT) ? (Module.FS.readFile(FILENAME_OUT)) as Uint8Array : new Uint8Array(0),
		output: log.concat(),
		list,
		listRaw: listFile,
		symbols: symbolsFile ? parseSymbols(symbolsFile, list ? list : []) : undefined,
		symbolsRaw: symbolsFile,
		exitStatus: Module.getStatus() as number,
		success: didCompile,
	};
}
