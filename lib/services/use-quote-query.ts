import {mapEntries, mergeDepth1, Rec, splitInGroups} from "@/lib/utils/records";
import {Data} from "@/lib/data";
import {ONE_HOUR_MS} from "@/lib/utils/datetime";
import * as batshit from "@yornaath/batshit";
import {useQueries} from "@tanstack/react-query";

const ttl = ONE_HOUR_MS;

async function fetchQuotes(rows: string[]): Promise<Rec<Data>> {
    if (!rows.length) return {};

    const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tickers: rows})
    });
    const data: Data = await res.json();
    return mapEntries(data, (k) => k, (k, v) => ({[k]: v}));
}

const batcher = batshit.create({
    fetcher: fetchQuotes,
    resolver: batshit.indexedResolver(),
    scheduler: batshit.windowScheduler(10),
});

export function useQuoteQuery(rows: string[] | null, classOfTicker?: Map<string, string>): Rec<Data> {

    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: ['quotes', ticker],
            queryFn: () => batcher.fetch(ticker),
            enabled: Boolean(rows?.length && classOfTicker),
            staleTime: ttl,
            gcTime: ttl,
        })),
    });

    if (!classOfTicker) return {};
    const dataPerTicker: Data = results.map(r => r.data)
        .filter((d): d is Data => !!d)
        .reduce(mergeDepth1, {})
    return splitInGroups(dataPerTicker, classOfTicker)
}
