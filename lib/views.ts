import {Rec} from "@/lib/utils/records";

export type RowList = { name: string, tickers: string[] };
export type ColList = { name: string, keys: string[] };
export type ViewsAvailable = { rowLists: RowList[], colLists: ColList[] }
export type ViewSelection = { assetClass: string, rowListNames: Rec<string>, colListNames: Rec<string> };