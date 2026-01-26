export type Rec<A> = Record<string, A>;

export function mapValues<A, B>(record: Rec<A>, fn: (value: A) => B): Rec<B> {
    const entries = Object.entries(record).map(([k, v]) => [k, fn(v)]);
    return Object.fromEntries(entries)
}

export function allKeys(...records: Rec<unknown>[]): Set<string> {
    return new Set(records.flatMap(Object.keys));
}

export function recordOfKeys<T>(keys: string[], fn: (key: string) => T): Rec<T> {
    return Object.fromEntries(keys?.map(k => [k, fn(k)]) || [])
}

export function mergeRecords<A>(data1: Rec<A>, data2: Rec<A>): Rec<A> {
    if (!data1) return data2;
    if (!data2) return data1;
    const entries = Object.keys({...data1, ...data2}).map(key => {
        const value = {...data1[key], ...data2[key]};
        return [key, value]
    });
    return Object.fromEntries(entries);
}
