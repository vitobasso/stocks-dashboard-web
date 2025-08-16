export type DataEntry = Record<string, any>;
export type Data = Record<string, DataEntry>;

export type Derivation = {function: (...args: any[]) => any, arguments: string[]};
export type Derivations = Record<string, Derivation>;

export function getValue(row: DataEntry, key: string) {
    return (row as any)?.[key];
}

export function getGroup(path: string) {
    return path.split(".")[0]
}

export function getBasename(path: string) {
    return path.split(".")[1]
}

export function consolidateData(data: Data[], derivations: Derivations): Data {
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

