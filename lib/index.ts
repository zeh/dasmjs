import * as dasm from "./dasm";

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
}

export interface ILine {
	number: number;
	address: number;
	bytes: Uint8Array|undefined;
	raw: string;
	errorMessage: string|undefined;
	comment: string|undefined;
	command: string|undefined;
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
	const rawLines = listFile.split("\n");
	const metaFind = /^------- /;
	const unknownFind = /^\s*[0-9]+\s*[0-9A-Fa-f]{4,5}\s\?{4}/;
	const addressFind = /^\s*[0-9]+\s*([0-9A-Fa-fU]{4,5})/;
	const commentFind = /;(.*)$/;
	const byteCodeFind = /^.*\t\t *([0-9a-fA-F ]+)\t/;
	const commandFind = /.*?\t\t.*?\t([^;]*)/;
	const errorFind = /^[\w\.]* \(([0-9]+)\): error: (.*)/;
	const abortFind = /^Aborting assembly/;
	const breakingErrors:ILine[] = [];
	let lineOffset:number = 0;
	let currentLine:number = 1;
	rawLines.forEach((rawLine) => {
		if (rawLine && !rawLine.match(metaFind)) {
			// Default values
			let lineNumber = currentLine + lineOffset;
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
				lineNumber = parseInt(errorMatches[1] as string, 10);
				didCompile = false;
				wasBreakingError = true;
				lineOffset--;
			} else if (rawLine.match(abortFind)) {
				didCompile = false;
				skip = true;
			} else {
				// If not, parse properly
				// Address
				if (!rawLine.match(unknownFind)) {
					// Known location
					address = parseNumber(((rawLine.match(addressFind) as any)[1] as string));
				}

				// Comment
				const commentMatches:any = rawLine.match(commentFind);
				if (commentMatches) {
					comment = commentMatches[1] as string;
				}

				// Bytes
				let byteMatches:any = rawLine.match(byteCodeFind);
				if (byteMatches) {
					bytes = parseBytes((byteMatches[1] as string));
				}

				// Commands
				let commandMatches:any = rawLine.match(commandFind);
				if (commandMatches) {
					command = commandMatches[1] as string;
					if (!command.trim()) command = undefined;
				}
			}

			if (!skip) {
				const newLine = {
					number: lineNumber,
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

			currentLine++;
		}
	});

	// Merge breaking errors with their lines
	lines = mergeLinesWithGlobalErrors(lines, breakingErrors);

	return lines;
}

function mergeLinesWithGlobalErrors(lines:ILine[], errorLines:ILine[]) {
	const newLines:ILine[] = [];
	errorLines.forEach((error) => {
		const errorLine = lines.find((line) => line.number === error.number);
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

function parseListFromOutput(listLines:ILine[], outputLines:string[]) {
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
		let lineNumber = 0;
		let lineNumbers:number[] = [];

		if (isListingUnresolvedSymbols) {
			const unresolvedSymbolEndMatches:any = outputLine.match(unresolvedSymbolEndFind);
			if (unresolvedSymbolEndMatches) {
				// List of unresolved symbols - END
				isListingUnresolvedSymbols = false;
			} else {
				// Unresolved symbol
				const unresolvedSymbolMatches:any = outputLine.match(unresolvedSymbolFind);
				if (unresolvedSymbolMatches) {
					const symbolName = unresolvedSymbolMatches[1] as string;
					// Injected error message
					errorMessage = "Undefined Symbol '" + symbolName + "'";
					lineNumber = findStringInLines(listLines, symbolName);
					while (lineNumber > 0) {
						lineNumbers.push(lineNumber);
						lineNumber = findStringInLines(listLines, symbolName, lineNumber);
					}
				}
			}
		} else {
			const unresolvedSymbolStartMatches:any = outputLine.match(unresolvedSymbolStartFind);
			if (unresolvedSymbolStartMatches) {
				// List of unresolved symbols - START
				isListingUnresolvedSymbols = true;
			} else {
				// Warnings
				const warningMatches:any = outputLine.match(warningFind);
				if (warningMatches) {
					errorMessage = warningMatches[1] as string;
					const fileMatch:any = errorMessage.match(fileNotFoundErrorFind);
					if (fileMatch) {
						lineNumber = findStringInLines(listLines, fileMatch[1] as string);
					}
				}
			}
		}

		if (errorMessage) {
			const newLine = {
				number: lineNumber > -1 ? lineNumber : 0,
				address: -1,
				bytes: undefined,
				raw: outputLine,
				errorMessage,
				comment: undefined,
				command: undefined,
			};
			if (lineNumbers.length > 0) {
				// Applies to more than one line
				lineNumbers.forEach((lineNumberItem) => {
					newLines.push(Object.assign({}, newLine, { number: lineNumberItem }));
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

function findStringInLines(lines:ILine[], needle:string, startLine:number = 0) {
	if (!lines) return -1;

	for (let i = startLine; i < lines.length; i++) {
		if (lines[i].raw && lines[i].raw.indexOf(needle) > -1) return lines[i].number;
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
	value = value.toLowerCase();
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

function parseSymbols(symbolsFile:string):ISymbol[] {
	const symbols:ISymbol[] = [];
	const lines = symbolsFile.split("\n");
	lines.forEach((line) => {
		if (line.length === 47 && line.substr(0, 3) !== "---") {
			const value = line.substr(25, 4).trim();
			const isLabel = value.substr(0, 1) === "f";
			const flags = line.substr(44, 2).trim();
			symbols.push({
				name: line.substr(0, 25).trim(),
				isLabel,
				isConstant: !isLabel,
				value: parseInt(isLabel ? value.substr(1) : value, 16),
				wasReferenced: Boolean(flags.match(/r/i)),
				wasPseudoOpCreated: Boolean(flags.match(/s/i)),
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
			Module.FS.writeFile(fileName, options.includes[fileName]);
		}
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
		symbols: symbolsFile ? parseSymbols(symbolsFile) : undefined,
		symbolsRaw: symbolsFile,
		exitStatus: Module.getStatus() as number,
		success: didCompile,
	};
}
