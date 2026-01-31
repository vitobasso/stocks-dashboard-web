import {ChartData, DataValue} from "@/lib/data";

const formats: Record<string, "chart" | "percent"> = {
    "yahoo.chart.1mo": "chart",
    "yahoo.chart.1y": "chart",
    "yahoo.chart.5y": "chart",
    "yahoo.derived.chart.1mo": "chart",
    "b3.derived.position.price_variation": "percent",
    "b3.derived.position.cumulative_return": "percent",
    "statusinvest.derived.ey": "percent",
    "yahoo.derived.forecast.min_pct": "percent",
    "yahoo.derived.forecast.avg_pct": "percent",
    "yahoo.derived.forecast.max_pct": "percent",

    // dummy keys for unit testing
    "chart": "chart",
    "percent": "percent",
};

export function isChart(key: string): boolean {
  return formats[key] === "chart";
}

export function getAsNumber(key: string, data: DataValue): number | undefined {
    if (formats[key] === "chart") return chartAsNumber(data);
    if (data == null || data === "" || !isFinite(Number(data))) return undefined;
    return Number(data);
}

export function getAsSortable(key: string, data: DataValue): number | string | undefined {
    if (formats[key] === "chart") return chartAsNumber(data);
    if (data == null || data === "") return undefined;
    if (typeof data === "string") return data;
    if (isFinite(Number(data))) return Number(data);
}

// Used for both measuring and rendering non-chart cells
export function getAsText(key: string, value: DataValue): string | undefined {
  if (formats[key] === "chart") return formatPercent(chartAsNumber(value));
  if (formats[key] === "percent") return formatPercent(value);
  return formatNumber(value) ?? formatString(value);
}

function formatPercent(value: unknown): string | undefined {
    const n: number = Number(value);
    if (isFinite(n)) return `${trimDigits(n, 2).toLocaleString('pt-BR', { useGrouping: false })}%`;
}

function formatNumber(value: unknown): string | undefined {
    const n: number = Number(value);
    if (isFinite(n)) return trimDigits(n, 3).toLocaleString('pt-BR', { useGrouping: false })
}

const lengthLimit = 18
function formatString(value: unknown): string {
    if (typeof value === "string") {
        if (value.length <= lengthLimit) return value
        else return value.slice(0, lengthLimit-1) + "…"
    }
    else return ""
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

function chartAsNumber(data: unknown): number | undefined {
    const chart = data as ChartData
    return chart ? chart.variation * 100 : undefined;
}
