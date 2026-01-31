import {NextResponse} from 'next/server';
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
   suppressNotices: ["yahooSurvey"],
});

export async function POST(req: Request) {
    const tickers: string[] = (await req.json()).tickers;
    const entries = (await yahooFinance.quote(tickers.map(ticker => ticker + ".SA")))
        .map(quote => {
            const ticker = quote.symbol.split(".")[0];
            const value = { "yahoo.quote.latest": quote.regularMarketPrice };
            return [ticker, value]
        });
    return NextResponse.json(Object.fromEntries(entries));
}
