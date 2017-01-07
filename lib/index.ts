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
	// Also available: preInit, preRun
};

const Module:any = (dasm as any).DASM(moduleOptions);
const log:string[] = [];


// Interfaces

export interface IOptions {
	quick?: boolean;
	format?: "1"|"2"|"3"|1|2|3;
}

export interface ISymbol {
	name: string;
	isLabel: boolean;
	isConstant: boolean;
	value: number;
	wasReferenced: boolean;
	wasPseudoOpCreated: boolean;
}


// Methods and functions

function logLine(s:string) {
	log.push(s);
}

function logErrorLine(s:string) {
	log.push("[ERROR] " + s);
}

function parseList(listFile:string) {
	return listFile;
}

function parseSymbols(symbolsFile:string) {
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


// Final export

export default function(src:string, options:IOptions = {}) {
	// Prepare vars
	log.length = 0;

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
	};
}
