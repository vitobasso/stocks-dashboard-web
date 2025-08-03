import {NextResponse} from 'next/server';
import yahooFinance from "yahoo-finance2";
import {DateTime} from "luxon";


export async function POST(req: Request) {
    let tickers: string[] = (await req.json()).tickers;
    let entries = (await yahooFinance.quote(tickers.map(ticker => ticker + ".SA")))
        .map(quotes => {
            let ticker = quotes.symbol.split(".")[0];
            let value = { latest: quotes.regularMarketPrice };
            return [ticker, value]
        });
    let quotes = Object.fromEntries(entries);

    //TODO scape series async instead
    let series = await fetchSeries("BBAS3");
    let bbas3series = quotes["BBAS3"];
    quotes["BBAS3"] = { ...bbas3series, ...series };
    let adaptedEntries = Object.keys(quotes).map(key => [key, { quotes: quotes[key] }]);
    let adaptedResult = Object.fromEntries(adaptedEntries);
    return NextResponse.json(adaptedResult);
}

async function fetchSeries(ticker: string) {
    let tickerReq = ticker + ".SA";
    let month = await yahooFinance.chart(tickerReq, {
        period1: DateTime.now().minus({months:1}).startOf('day').toUnixInteger(),
        interval: "1d",
    });
    let year = await yahooFinance.chart(tickerReq, {
        period1: DateTime.now().minus({years:1}).startOf('day').toUnixInteger(),
        interval: "1wk",
    });
    let year5 = await yahooFinance.chart(tickerReq, {
        period1: DateTime.now().minus({years:5}).startOf('day').toUnixInteger(),
        interval: "3mo",
    });
    return {
        "1mo": extractClose(month),
        "1y": extractClose(year),
        "5y": extractClose(year5),
    }
}

// @ts-ignore
function extractClose(result) {
    // @ts-ignore
    return result.quotes.map(q => q.close).filter((c): c is number => c !== null)
}