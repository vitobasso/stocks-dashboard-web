import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';

// TODO share with page.tsx
type Fundaments = { [key: string]: string | number };
type Overview = { value: number; future: number; past: number; health: number; dividends: number };
type AnalystRating = { strongBuy: number; buy: number; hold: number; underperform: number; sell: number };
type PriceForecast = { min: number; avg: number; max: number };

const rootDir = "../ai-scraper/output/20250701";

export async function GET() {
    const funds = fundaments();
    const ratings = analysis()
    const tickers = new Set([...Object.keys(funds), ...Object.keys(ratings)]);
    const rows = Array.from(tickers).map(ticker => ({
        ticker,
        analystRating: ratings[ticker]?.analyst_rating,
        priceForecast: ratings[ticker]?.price_forecast,
        fundaments: funds[ticker],
    }));
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
            const value = rest[i];
            data[header] = isNaN(Number(value)) ? value : Number(value);
        });
        return [ticker, data];
    });
    return Object.fromEntries(entries);
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
