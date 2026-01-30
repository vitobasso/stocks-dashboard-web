export type Rec<A> = Record<string, A>;

export function mapValues<A, B>(record: Rec<A>, fn: (value: A) => B): Rec<B> {
    const entries = Object.entries(record).map(([k, v]) => [k, fn(v)]);
    return Object.fromEntries(entries)
}

export function mapEntries<A, B>(record: Rec<A>, fnK: (k: string, v: A) => string, fnV: (k: string, v: A) => B): Rec<B> {
    const entries = Object.entries(record).map(([k, v]) => [fnK(k, v), fnV(k, v)]);
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

export function mergeDepth2<A>(data1: Rec<Rec<A>>, data2: Rec<Rec<A>>): Rec<Rec<A>> {
    const entries = [...allKeys(data1, data2)].map(ac => [ac, mergeDepth1(data1[ac], data2[ac])]);
    return Object.fromEntries(entries)
}

export function foreachDepth2<A>(data: Rec<Rec<A>>, fn: (key1: string, key2: string, value: A) => void){
    for (const [k1, v1] of Object.entries(data)) {
        for (const [k2, v2] of Object.entries(v1)) {
            fn(k1, k2, v2)
        }
    }
}

export function splitInGroups<A>(fullData: Rec<A>, groupOfKey: Map<string, string>): Rec<Rec<A>> {
    const result: Rec<Rec<A>> = {};
    for (const [k, v] of Object.entries(fullData)) {
        const group = groupOfKey.get(k);
        if (!group) continue;
        if (!result[group]) result[group] = {};
        result[group][k] = v;
    }
    return result;
}
