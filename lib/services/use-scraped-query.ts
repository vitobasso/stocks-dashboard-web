import {foreachDepth2, mergeDepth2, Rec} from "@/lib/utils/records";
import {Data} from "@/lib/data";
import {useQueries, useQueryClient} from "@tanstack/react-query";
import {ONE_DAY_MS} from "@/lib/utils/datetime";
import {useEffect} from "react";

const ttl = ONE_DAY_MS

async function fetchScraped(ac: string, ticker: string): Promise<Rec<Data>> {
    const urlParams = scraperParams(ac, [ticker]);
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
    return await res.json();
}

function queryKey(ac: string, ticker: string) {
    return [ac, 'scraped', ticker];
}

export function useScrapedQuery(ac: string | null, rows: string[] | null): Rec<Data> {
    const queryClient = useQueryClient();

    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: queryKey(ac ?? "", ticker),
            queryFn: () => fetchScraped(ac ?? "", ticker),
            enabled: Boolean(ac && rows?.length),
            staleTime: ttl,
            gcTime: ttl,
        })),
    });

    function cachePartialUpdates(data: Rec<Data>) {
        foreachDepth2(data, (ac, ticker, entry) => {
            const key = queryKey(ac, ticker);
            const prev: Rec<Data> = queryClient.getQueryData(key) ?? {}
            const update: Rec<Data> = {[ac]: {[ticker]: entry}};
            const next: Rec<Data> = mergeDepth2(prev, update)
            queryClient.setQueryData(key, next);
        });
    }

    function listenScrapedLive(ac: string, rows: string[]) {
        const isSsl = window.location.protocol === 'https:';
        const ws = new WebSocket(scraperLiveUrl(ac, rows, isSsl));

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;
                cachePartialUpdates(data);
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

    return results.map(r => r.data)
        .filter((d): d is Rec<Data> => !!d)
        .reduce(mergeDepth2, {})
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