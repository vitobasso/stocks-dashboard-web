import {allKeys, mergeDepth1, mergeDepth2, Rec} from "@/lib/utils/records";
import {Data, Metadata, splitByAssetClass} from "@/lib/data";
import {useEffect, useMemo} from "react";
import {useQueries, useQueryClient} from "@tanstack/react-query";

export async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}

export async function fetchScraped(ac: string, rows: string[]): Promise<Rec<Data>> {
    const urlParams = scraperParams(ac, rows);
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
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

export function listenScraped(ac: string, rows: string[],
                              setScraped: (value: ((prevState: Rec<Data>) => Rec<Data>)) => void,
                              isSsl: boolean) {
    const ws = new WebSocket(scraperLiveUrl(ac, rows, isSsl));

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (!data || Object.keys(data).length === 0) return;
            setScraped(prev => mergeDepth2(prev, data));
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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function scrapedQueryKey(ac: string, ticker: string) {
    return [ac, 'scraped', ticker];
}

export function useScrapedTickers(ac: string, rows: string[], isSsl: boolean) {
    const queryClient = useQueryClient();

    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: scrapedQueryKey(ac, ticker),
            queryFn: () => {
                return fetchScraped(ac, [ticker]);
            },
            enabled: Boolean(ac) && Boolean(rows.length),
            staleTime: ONE_DAY_MS,
            gcTime: ONE_DAY_MS,
        })),
    });


    function findCached(ac: string, rows: string[]) {
        return rows.reduce<Rec<Data>>((acc, ticker) => {
            const cached = queryClient.getQueryData<Rec<Data>>(scrapedQueryKey(ac, ticker));
            if (cached) Object.assign(acc, cached);
            return acc;
        }, {})
    }

    useEffect(() => {
        if (!ac || !rows?.length) return;
        const cleanup = listenScraped(ac, rows, (setScraped) => {
            const nextAll = setScraped(findCached(ac, rows));
            for (const [ac, data] of Object.entries(nextAll)) {
                for (const ticker of Object.keys(data)) {
                    let queryKey = scrapedQueryKey(ac, ticker);
                    queryClient.setQueryData<Rec<Data>>(
                        queryKey, (prev) => mergeDepth2(prev || {}, nextAll)
                    );
                }
            }
        }, isSsl);

        return cleanup;
    }, [ac, isSsl, queryClient, rows]);

    return useMemo(() => {
        const out: Rec<Data> = {};
        results.forEach((r) => {
            if (r.data) Object.assign(out, r.data);
        });
        return out;
    }, [results]);
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