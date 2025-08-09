import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {Data} from "@/lib/data";

const rootDir = "../stocks-scraper/output/20250803";

export async function GET() {
    const chart = yahooChart();
    const funds = statusinvest();
    const yahooScrape = yahooScraped();
    const yahooApiRec = yahooApiRecom();
    const simplywall = simplyWall();
    const tickers = new Set([...Object.keys(funds), ...Object.keys(yahooScrape)]);
    const rows = Array.from(tickers).reduce((acc, ticker) => {
        acc[ticker] = {
            ...prefix(funds[ticker], "statusinvest"),
            ...prefix(simplywall[ticker], "simplywallst"),
            ...prefix(yahooScrape[ticker]?.analyst_rating, "yahoo_rating"),
            ...prefix(yahooScrape[ticker]?.price_forecast, "yahoo_forecast"),
            ...prefix(yahooApiRec[ticker], "yahoo_api_rating"),
            ...prefix(chart[ticker], "yahoo_chart"),
        };
        return acc;
    }, {} as Data);
    return NextResponse.json(rows);
}

function statusinvest(): Data {
    const file = pickLatestFile(rootDir + "/statusinvest/data/ready");
    return file ? parseStatusinvest(fs.readFileSync(file, 'utf8')) : {};
}

function parseStatusinvest(csv: string): Data {
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(";").map(header => header.trim())
        .map(header => statusinvestHeaderMap[header] ?? header);
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

const statusinvestHeaderMap: Record<string, string> = {
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

function yahooScraped(): Data {
    return extractJsonPerTicker("/yahoo/data/ready", (data: any) => data);
}

function simplyWall(): Data {
    return extractJsonPerTicker("/simplywall/data/ready", (data: any) => data?.data?.Company?.score);
}

function yahooChart(): Data {
    return extractJsonPerTicker("/yahoo_chart/data/ready", (data: number[]) => ({
        "1mo": data.slice(-21),
        "1y": data.slice(-252).filter((_, i) => i % 5 === 0),
        "5y": data.filter((_, i) => i % 20 === 0),
    }));
}

function yahooApiRecom(): Data {
    return extractJsonPerTicker("/yahoo_recommendations/data/ready", (data: any) => ({
        "strongBuy": data.strongBuy?.["0"],
        "buy": data.buy?.["0"],
        "hold": data.hold?.["0"],
        "sell": data.sell?.["0"],
        "strongSell": data.strongSell?.["0"],
    }));
}

function extractJsonPerTicker(filePath: string, extract: (data: any) => any): Data {
    const dir = rootDir + filePath;
    if (!fs.existsSync(dir)) return {};
    const entries = fs.readdirSync(dir).map(file => {
        const ticker = file.split('-')[0].toUpperCase();
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        return [ticker, extract(data)];
    });
    return Object.fromEntries(entries);
}

function pickLatestFile(dir: string): string | null {
    const files = fs.readdirSync(dir);
    if (files.length === 0) return null;
    const sorted = files.sort();
    return path.join(dir, sorted[sorted.length - 1]);
}

function prefix<T extends object>(obj: T, prefix: string) {
    if(!obj) return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [`${prefix}.${key}`, value])
    ) as Record<`${typeof prefix}${keyof T & string}`, T[keyof T]>;
}