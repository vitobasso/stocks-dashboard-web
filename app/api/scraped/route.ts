import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {AnalystRating, Fundamentals, Overview, PriceForecast, ScrapedData} from "@/lib/types";

const rootDir = "../ai-scraper/output/20250701";

export async function GET() {
    const funds = fundamentals();
    const ratings = analysis();
    const overview = simplywall();
    const tickers = new Set([...Object.keys(funds), ...Object.keys(ratings)]);
    const rows = Array.from(tickers).reduce((acc, ticker) => {
        acc[ticker] = {
            fundamentals: funds[ticker],
            overview: overview[ticker],
            analystRating: ratings[ticker]?.analyst_rating,
            priceForecast: ratings[ticker]?.price_forecast,
        };
        return acc;
    }, {} as ScrapedData);
    return NextResponse.json(rows);
}

function fundamentals(): Record<string, Fundamentals> {
    const file = rootDir + "/statusinvest/data/ready/20250701T140910.csv"
    const filePath = path.join(process.cwd(), file)
    const csv = fs.readFileSync(filePath, 'utf8');
    return parseFundamentals(csv)
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
    const dir = rootDir + "/yahoo/data/ready"
    const entries = fs.readdirSync(dir).map(file => {
        const ticker = file.split('-')[0].toUpperCase();
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        return [ticker, data];
    });
    return Object.fromEntries(entries);
}

function simplywall(): Record<string,Overview> {
    const dir = rootDir + "/simplywall/data/ready"
    const entries = fs.readdirSync(dir).map(file => {
        const ticker = file.split('-')[0].toUpperCase();
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        return [ticker, data?.data?.Company?.score];
    });
    return Object.fromEntries(entries);
}
