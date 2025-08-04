export type Fundamentals = { [key: string]: string | number };
export type Overview = { value: number; future: number; past: number; health: number; dividend: number };
export type AnalystRating = { strongBuy: number; buy: number; hold: number; underperform: number; sell: number };
export type PriceForecast = { min: number; avg: number; max: number };
export type QuoteCharts = { "1mo": number[], "1y": number[], "5y": number[] }
type ScrapedEntry = {
    fundamentals?: Fundamentals;
    overview?: Overview;
    analystRating?: AnalystRating;
    priceForecast?: PriceForecast;
    quoteCharts?: QuoteCharts;
};
export type ScrapedData = Record<string, ScrapedEntry>;

type QuoteEntry = { quotes: { latest: number }};
export type QuoteData = Record<string, QuoteEntry>;

export type Derivation = {function: (...args: any[]) => any, arguments: string[]};
type Derivations = Record<string, Derivation>;
type DerivedEntry = Record<string, any>
type FinalEntry = ScrapedEntry & QuoteEntry & DerivedEntry;
type FinalData = Record<string, FinalEntry>;

export function getValue(row: FinalEntry, group: string, key: string) {
    return (row as any)[group]?.[key];
}

export function consolidateData(scraped: ScrapedData, quotes: QuoteData, derivations: Derivations): FinalData {
    let merged = mergeData(scraped, quotes);
    let derived = deriveData(merged, derivations);
    return mergeData(merged, derived);
}

function mergeData<A extends Record<string, any>, B extends Record<string, any>>
(data1: Record<string, A>, data2: Record<string, B>): Record<string, A & B> {
    let entries = Object.keys({ ...data1, ...data2 }).map(key => {
        let value = mergeEntries(data1[key], data2[key]);
        return [key, value]
    });
    return Object.fromEntries(entries);
}

export function mergeEntries(data1: Record<string, any>, data2: Record<string, any>): Record<string, any> {
    if (!data1) return data2;
    if (!data2) return data1;
    let entries = Object.keys({ ...data1, ...data2 }).map(key => {
        let value = { ...data1[key], ...data2[key] };
        return [key, value]
    });
    return Object.fromEntries(entries);
}

function deriveData(data: Record<string, Record<string, any>>, derivations: Derivations): Record<string, DerivedEntry> {
    let entries = Object.keys(data).map(ticker => {
        let derived = deriveEntry(data[ticker], derivations);
        return [ticker, derived];
    })
    return Object.fromEntries(entries);
}

function deriveEntry(data: Record<string, any>, derivations: Derivations): Record<string, DerivedEntry> {
    let entries = Object.keys(derivations).map(path => {
        let derivation = derivations[path];
        let args = derivation.arguments.map((path) => getValueByPath(data, path))
        let value = derivation.function(args);
        return [path, value];
    })
    let flatObj = Object.fromEntries(entries);
    return unflatten(flatObj);
}

function unflatten(obj: Record<string, any>): Record<string, Record<string, any>> {
    const result: Record<string, any> = {};
    for (const flatKey in obj) {
        const [group, key] = flatKey.split(".");
        result[group] ??= {};
        result[group][key] = obj[flatKey];
    }
    return result;
}

function getValueByPath(data: any, path: string) {
    let [group, key] = path.split(".");
    return getValue(data, group, key);
}
