import {Rec} from "@/lib/utils/records";

export type RowList = { name: string, tickers: string[] };
export type ViewsAvailable = { rowLists: RowList[] }
export type ViewSelection = { assetClass: string, rowListNames: Rec<string> };