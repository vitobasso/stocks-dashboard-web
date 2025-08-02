import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {ScrapedData, AnalystRating, Fundamentals, PriceForecast} from "@/shared/types";

const rootDir = "../ai-scraper/output/20250701";

export async function GET() {
    const funds = fundamentals();
    const ratings = analysis()
    const tickers = new Set([...Object.keys(funds), ...Object.keys(ratings)]);
    const rows = Array.from(tickers).reduce((acc, ticker) => {
        acc[ticker] = {
            analystRating: ratings[ticker]?.analyst_rating,
            priceForecast: ratings[ticker]?.price_forecast,
            fundamentals: funds[ticker],
        };
        return acc;
    }, {} as ScrapedData);
    return NextResponse.json(rows);
}

function fundamentals(): Record<string, Fundamentals> {
    const file = rootDir + "/statusinvest/data/ready/20250701T140910.csv"
    const filePath = path.join(process.cwd(), file)
    const csv = fs.readFileSync(filePath, 'utf8');
    return parseFundaments(csv)
}

function parseFundaments(csv: string): Record<string, Fundamentals> {
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(";").map(header => header.trim())
        .map(header => headerMap[header] ?? header);
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

const headerMap: Record<string, string> = {
    "LIQUIDEZ MEDIA DIARIA": "liquidezMediaDiaria",
    "MARG. LIQUIDA": "margem",
    "DIV. LIQ. / PATRI.": "divida",
    "LIQ. CORRENTE": "liquidezCorrente",
    "CAGR LUCROS 5 ANOS": "lucro",
}
