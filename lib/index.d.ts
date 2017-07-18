export interface IOptions {
    quick?: boolean;
    format?: "1" | "2" | "3" | 1 | 2 | 3;
    parameters?: string;
    machine?: "atari2600" | "channel-f";
    includes?: {
        [key: string]: string;
    };
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
export default function (src: string, options?: IOptions): {
    data: Uint8Array;
    output: string[];
    list: ILine[] | undefined;
    listRaw: string | undefined;
    symbols: ISymbol[] | undefined;
    symbolsRaw: string | undefined;
    exitStatus: number;
    success: boolean;
};
