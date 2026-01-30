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

export function mergeDepth1<A>(data1: Rec<A>, data2: Rec<A>): Rec<A> {
    if (!data1 || !Object.keys(data1).length) return data2;
    if (!data2 || !Object.keys(data2).length) return data1;
    const entries = Object.keys({...data1, ...data2}).map(key => {
        const value = {...data1[key], ...data2[key]};
        return [key, value]
    });
    return Object.fromEntries(entries);
}

export function foreachDepth2<A>(data: Rec<Rec<A>>, fn: (key1: string, key2: string, value: A) => void){
    for (const [k1, v1] of Object.entries(data)) {
        for (const [k2, v2] of Object.entries(v1)) {
            fn(k1, k2, v2)
        }
    }
}