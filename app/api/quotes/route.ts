import {NextResponse} from 'next/server';
import yahooFinance from "yahoo-finance2";
import {QuoteData} from "@/shared/types";
import { DateTime } from "luxon";


export async function GET() {
    let ticker = "BBAS3"; //TODO ticker list from request
    let tickerReq = ticker + ".SA";
    const month = await yahooFinance.chart(tickerReq, {
        period1: DateTime.now().minus({months:1}).startOf('day').toUnixInteger(),
        interval: "1d",
    });
    const year = await yahooFinance.chart(tickerReq, {
        period1: DateTime.now().minus({years:1}).startOf('day').toUnixInteger(),
        interval: "1wk",
    });
    const year5 = await yahooFinance.chart(tickerReq, {
        period1: DateTime.now().minus({years:5}).startOf('day').toUnixInteger(),
        interval: "3mo",
    });
    let extractedMonth = extractClose(month);
    const quotes: QuoteData = {
        [ticker]: {
            quotes: {
                "1mo": extractedMonth,
                "1y": extractClose(year),
                "5y": extractClose(year5),
                "latest": extractedMonth[extractedMonth.length - 1],
            }
        }
    }
    return NextResponse.json(quotes);
}

// @ts-ignore
function extractClose(result) {
    // @ts-ignore
    return result.quotes.map(q => q.close).filter((c): c is number => c !== null)
}