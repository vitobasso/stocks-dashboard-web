import {createContext, useContext} from "react";
import {QueryClient} from "@tanstack/react-query";
import {foreachDepth2, mergeDepth2, Rec} from "@/lib/utils/records";
import {Data} from "@/lib/data";


export const LiveScrapedContext = createContext<LiveScrapedClient | null>(null);

export function useScrapedLive() {
    const ctx = useContext(LiveScrapedContext);
    if (!ctx) throw new Error("LiveClientContext not found");
    return ctx;
}

// TODO call from page
// const liveClient = useScrapedLive();
// useEffect(() => {
//     if (!ac || !rows?.length) return;
//     liveClient.subscribe(ac, rows);
// }, [ac, rows]);

export type LiveScrapedClient = {
    subscribe: (ac: string, rows: string[]) => void;
    close: () => void;
};

function scraperLiveUrl(isSsl: boolean) {
    const protocol = isSsl ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_SCRAPER_URL?.replace(/^https?:/, protocol);
    return `${baseUrl}/data-live`
}

export function createScrapedLiveClient(queryClient: QueryClient): LiveScrapedClient {
    const isSsl = window.location.protocol === "https:";
    const ws = new WebSocket(scraperLiveUrl(isSsl));
    const subscription = new Set();

    function cachePartialUpdates(data: Rec<Data>) {
        foreachDepth2(data, (ac, ticker, entry) => {
            const key = [ac, 'scraped', ticker];
            const prev: Rec<Data> = queryClient.getQueryData(key) ?? {}
            const update: Rec<Data> = {[ac]: {[ticker]: entry}};
            const next: Rec<Data> = mergeDepth2(prev, update)
            queryClient.setQueryData(key, next);
        });
    }

    ws.onmessage = (event) => {
        const data: Rec<Data> = JSON.parse(event.data);
        if (!data) return;
        cachePartialUpdates(data)
    };

    function subscribe(ac: string, tickers: string[]) {
        const newTickers = tickers.filter(t => !subscription.has(t));
        if (!newTickers.length) return;
        ws.send(JSON.stringify({ [ac]: newTickers }));
        newTickers.forEach(t => subscription.add(t));
    }

    function close() {
        if (ws && (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
        )) {
            ws.close();
        }
    }

    return { subscribe, close };
}
