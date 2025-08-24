"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data} from "@/lib/data";
import {consolidateSchema} from "@/lib/schema";
import {ManageDialog} from "@/components/domain/manage-dialog";
import {TickerGrid} from "@/components/domain/ticker-grid";
import {Analytics} from "@vercel/analytics/next"
import {Header, defaultHeaders, defaultTickers} from "@/lib/metadata/defaults";

export default function Home() {

    // query results
    const [metadata, setMetadata] = useState<{schema: string[]} | null>(null);
    const [scraped, setScraped] = useState<Data>({});
    const [quotes, setQuotes] = useState<Data>({});

    // derived state
    const [tickers, setTickers] = useState<string[] | null>(null);
    const [headers, setHeaders] = useState<Header[] | null>(null);
    const [positions, setPositions] = useState<Data>({});

    useEffect(() => {
        setTickers(loadTickers(localStorage));
        setHeaders(loadHeaders(localStorage));
        setPositions(loadPositions(localStorage));

        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/schema")
            .then(res => res.json())
            .then(json => setMetadata(json));
    }, []);

    useEffect(() => {
        localStorage.setItem("tickers", JSON.stringify(tickers?.toSorted()));

        tickers?.length && fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?tickers=${tickers.join(",")}`)
            .then(res => res.json())
            .then(json => setScraped(json));

        tickers?.length && fetch("/api/quotes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tickers}),
        })
            .then(res => res.json())
            .then(json => setQuotes(json));
    }, [tickers]);

    useEffect(() => {
        localStorage.setItem("headers", JSON.stringify(headers));
    }, [headers]);

    useEffect(() => {
        localStorage.setItem("positions", JSON.stringify(positions));
    }, [positions]);

    const schema: string[] | undefined = useMemo(() => {
        if (metadata) return consolidateSchema(metadata.schema)
    }, [metadata]);

    const data: Data = useMemo(() => consolidateData([scraped, quotes, positions]), [scraped, quotes, positions]);

    if (!schema || !tickers || !headers) return;
    return <>
        <div className="flex justify-between p-1">
            <ManageDialog tickers={tickers} setTickers={setTickers} headers={headers} setHeaders={setHeaders}
                          allKeys={schema} setPositions={setPositions} />
        </div>
        <TickerGrid style={{height: "100vh"}} tickers={tickers} headers={headers} data={data}/>
        <Analytics />
    </>
}

function loadTickers(localStorage: Storage): string[] {
    let rawString = localStorage.getItem("tickers");
    return rawString?.length && JSON.parse(rawString) || defaultTickers;
}

function loadHeaders(localStorage: Storage): Header[] {
    let rawString = localStorage.getItem("headers");
    return rawString?.length && JSON.parse(rawString) || defaultHeaders;
}

function loadPositions(localStorage: Storage): Data {
    let rawString = localStorage.getItem("positions");
    return rawString?.length && JSON.parse(rawString) || [];
}