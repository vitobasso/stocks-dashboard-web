import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {Fundaments, AnalystRating, PriceForecast, TickerData} from "@/shared/types";

const rootDir = "../ai-scraper/output/20250701";

export async function GET() {
    const funds = fundaments();
    const ratings = analysis()
    const tickers = new Set([...Object.keys(funds), ...Object.keys(ratings)]);
    const rows = Array.from(tickers).reduce((acc, ticker) => {
        acc[ticker] = {
            analystRating: ratings[ticker]?.analyst_rating,
            priceForecast: ratings[ticker]?.price_forecast,
            fundaments: funds[ticker],
        };
        return acc;
    }, {} as TickerData);
    return NextResponse.json(rows);
}

function fundaments(): Record<string, Fundaments> {
    const file = rootDir + "/statusinvest/data/ready/20250701T140910.csv"
    const filePath = path.join(process.cwd(), file)
    const csv = fs.readFileSync(filePath, 'utf8');
    return parseFundaments(csv)
}

function parseFundaments(csv: string): Record<string, Fundaments> {
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(";");
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
    let converted = Number(value.replace(",", "."));
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
