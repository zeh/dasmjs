export { default as resolveIncludes } from "./resolveIncludes";
export interface IOptions {
    quick?: boolean;
    format?: "1" | "2" | "3" | 1 | 2 | 3;
    parameters?: string;
    machine?: "atari2600" | "channel-f";
    includes?: {
        [key: string]: string | Uint8Array;
    } | IIncludeInfo[];
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
    line: number;
    column: number;
    entryRelativeUri: string;
    parentRelativeUri: string;
    isBinary: boolean;
    includes: IIncludeInfo[];
    contents?: string | Uint8Array | undefined;
}
export interface IDasmResult {
    data: Uint8Array;
    output: string[];
    list?: ILine[];
    listRaw?: string;
    symbols?: ISymbol[];
    symbolsRaw?: string;
    exitStatus: number;
    success: boolean;
}
export default function (src: string, options?: IOptions): IDasmResult;
