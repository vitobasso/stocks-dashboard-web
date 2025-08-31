import {NextResponse} from 'next/server';
import yahooFinance from "yahoo-finance2";

yahooFinance.suppressNotices(['yahooSurvey']);

export async function POST(req: Request) {
    const tickers: string[] = (await req.json()).tickers;
    const entries = (await yahooFinance.quote(tickers.map(ticker => ticker + ".SA")))
        .map(quotes => {
            const ticker = quotes.symbol.split(".")[0];
            const value = { "yahoo_quote.latest": quotes.regularMarketPrice };
            return [ticker, value]
        });
    return NextResponse.json(Object.fromEntries(entries));
}
