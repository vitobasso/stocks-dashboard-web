import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {AnalystRating, Fundamentals, Overview, PriceForecast, QuoteCharts, ScrapedData} from "@/lib/data";

const rootDir = "../ai-scraper/output/20250803";

export async function GET() {
    const chart = yahooChart();
    const funds = fundamentals();
    const ratings = analysis();
    const overview = simplyWall();
    const tickers = new Set([...Object.keys(funds), ...Object.keys(ratings)]);
    const rows = Array.from(tickers).reduce((acc, ticker) => {
        acc[ticker] = {
            fundamentals: funds[ticker],
            overview: overview[ticker],
            analystRating: ratings[ticker]?.analyst_rating,
            priceForecast: ratings[ticker]?.price_forecast,
            quoteCharts: chart[ticker],
        };
        return acc;
    }, {} as ScrapedData);
    return NextResponse.json(rows);
}

function fundamentals(): Record<string, Fundamentals> {
    const file = pickLatestFile(rootDir + "/statusinvest/data/ready");
    return file ? parseFundamentals(fs.readFileSync(file, 'utf8')) : {};
}

function pickLatestFile(dir: string): string | null {
    const files = fs.readdirSync(dir);
    if (files.length === 0) return null;
    const sorted = files.sort();
    return path.join(dir, sorted[sorted.length - 1]);
}

function parseFundamentals(csv: string): Record<string, Fundamentals> {
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(";").map(header => header.trim())
        .map(header => fundamentalsHeaderMap[header] ?? header);
    const entries = lines.map(line => {
        const values = line.split(";");
        const [ticker, ...rest] = values;
        const data: Record<string, string | number> = {};
        headers.slice(1).forEach((header, i) => {
            data[header] = tryConvertNumber(rest[i])
        });
        return [ticker, data];
    });
    return Object.fromEntries(entries);
}

const fundamentalsHeaderMap: Record<string, string> = {
    "LIQUIDEZ MEDIA DIARIA": "liquidezMediaDiaria",
    "MARG. LIQUIDA": "margem",
    "DIV. LIQ. / PATRI.": "divida",
    "LIQ. CORRENTE": "liquidezCorrente",
    "CAGR LUCROS 5 ANOS": "lucro",
}

function tryConvertNumber(value: string): number | string {
    let converted = Number(value.replaceAll(".", "").replace(",", "."));
    return isNaN(converted) ? value : converted;
}

function analysis(): Record<string, { analyst_rating: AnalystRating, price_forecast: PriceForecast }> {
    return extractJsonPerTicker("/yahoo/data/ready", (data: any) => data);
}

function simplyWall(): Record<string,Overview> {
    return extractJsonPerTicker("/simplywall/data/ready", (data: any) => data?.data?.Company?.score);
}

function yahooChart(): Record<string,QuoteCharts> {
    return extractJsonPerTicker("/yahoo_chart/data/ready", (data: number[]) => ({
        "1mo": data.slice(-21),
        "1y": data.slice(-252).filter((_, i) => i % 5 === 0),
        "5y": data.filter((_, i) => i % 20 === 0),
    }));
}

function extractJsonPerTicker<In, Out>(filePath: string, extract: (data: In) => Out): Record<string, Out> {
    const dir = rootDir + filePath;
    if (!fs.existsSync(dir)) return {};
    const entries = fs.readdirSync(dir).map(file => {
        const ticker = file.split('-')[0].toUpperCase();
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        return [ticker, extract(data)];
    });
    return Object.fromEntries(entries);
}