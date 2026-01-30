import {foreachDepth2, Rec} from "@/lib/utils/records";
import {Data, DataEntry, Metadata, splitByAssetClass} from "@/lib/data";
import {useEffect, useMemo} from "react";
import {useQueries, useQueryClient, UseQueryResult} from "@tanstack/react-query";

export async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}

export async function fetchQuotes(rows: string[], classOfTicker: Map<string, string>): Promise<Rec<Data>> {
    if (!rows.length) return {};

    const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tickers: rows})
    });
    const data: Data = await res.json();
    return splitByAssetClass(data, classOfTicker);
}


export function useScraped(ac: string, rows: string[], isSsl: boolean): Rec<Data> {
    const queryClient = useQueryClient();

    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: scrapedKey(ac, ticker),
            queryFn: () => fetchScraped(ac, ticker),
            enabled: Boolean(ac) && Boolean(rows.length),
            staleTime: ONE_DAY_MS,
            gcTime: ONE_DAY_MS,
        })),
    });

    function cacheAll(data: Rec<Data>) {
        foreachDepth2(data, (ac, ticker, entry) => {
            let queryKey = scrapedKey(ac, ticker);
            queryClient.setQueryData<DataEntry>(queryKey, entry);
        });
    }

    function listenScraped(ac: string, rows: string[], isSsl: boolean) {
        const ws = new WebSocket(scraperLiveUrl(ac, rows, isSsl));

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;
                cacheAll(data);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }

    useEffect(() => {
        if (!ac || !rows?.length) return;
        return listenScraped(ac, rows, isSsl);
    }, [ac, rows, isSsl, queryClient]);

    function collectSuccessful<E>(xs: UseQueryResult<Rec<Data>, E>[]): Rec<Data> {
        return Object.assign({}, ...xs.map(x => x.data).filter(Boolean))
    }

    return useMemo(() => collectSuccessful(results), [results]);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function scrapedKey(ac: string, ticker: string) {
    return [ac, 'scraped', ticker];
}

async function fetchScraped(ac: string, ticker: string): Promise<Rec<Data>> {
    const urlParams = scraperParams(ac, [ticker]);
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
    return await res.json().then(data => data[ac][ticker]);
}

function scraperParams(ac: string, rows: string[]) {
    const urlParams = new URLSearchParams();
    if (rows.length) urlParams.append(ac, rows.join(","));
    return urlParams;
}

function scraperLiveUrl(ac: string, rows: string[], isSsl: boolean) {
    const urlParams = scraperParams(ac, rows);
    const protocol = isSsl ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_SCRAPER_URL?.replace(/^https?:/, protocol);
    return `${baseUrl}/data-live?${urlParams.toString()}`
}
