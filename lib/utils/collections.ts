
export function indexByFields(map: Record<string, string[]>): Map<string, string> {
    const inverted: Map<string, string> = new Map()
    for (const [group, values] of Object.entries(map)) {
        for (const v of values) {
            inverted.set(v, group);
        }
    }
    return inverted
}

export function groupBy<T, K>(
    items: T[],
    getKey: (item: T) => K
): Map<K, T[]> {
    return items.reduce((map, item) => {
        const key = getKey(item)
        const group = map.get(key)
        if (group) {
            group.push(item)
        } else {
            map.set(key, [item])
        }
        return map
    }, new Map<K, T[]>())
}

export function extendUnique<T>(a: T[], b: T[]) {
    const s = new Set(a)
    return [...a, ...b.filter(x => !s.has(x))]
}

export function flattenUnique<T>(xs: T[][]) {
    return xs.reduce(extendUnique)
}

export function moveItem<T>(arr: T[], from: number, to: number) {
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
}
