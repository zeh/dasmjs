import * as dasm from "./dasm";

// Configuration constants

const FILENAME_IN = "file.a";
const FILENAME_OUT = "file.out";
const FILENAME_LIST = "file.lst";
const FILENAME_SYMBOLS = "file.sym";


// Variables used

const moduleOptions = {
	noInitialRun: true,
	print: logLine,
	printErr: logErrorLine,
	noExitRuntime: true,
	// Also available: preInit, preRun, postRun
};

let Module:any;
const log:string[] = [];
const didCompile:boolean = false;


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
	const lines:ILine[] = [];
	const rawLines = listFile.split("\n");
	const metaFind = /^------- /;
	const unknownFind = /^ *[0-9]+ *[0-9A-Fa-f]{4,5} \?{4}/;
	const addressFind = /^ *[0-9]+ *([0-9A-Fa-fU]{4,5})/;
	const commentFind = /;(.*)$/;
	const byteCodeFind = /^.*\t\t *([0-9a-fA-F ]+)\t/;
	const commandFind = /.*?\t\t.*?\t([^;]*)/;
	const errorFind = /^[\w\.]* \(([0-9]+)\): error: (.*)/;
	rawLines.forEach((rawLine) => {
		if (rawLine && !rawLine.match(metaFind)) {
			// Default values
			let lineNumber = lines.length + 1;
			let errorMessage = undefined;
			let address = -1;
			let comment = undefined;
			let bytes = undefined;
			let command = undefined;

			// First, catch errors
			const errorMatches:any = rawLine.match(errorFind);
			if (errorMatches) {
				errorMessage = errorMatches[2] as string;
				lineNumber = parseInt(errorMatches[1] as string, 10);
				didCompile = false;
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

			lines.push({
				number: lineNumber,
				address,
				bytes,
				raw: rawLine,
				errorMessage,
				comment,
				command,
			});
		}
	});
	return lines;
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
	Module.callMain([FILENAME_IN].concat(args));

	// Get other output files
	const listFile:string|undefined = options.quick ? undefined : Module.FS.readFile(FILENAME_LIST, { encoding: "utf8" });
	const symbolsFile:string|undefined = options.quick ? undefined : Module.FS.readFile(FILENAME_SYMBOLS, { encoding: "utf8" });

	// Return results
	return {
		data: Module.FS.readFile(FILENAME_OUT) as Uint8Array,
		output: log.concat(),
		list: listFile ? parseList(listFile) : undefined,
		listRaw: listFile,
		symbols: symbolsFile ? parseSymbols(symbolsFile) : undefined,
		symbolsRaw: symbolsFile,
		exitStatus: Module.getStatus() as number,
		success: didCompile,
	};
}
