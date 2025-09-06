const formats: Record<string, "chart" | "percent"> = {
  "yahoo_chart.1mo_series": "chart",
  "yahoo_chart.1y_series": "chart",
  "yahoo_chart.5y_series": "chart",
  "derived.b3_position.price_variation": "percent",
  "derived.b3_position.cumulative_return": "percent",
  "derived.statusinvest.ey": "percent",
  "derived.forecast.min_pct": "percent",
  "derived.forecast.avg_pct": "percent",
  "derived.forecast.max_pct": "percent",
};

export function isChart(key: string): boolean {
  return formats[key] === "chart";
}

// Used for both measuring and rendering non-chart cells
export function formatAsText(key: string, value: unknown): string | undefined {
  if (isChart(key) || value === null || value === undefined) return undefined;
  if (formats[key] === "percent") return formatPercent(value);
  return formatNumber(value);
}

function formatPercent(value: unknown): string {
    const n: number = Number(value);
    if (isFinite(n)) return `${trimDigits(n, 2)}%`;
    return (value ?? "") as string;
}

function formatNumber(value: unknown): string {
    const n: number = Number(value);
    if (isFinite(n)) return trimDigits(n, 3).toLocaleString('pt-BR', { useGrouping: false }) ;
    return (value ?? "") as string;
}

// To keep column widths reasonable
export function trimDigits(num: number, maxDigits: number): number {
    const integerDigits = Math.max(Math.floor(Math.log10(Math.abs(num))), 0) + 1
    if (integerDigits >= maxDigits) {
        return Math.round(num)
    } else {
        return trimDecimals(num, maxDigits - integerDigits)
    }
}

function trimDecimals(num: number, maxDecimals: number): number {
    const factor = 10 ** maxDecimals
    return Math.round(num * factor) / factor
}
