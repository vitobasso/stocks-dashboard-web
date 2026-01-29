
export function indexByFields(map: Record<string, string[]>): Map<string, string> {
    const inverted: Map<string, string> = new Map()
    for (const [group, values] of Object.entries(map)) {
        for (const v of values) {
            inverted.set(v, group);
        }
    }
    return inverted
}

export function extendUnique<T>(a: T[], b: T[]) {
    const s = new Set(a)
    return [...a, ...b.filter(x => !s.has(x))]
}

export function flattenUnique<T>(xs: T[][]) {
    return xs.reduce(extendUnique)
}