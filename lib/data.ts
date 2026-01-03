import {derivations, Derivations} from "@/lib/metadata/derivations";
import {Label} from "@/lib/metadata/labels";
import {mergeRecords, Rec} from "@/lib/utils/records";

export type Metadata = {
    schema: string[],
    sources: Record<string, MetadataSource>,
    labels: Record<string, Label>,
    tickers: string[]
}
export type MetadataSource = { label: string, url: string, updated_at?: string | undefined };
export type Data = Record<string, DataEntry>;
export type DataEntry = Record<string, DataValue>;
export type DataValue = string | number | number[] | ChartData | SpecificMetadata;
export type ChartData = { series: number[], variation: number }
export type SpecificMetadata = { source: string | undefined, updated_at: string | undefined }

export function getValue(row: DataEntry, key: string): DataValue | undefined {
    return row?.[key];
}

export function getPrefix(path: string) {
    return path.substring(0, path.lastIndexOf("."));
}

export function getSuffix(path: string) {
    return path.split(".").pop()
}

export function consolidateData(data: Data[], assetClass: string): Data {
    const merged = data.reduce(mergeRecords, {});
    const derived = deriveData(merged, derivations[assetClass]);
    return mergeRecords(merged, derived);
}

function deriveData(data: Data, derivations: Derivations): Data {
    const entries = Object.keys(data).map(ticker => {
        const derived = deriveEntry(data[ticker], derivations);
        return [ticker, derived];
    })
    return Object.fromEntries(entries);
}

function deriveEntry(data: DataEntry, derivations: Derivations): Data {
    const entries = Object.keys(derivations).map(path => {
        const derivation = derivations[path];
        const rawArgs = derivation.arguments.map((key) => getValue(data, key));
        if (rawArgs.some(a => a === undefined)) return [path, undefined];
        const args = rawArgs as DataValue[];
        const value = derivation.function(args);
        return [path, value];
    }).filter(([, value]) => !!value)
    return Object.fromEntries(entries);
}

export type ColumnStats = { maxLength: number };
type GetDisplay = (key: string, value: DataValue) => string | undefined;

export function calcStats(data: Data, getDisplay: GetDisplay): Map<string, ColumnStats> {
    const stats = new Map<string, ColumnStats>();
    Object.entries(data).forEach(([ticker, cols]) => {
        accStats("ticker", ticker, getDisplay, stats)
        Object.entries(cols).forEach(([key, value]) => {
            accStats(key, value, getDisplay, stats);
        })
    })
    return stats
}

function accStats(key: string, value: DataValue, getDisplay: GetDisplay, stats: Map<string, ColumnStats>) {
    const length = getDisplay(key, value)?.length;
    if (length) {
        const currentMax = stats.get(key)?.maxLength || 0;
        const maxWidth = Math.max(currentMax, length);
        stats.set(key, {maxLength: maxWidth});
    }
}

export function splitByAssetClass(fullData: Data, classOfTicker: Map<string, string>): Rec<Data> {
    const result: Rec<Data> = {};
    for (const [ticker, data] of Object.entries(fullData)) {
        const assetClass = classOfTicker.get(ticker);
        if (!assetClass) continue;
        if (!result[assetClass]) result[assetClass] = {};
        result[assetClass][ticker] = data;
    }
    return result;
}