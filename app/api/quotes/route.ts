import {NextResponse} from 'next/server';
import yahooFinance from "yahoo-finance2";
import {QuoteData} from "@/shared/types";


export async function GET() {
    const results = await yahooFinance.chart("BBAS3.SA", {
        period1: "2024-01-01",
        period2: "2024-08-01",
        interval: "1wk",
    });
    const quotes: QuoteData = { //TODO ticker list from request
        "BBAS3": {
            "1y": results.quotes.map(q => q.close).filter((c): c is number => c !== null),
        }
    }
    return NextResponse.json(quotes);
}
