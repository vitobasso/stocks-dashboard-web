"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Metadata} from "@/lib/data";
import {consolidateSchema} from "@/lib/schema";
import {Label, makeLabelGetter} from "@/lib/metadata/labels";
import {ManageDialog} from "@/components/domain/manage-dialog";
import {DataGrid} from "@/components/domain/data-grid";
import {Analytics} from "@vercel/analytics/next"
import {defaultColumns, defaultRows, Header} from "@/lib/metadata/defaults";
import {applyTheme, getStoredTheme} from "@/lib/theme";

export default function Page() {

    // query results
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [scraped, setScraped] = useState<Data>({});
    const [quotes, setQuotes] = useState<Data>({});

    // derived state
    const [rows, setRows] = useState<string[] | null>(null);
    const [columns, setColumns] = useState<Header[] | null>(null);
    const [positions, setPositions] = useState<Data>({});

    const schema: string[] | undefined = useMemo(() => {
        if (metadata) return consolidateSchema(metadata.schema)
    }, [metadata]);

    const getLabel: ((path: string) => Label) | undefined = useMemo(() => {
        if (metadata) return makeLabelGetter(metadata.labels, metadata.sources)
    }, [metadata]);

    const data: Data = useMemo(() => consolidateData([scraped, quotes, positions]), [scraped, quotes, positions]);

    useEffect(() => {
        applyStoredTheme();
        setRows(loadRows(localStorage));
        setColumns(loadColumns(localStorage));
        setPositions(loadPositions(localStorage));

        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta")
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

    if (!rows || !columns || !schema || !getLabel) return;
    return <>
        <div className="flex justify-between p-1">
            <ManageDialog rows={rows} setRows={setRows} columns={columns} setColumns={setColumns}
                          allKeys={schema} getLabel={getLabel} setPositions={setPositions}/>
        </div>
        <DataGrid style={{height: "100vh"}} rows={rows} columns={columns} data={data} getLabel={getLabel}/>
        <Analytics/>
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

function applyStoredTheme() {
    const theme = getStoredTheme(localStorage);
    if (theme) applyTheme(theme);
}