import {derivations, Derivations} from "@/lib/metadata/derivations";

export type DataEntry = Record<string, any>;
export type Data = Record<string, DataEntry>;

export function getValue(row: DataEntry, key: string) {
    return (row as any)?.[key];
}

export function consolidateData(data: Data[]): Data {
    let merged = data.reduce(mergeData, {});
    let derived = deriveData(merged, derivations);
    return mergeData(merged, derived);
}

function mergeData<A extends Data, B extends Data>(data1: Record<string, A>, data2: Record<string, B>): Record<string, A & B> {
    let entries = Object.keys({ ...data1, ...data2 }).map(key => {
        let value = { ...data1[key], ...data2[key] };
        return [key, value]
    });
    return Object.fromEntries(entries);
}

function deriveData(data: Data, derivations: Derivations): Data {
    let entries = Object.keys(data).map(ticker => {
        let derived = deriveEntry(data[ticker], derivations);
        return [ticker, derived];
    })
    return Object.fromEntries(entries);
}

function deriveEntry(data: DataEntry, derivations: Derivations): Data {
    let entries = Object.keys(derivations).map(path => {
        let derivation = derivations[path];
        let args = derivation.arguments.map((key) => getValue(data, key))
        let value = derivation.function(args);
        return [path, value];
    }).filter(([_, value]) => !!value)
    return Object.fromEntries(entries);
}

export type ColumnStats = { maxLength: number };

export function calcStats(data: Data): Map<string, ColumnStats> {
    let stats = new Map<string, ColumnStats>();
    Object.entries(data).forEach(([ticker, cols]) => {
        accStats("ticker", ticker, stats)
        Object.entries(cols).forEach(([key, value]) => {
            accStats(key, value, stats);
        })
    })
    return stats
}

function accStats(key: string, value: any, stats: Map<string, ColumnStats>) {
    let length = valueLength(value);
    if (length) {
        let currentMax = stats.get(key)?.maxLength || 0;
        let maxWidth = Math.max(currentMax, length);
        stats.set(key, {maxLength: maxWidth});
    }
}

function valueLength(value: any): number | undefined {
    return typeof value === "string" ? value.length : undefined
}

export function getPrefix(path: string) {
    return path.substring(0, path.lastIndexOf("."));
}

export function getSuffix(path: string) {
    return path.split(".").pop()
}