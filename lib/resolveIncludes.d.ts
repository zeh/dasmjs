import { IIncludeInfo } from "./index";
export declare type IGefFileFunc = (entryRelativeUri: string, isBinary: boolean) => string | Uint8Array | undefined;
export default function resolveIncludes(entrySource: string, getFile?: IGefFileFunc, baseDir?: string): IIncludeInfo[];
