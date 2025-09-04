const formats: Record<string, "chart" | "percent"> = {
  "yahoo_chart.1d": "chart",
  "yahoo_chart.1mo": "chart",
  "yahoo_chart.1y": "chart",
  "yahoo_chart.5y": "chart",
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
  if (isChart(key)) return undefined; // non-textual
  if (formats[key] === "percent") return formatPercent(value);
  return formatNumber(value);
}

function formatPercent(value: unknown): string {
    const n: number = Number(value);
    if (isFinite(n)) return `${trimDecimals(n, 1)}%`;
    return (value ?? "") as string;
}

function formatNumber(value: unknown): string {
    const n: number = Number(value);
    if (isFinite(n)) return trimNumber(n).toLocaleString('pt-BR', { useGrouping: false }) ;
    return (value ?? "") as string;
}

// Precision choice to keep column widths reasonable
function trimNumber(num: number): number {
    if (num >= 100) return trimDecimals(num, 0)
    if (num >= 10) return trimDecimals(num, 1);
    return trimDecimals(num, 2)
}

function trimDecimals(num: number, maxDecimals: number = 2): number {
    const factor = 10 ** maxDecimals
    return Math.floor(num * factor) / factor
}
