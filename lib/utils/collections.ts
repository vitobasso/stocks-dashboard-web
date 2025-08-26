export function invertSubset<K extends string, V extends string>(map: Map<K, V>): Map<V, K[]> {
  const result: Map<V, K[]> = new Map()
  for (const k of map.keys()) {
    const v = map.get(k)
    if (!v) continue
    if (!result.get(v)) result.set(v, [])
    result.get(v)!.push(k)
  }
  return result
}
