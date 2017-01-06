export interface IOptions {
    quick?: boolean;
    format?: "1" | "2" | "3";
}
export interface ISymbol {
    name: string;
    isLabel: boolean;
    isConstant: boolean;
    value: number;
    wasReferenced: boolean;
    wasPseudoOpCreated: boolean;
}
export default function (src: string, options?: IOptions): {
    data: Uint8Array;
    output: string[];
    list: string | undefined;
    listRaw: string | undefined;
    symbols: ISymbol[] | undefined;
    symbolsRaw: string | undefined;
};
