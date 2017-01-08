export interface IOptions {
    quick?: boolean;
    format?: "1" | "2" | "3" | 1 | 2 | 3;
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
    index: number;
    address: number;
    bytes: Uint8Array | undefined;
    raw: string;
    comment: string | undefined;
    command: string | undefined;
}
export default function (src: string, options?: IOptions): {
    data: Uint8Array;
    output: string[];
    list: ILine[] | undefined;
    listRaw: string | undefined;
    symbols: ISymbol[] | undefined;
    symbolsRaw: string | undefined;
};
