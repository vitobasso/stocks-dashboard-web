import {NextResponse} from 'next/server';
import yahooFinance from "yahoo-finance2";

yahooFinance.suppressNotices(['yahooSurvey']);

export async function POST(req: Request) {
    let tickers: string[] = (await req.json()).tickers;
    let entries = (await yahooFinance.quote(tickers.map(ticker => ticker + ".SA")))
        .map(quotes => {
            let ticker = quotes.symbol.split(".")[0];
            let value = { "quotes.latest": quotes.regularMarketPrice };
            return [ticker, value]
        });
    return NextResponse.json(Object.fromEntries(entries));
}
