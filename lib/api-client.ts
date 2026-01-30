import {foreachDepth2, mergeDepth2, Rec} from "@/lib/utils/records";
import {Data, Metadata, splitByAssetClass} from "@/lib/data";
import {useEffect, useMemo, useReducer} from "react";
import {useQueries, useQueryClient, UseQueryResult} from "@tanstack/react-query";

export async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}

export function useQuoteData(rows: string[] | null, classOfTicker?: Map<string, string>): Rec<Data> {
    const queryClient = useQueryClient();

    const ttl = ONE_HOUR_MS

    function queryKey(ticker: string) {
        return ['quotes', ticker];
    }

    async function fetchQuotes(rows: string[], classOfTicker: Map<string, string>): Promise<Rec<Data>> {
        if (!rows.length) return {};

        const res = await fetch("/api/quotes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tickers: rows})
        });
        const data: Data = await res.json();
        return splitByAssetClass(data, classOfTicker);
    }

    function isCached(ticker: string): boolean {
        const updatedAt = queryClient.getQueryState(queryKey(ticker))?.dataUpdatedAt
        return updatedAt ? updatedAt > Date.now() - ttl : false
    }

    function cacheAll(data: Rec<Data>) {
        foreachDepth2(data, (ac, ticker, entry) => {
            queryClient.setQueryData(queryKey(ticker), { [ac]: { [ticker]: entry } });
        });
    }

    async function coalesceFetch(ticker: string): Promise<Rec<Data>> {
        const missing = rows!.filter((row) => !isCached(row));
        const result = await fetchQuotes(missing, classOfTicker!)
        cacheAll(result);
        const ac: string = classOfTicker!.get(ticker)!
        return { [ac]: { [ticker]: result[ac][ticker] } }
    }

    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: queryKey(ticker),
            queryFn: () => coalesceFetch(ticker),
            enabled: Boolean(rows?.length && classOfTicker),
            staleTime: ttl,
            gcTime: ttl,
        })),
    });

    function collectSuccessful<E>(xs: UseQueryResult<Rec<Data>, E>[]): Rec<Data> {
        return xs.map(x => x.data)
            .filter((d): d is Rec<Data> => !!d)
            .reduce(mergeDepth2, {})
    }

    return useMemo(() => collectSuccessful(results), [results]);
}

export function useScrapedData(ac: string | null, rows: string[] | null): Rec<Data> {
    const queryClient = useQueryClient();

    const ttl = ONE_DAY_MS

    function queryKey(ac: string, ticker: string) {
        return [ac, 'scraped', ticker];
    }

    async function fetchScraped(ac: string, ticker: string): Promise<Rec<Data>> {
        const urlParams = scraperParams(ac, [ticker]);
        const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
        return await res.json();
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

    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: queryKey(ac ?? "", ticker),
            queryFn: () => fetchScraped(ac ?? "", ticker),
            enabled: Boolean(ac && rows?.length),
            staleTime: ttl,
            gcTime: ttl,
        })),
    });

    const [liveUpdated, setLiveUpdated] = useReducer(x => x + 1, 0);

    function cacheAll(data: Rec<Data>) {
        foreachDepth2(data, (ac, ticker, entry) => {
            queryClient.setQueryData(queryKey(ac, ticker), { [ac]: { [ticker]: entry } });
        });
    }

    function listenScrapedLive(ac: string, rows: string[]) {
        const isSsl = window.location.protocol === 'https:';
        const ws = new WebSocket(scraperLiveUrl(ac, rows, isSsl));

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;
                cacheAll(data);
                setLiveUpdated();
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
        return listenScrapedLive(ac, rows);
    }, [ac, rows, queryClient]);

    function collectSuccessful<E>(xs: UseQueryResult<Rec<Data>, E>[]): Rec<Data> {
        return xs.map(x => x.data)
            .filter((d): d is Rec<Data> => !!d)
            .reduce(mergeDepth2, {})
    }

    return useMemo(() => collectSuccessful(results), [results, liveUpdated]);
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
