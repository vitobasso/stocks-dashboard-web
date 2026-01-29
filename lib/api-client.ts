import {allKeys, mergeRecords, Rec} from "@/lib/utils/records";
import {Data, Metadata, splitByAssetClass} from "@/lib/data";

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