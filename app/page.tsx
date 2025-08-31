"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Metadata} from "@/lib/data";
import {consolidateSchema} from "@/lib/schema";
import {Label, makeLabelGetter} from "@/lib/metadata/labels";
import {ManageDialog, MenuItem} from "@/components/domain/manage-dialog";
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

        if (rows?.length) fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?tickers=${rows.join(",")}`)
            .then(res => res.json())
            .then(json => setScraped(json));

        if (rows?.length) fetch("/api/quotes", {
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

    // ui
    const [openPanel, setOpenPanel] = useState<"rows" | "cols" | "import" | null>(null)
    const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)

    function onOpenPanelChange(m: MenuItem) {
        setOpenPanel(m);
        if (!m) setTimeout(() => setGroupFilter(undefined), 250); // wait for fade-out
    }

    function onGroupHeaderClick(g: string) {
        setGroupFilter(g);
        setOpenPanel("cols");
    }

    function onAddRowClick() {
        setOpenPanel("rows");
    }

    if (!rows || !columns || !schema || !getLabel) return;
    return <>
        <div className="flex justify-between p-1">
            <ManageDialog rows={rows} setRows={setRows} columns={columns} setColumns={setColumns}
                          allKeys={schema} getLabel={getLabel} setPositions={setPositions}
                          openPanel={openPanel} setOpenPanel={onOpenPanelChange} groupFilter={groupFilter}
                          allTickers={metadata?.tickers ?? []}
            />
        </div>
        <DataGrid style={{height: "100vh"}} rows={rows} columns={columns} data={data} getLabel={getLabel}
                  onGroupHeaderClick={onGroupHeaderClick} onAddRowClick={onAddRowClick}/>
        <Analytics/>
    </>
}

function loadRows(localStorage: Storage): string[] {
    const rawString = localStorage.getItem("rows");
    return rawString?.length && JSON.parse(rawString) || defaultRows;
}

function loadColumns(localStorage: Storage): Header[] {
    const rawString = localStorage.getItem("columns");
    return rawString?.length && JSON.parse(rawString) || defaultColumns;
}

function loadPositions(localStorage: Storage): Data {
    const rawString = localStorage.getItem("positions");
    return rawString?.length && JSON.parse(rawString) || [];
}

function applyStoredTheme() {
    const theme = getStoredTheme(localStorage);
    if (theme) applyTheme(theme);
}