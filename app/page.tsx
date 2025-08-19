"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data} from "@/lib/data";
import {consolidateSchema} from "@/lib/schema";
import {ManageDialog} from "@/components/domain/manage-dialog";
import {TickerGrid} from "@/components/domain/ticker-grid";
import {Analytics} from "@vercel/analytics/next"
import SelectVersion from "@/components/domain/select-version";
import {Header, defaultHeaders, defaultTickers} from "@/lib/metadata/defaults";

export default function Home() {

    // query results
    const [metadata, setMetadata] = useState<{versions: string[]; schema: string[]} | null>(null);
    const [scraped, setScraped] = useState<Map<string, Data>>(new Map);
    const [quotes, setQuotes] = useState<Data>({});

    // derived state
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [tickers, setTickers] = useState<string[] | null>(null);
    const [headers, setHeaders] = useState<Header[] | null>(null);
    const [positions, setPositions] = useState<Data>({});

    useEffect(() => {
        setTickers(loadTickers(localStorage));
        setHeaders(loadHeaders(localStorage));
        setPositions(loadPositions(localStorage));

        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/api/scraped")
            .then(res => res.json())
            .then(json => setMetadata(json));
    }, []);

    useEffect(() => {
        if (!selectedVersion || scraped.has(selectedVersion)) return
        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/api/scraped/${selectedVersion}`)
            .then(res => res.json())
            .then(json => setScraped(prev => new Map(prev).set(selectedVersion, json)));
    }, [selectedVersion]);

    useEffect(() => {
        localStorage.setItem("tickers", JSON.stringify(tickers));

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

    const versions: string[] | undefined = useMemo(() => metadata?.versions, [metadata]);

    const schema: string[] | undefined = useMemo(() => {
        if (metadata) return consolidateSchema(metadata.schema)
    }, [metadata]);

    const data: Data = useMemo(() => {
        let selectedData = scraped.get(selectedVersion) ?? {};
        return consolidateData([selectedData, quotes, positions])
    }, [selectedVersion, scraped, quotes, positions]);

    if (!schema || !versions || !tickers || !headers) return;
    return <>
        <div className="flex justify-between p-1">
            <SelectVersion selectedVersion={selectedVersion} setSelectedVersion={setSelectedVersion} versions={versions} />
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