"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data} from "@/lib/data";
import {consolidateSchema} from "@/lib/schema";
import {ManageDialog} from "@/components/domain/manage-dialog";
import {DataGrid} from "@/components/domain/data-grid";
import {Analytics} from "@vercel/analytics/next"
import {defaultColumns, defaultRows, Header} from "@/lib/metadata/defaults";

export default function Home() {

    // query results
    const [metadata, setMetadata] = useState<{schema: string[]} | null>(null);
    const [scraped, setScraped] = useState<Data>({});
    const [quotes, setQuotes] = useState<Data>({});

    // derived state
    const [rows, setRows] = useState<string[] | null>(null);
    const [columns, setColumns] = useState<Header[] | null>(null);
    const [positions, setPositions] = useState<Data>({});

    const schema: string[] | undefined = useMemo(() => {
        if (metadata) return consolidateSchema(metadata.schema)
    }, [metadata]);

    const data: Data = useMemo(() => consolidateData([scraped, quotes, positions]), [scraped, quotes, positions]);

    useEffect(() => {
        setRows(loadRows(localStorage));
        setColumns(loadColumns(localStorage));
        setPositions(loadPositions(localStorage));

        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/schema")
            .then(res => res.json())
            .then(json => setMetadata(json));
    }, []);

    useEffect(() => {
        localStorage.setItem("rows", JSON.stringify(rows?.toSorted()));

        rows?.length && fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?tickers=${rows.join(",")}`)
            .then(res => res.json())
            .then(json => setScraped(json));

        rows?.length && fetch("/api/quotes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tickers: rows}),
        })
            .then(res => res.json())
            .then(json => setQuotes(json));
    }, [rows]);

    useEffect(() => {
        localStorage.setItem("columns", JSON.stringify(columns));
    }, [columns]);

    useEffect(() => {
        localStorage.setItem("positions", JSON.stringify(positions));
    }, [positions]);

    if (!schema || !rows || !columns) return;
    return <>
        <div className="flex justify-between p-1">
            <ManageDialog rows={rows} setRows={setRows} columns={columns} setColumns={setColumns}
                          allKeys={schema} setPositions={setPositions} />
        </div>
        <DataGrid style={{height: "100vh"}} rows={rows} columns={columns} data={data}/>
        <Analytics />
    </>
}

function loadRows(localStorage: Storage): string[] {
    let rawString = localStorage.getItem("rows");
    return rawString?.length && JSON.parse(rawString) || defaultRows;
}

function loadColumns(localStorage: Storage): Header[] {
    let rawString = localStorage.getItem("columns");
    return rawString?.length && JSON.parse(rawString) || defaultColumns;
}

function loadPositions(localStorage: Storage): Data {
    let rawString = localStorage.getItem("positions");
    return rawString?.length && JSON.parse(rawString) || [];
}