export function toNorm(s?: string): string {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export namespace Str {
  export function equals(a: string[], b: string[]) {
    return a.length === b.length && a.every((v, i) => v === b[i])
  }
}
