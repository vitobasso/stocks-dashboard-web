import {allKeys, mergeRecords, Rec} from "@/lib/utils/records";
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

            function updateScraped(prev: Rec<Data>) {
                const merged: Rec<Data> = {};
                for (const ac of allKeys(prev, data)) {
                    merged[ac] = mergeRecords(prev[ac], data[ac])
                }
                return merged;
            }

            setScraped(updateScraped);
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

    useEffect(() => {
        if (!ac || !rows?.length) return;

        const cleanup = listenScraped(ac, rows, (setScraped) => {
            const prevAll = rows.reduce<Rec<Data>>((acc, ticker) => {
                const cached = queryClient.getQueryData<Rec<Data>>(scrapedQueryKey(ac, ticker));
                if (cached) Object.assign(acc, cached);
                return acc;
            }, {});
            const nextAll = setScraped(prevAll);

            for (const assetClass of Object.keys(nextAll)) {
                const byTicker = nextAll[assetClass] ?? {};
                for (const ticker of Object.keys(byTicker)) {
                    queryClient.setQueryData<Rec<Data>>(scrapedQueryKey(ac, ticker), (prev) => {
                        const merged: Rec<Data> = {...(prev ?? {})};
                        merged[assetClass] = {
                            ...(merged[assetClass] ?? {}),
                            [ticker]: {
                                ...((merged[assetClass] ?? {})[ticker] ?? {}),
                                ...(byTicker[ticker] ?? {}),
                            },
                        };
                        return merged;
                    });
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