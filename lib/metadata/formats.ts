const formats: Record<string, "chart" | "percent"> = {
  "yahoo_chart.1d": "chart",
  "yahoo_chart.1mo": "chart",
  "yahoo_chart.1y": "chart",
  "yahoo_chart.5y": "chart",
  "derived.b3_position.rendimento": "percent",
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
    if (isFinite(n)) return `${trimNumber(n)}%`;
    return (value ?? "") as string;
}

function formatNumber(value: unknown): string {
    const n: number = Number(value);
    if (isFinite(n)) return trimNumber(n).toLocaleString('pt-BR', { useGrouping: false }) ;
    return (value ?? "") as string;
}

// Precision choice to keep column widths reasonable
function trimNumber(num: number): number {
    if (num >= 100) return Math.round(num);
    if (num >= 10) return Math.round(num * 10) / 10;
    return Math.round(num * 100) / 100;
}
