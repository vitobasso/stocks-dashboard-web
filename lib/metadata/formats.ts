const formats: Record<string, "chart" | "percent"> = {
  "yahoo_chart.1d": "chart",
  "yahoo_chart.1mo": "chart",
  "yahoo_chart.1y": "chart",
  "yahoo_chart.5y": "chart",
  "derived.statusinvest.ey": "percent",
  "derived.forecast.min_pct": "percent",
  "derived.forecast.avg_pct": "percent",
  "derived.forecast.max_pct": "percent",
};

export function isChart(key: string): boolean {
  return formats[key] === "chart";
}

// Precision choice to keep column widths reasonable
export function trimNumber(num: number): number {
  if (num >= 100) return Math.round(num);
  if (num >= 10) return Math.round(num * 10) / 10;
  return Math.round(num * 100) / 100;
}

// Used for both measuring and rendering non-chart cells
export function formatTextValue(key: string, value: any): string | undefined {
  if (isChart(key)) return undefined; // non-textual
  if (formats[key] === "percent" && value != null && value !== "") {
    return `${value}%`;
  }
  if (Number(value)) {
    const n = Number(value);
    if (isNaN(n)) return "";
    return String(trimNumber(n));
  }
  return value ?? "";
}
