export function groupByValues(map: Map<string, string>): Map<string, string[]> {
  const result: Map<string, string[]> = new Map()
  for (const k of map.keys()) {
    const v = map.get(k)
    if (!v) continue
    if (!result.get(v)) result.set(v, [])
    result.get(v)!.push(k)
  }
  return result
}

export function indexByFields(map: Record<string, string[]>): Map<string, string> {
    const inverted: Map<string, string> = new Map()
    for (const [group, values] of Object.entries(map)) {
        for (const v of values) {
            inverted.set(v, group);
        }
    }
    return inverted
}