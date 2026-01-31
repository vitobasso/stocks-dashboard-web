import {createContext, useContext} from "react";
import {QueryClient} from "@tanstack/react-query";
import {foreachDepth2, mergeDepth2, Rec} from "@/lib/utils/records";
import {Data} from "@/lib/data";


export const ScrapedLiveContext = createContext<ScrapedLiveClient | null>(null);

export function useScrapedLive() {
    const ctx = useContext(ScrapedLiveContext);
    if (!ctx) throw new Error("ScrapedLiveContext not found");
    return ctx;
}

export type ScrapedLiveClient = {
    open: () => void;
    subscribe: (ac: string, rows: string[]) => void;
    close: () => void;
};

export function createScrapedLiveClient(queryClient: QueryClient): ScrapedLiveClient {
    let ws: WebSocket | null = null;
    const subscription = new Map<string, Set<string>>();
    const subscriptionBuffer =  new Map<string, Set<string>>(); // hold until connected

    function open() {
        ws = new WebSocket(url());
        ws.onmessage = (event) => {
            const data: Rec<Data> = JSON.parse(event.data);
            if (!data) return;
            cachePartialUpdates(data)
        };
        if (subscriptionBuffer.size) ws.send(JSON.stringify(Object.fromEntries(subscriptionBuffer)))
    }

    function cachePartialUpdates(data: Rec<Data>) {
        foreachDepth2(data, (ac, ticker, entry) => {
            const key = [ac, 'scraped', ticker];
            const prev: Rec<Data> = queryClient.getQueryData(key) ?? {}
            const update: Rec<Data> = {[ac]: {[ticker]: entry}};
            const next: Rec<Data> = mergeDepth2(prev, update)
            queryClient.setQueryData(key, next);
        });
    }

    function subscribe(ac: string, tickers: string[]) {
        if (!ws) {
            addSubs(ac, tickers, subscriptionBuffer);
        } else {
            const newTickers = addSubs(ac, tickers, subscription);
            if (newTickers) ws.send(JSON.stringify({ [ac]: newTickers }));
        }
    }

    function addSubs(ac: string, tickers: string[], target: Map<string, Set<string>>): string[] | undefined {
        const prevSet = subscription.get(ac) ?? new Set();
        const newTickers = [...new Set(tickers).difference(prevSet)]
        if (!newTickers.length) return;
        target.set(ac, new Set([...prevSet, ...newTickers]))
        return newTickers
    }

    function close() {
        if (ws && (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
        )) {
            ws.close();
        }
    }

    return { open, subscribe, close };
}

function url() {
    const isSsl = window.location.protocol === "https:";
    const protocol = isSsl ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_SCRAPER_URL?.replace(/^https?:/, protocol);
    return `${baseUrl}/data-live`
}

