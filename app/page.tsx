"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Metadata, splitByAssetClass} from "@/lib/data";
import {makeLabelGetter} from "@/lib/metadata/labels";
import {Skeleton} from "@/components/ui/skeleton";
import {ManageDialog} from "@/components/domain/manage-dialog";
import {DataGrid} from "@/components/domain/data-grid";
import {Analytics} from "@vercel/analytics/next"
import {defaultColumns, defaultRows, Header} from "@/lib/metadata/defaults";
import {applyTheme, getStoredTheme} from "@/lib/theme";
import {allKeys, mapValues, mergeRecords, Rec, recordOfKeys, settersByKey} from "@/lib/utils/records";
import {indexByFields} from "@/lib/utils/collections";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function Page() {

    // query results
    const [metadata, setMetadata] = useState<Rec<Metadata> | null>(null);
    const [scraped, setScraped] = useState<Rec<Data>>({});
    const [quotes, setQuotes] = useState<Rec<Data>>({});

    // user defined state
    const [rows, setRows] = useState<Rec<string[]> | null>(null);
    const [columns, setColumns] = useState<Rec<Header[]> | null>(null);
    const [positions, setPositions] = useState<Rec<Data>>({});

    useEffect(() => {
        applyStoredTheme();
        setRows(loadRows(localStorage));
        setColumns(loadColumns(localStorage));
        setPositions(loadPositions(localStorage));
        fetchMeta().then(setMetadata);
    }, []);

    const {assetClasses, getLabel, classOfTicker} = useMemo(() => {
        if (!metadata) return {assetClasses: undefined, getLabel: undefined, classOfTicker: undefined};

        const assetClasses = Object.keys(metadata);
        const getLabel = recordOfKeys(assetClasses, (ac) =>
            makeLabelGetter(metadata[ac].labels, metadata[ac].sources)
        );
        const classOfTicker = indexByFields(mapValues(metadata, (m) => m.tickers));

        return {assetClasses, getLabel, classOfTicker};
    }, [metadata]);

    useEffect(() => {
        if (!rows) return;
        localStorage.setItem("rows", JSON.stringify(mapValues(rows, (v) => v.toSorted())));
        fetchScraped(rows).then(setScraped);
        return listenScraped(rows, setScraped);
    }, [rows]);

    useEffect(() => {
        if (!rows || !classOfTicker) return;
        fetchQuotes(rows, classOfTicker).then(setQuotes);
    }, [rows, classOfTicker]);

    useEffect(() => {
        localStorage.setItem("columns", JSON.stringify(columns));
    }, [columns]);

    useEffect(() => {
        localStorage.setItem("positions", JSON.stringify(positions));
    }, [positions]);

    const data: Rec<Data> | undefined = useMemo(() => {
        if (assetClasses) return recordOfKeys(assetClasses, (ac => consolidateData([scraped[ac], quotes[ac], positions[ac]], ac)))
    }, [scraped, quotes, positions, assetClasses]);


    // ui
    const [openPanel, setOpenPanel] = useState<string | null>(null)
    const [groupFilter, setGroupFilter] = useState<string | null>(null)

    function onOpenPanelChange(m: React.SetStateAction<string | null>) {
        setOpenPanel(m);
        if (!m) setTimeout(() => setGroupFilter(null), 250); // wait for fade-out
    }

    function onGroupHeaderClick(assetClass: string) {
        return (g: string) => {
            setGroupFilter(g);
            setOpenPanel(`${assetClass}-cols`);
        }
    }

    function onTickerHeaderClick(assetClass: string) {
        return () => setOpenPanel(`${assetClass}-rows`);
    }

    if (!assetClasses || !metadata || !data || !getLabel || !classOfTicker || !rows || !columns) return skeleton();
    return <>
        <>
            {assetClasses.map(ac =>
                <Card key={ac} className="m-4 min-w-0">
                    <CardHeader>
                        <CardTitle>
                            <p className="text-xl font-bold">{getLabel[ac](ac).short}</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataGrid className="h-auto"
                                  rows={rows[ac]} columns={columns[ac]} data={data[ac]} getLabel={getLabel[ac]}
                                  onGroupHeaderClick={onGroupHeaderClick(ac)}
                                  onTickerHeaderClick={onTickerHeaderClick(ac)}/>
                    </CardContent>
                </Card>
            )}
            <ManageDialog metadata={metadata} getLabel={getLabel}
                          rows={rows} setRows={settersByKey(assetClasses, setRows)}
                          columns={columns} setColumns={settersByKey(assetClasses, setColumns)}
                          setPositions={setPositions} classOfTickers={classOfTicker}
                          openPanel={openPanel} setOpenPanel={onOpenPanelChange} groupFilter={groupFilter}/>
            <Analytics/>
        </>
        <footer className="border-t border-border mx-6 py-6 text-center text-xs text-muted-foreground">
            <p>
                Sugestões, enviar para:{" "}
                <a href="mailto:monitor.de.acoes.br@gmail.com" className="hover:underline">
                    monitor.de.acoes.br@gmail.com
                </a>
            </p>
            <p className="mt-2">
                As informações fornecidas neste site são apenas para fins informativos e não constituem aconselhamento financeiro. Use por sua conta e risco.
            </p>
        </footer>
    </>

}

async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}

async function fetchScraped(rows: Rec<string[]>): Promise<Rec<Data>> {
    const urlParams = scraperParams(rows);
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
    return await res.json();
}

async function fetchQuotes(rows: Rec<string[]>, classOfTicker: Map<string, string>): Promise<Rec<Data>> {
    const allTickers = Object.values(rows).flat();
    if (!allTickers.length) return {};

    const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tickers: allTickers})
    });
    const data: Data = await res.json();
    return splitByAssetClass(data, classOfTicker);
}

function listenScraped(rows: Rec<string[]>, setScraped: (value: ((prevState: Rec<Data>) => Rec<Data>)) => void) {
    const ws = new WebSocket(scraperLiveUrl(rows));

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

function scraperParams(rows: Rec<string[]>) {
    const urlParams = new URLSearchParams();
    for (const [assetClass, r] of Object.entries(rows)) {
        if (r.length) urlParams.append(assetClass, r.join(","));
    }
    return urlParams;
}

function scraperLiveUrl(rows: Rec<string[]>) {
    const urlParams = scraperParams(rows);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_SCRAPER_URL?.replace(/^https?:/, protocol);
    return `${baseUrl}/data-live?${urlParams.toString()}`
}

function loadRows(localStorage: Storage): Rec<string[]> {
    const rawString = localStorage.getItem("rows");
    return rawString?.length && JSON.parse(rawString) || defaultRows;
}

function loadColumns(localStorage: Storage): Rec<Header[]> {
    const rawString = localStorage.getItem("columns");
    return rawString?.length && JSON.parse(rawString) || defaultColumns;
}

function loadPositions(localStorage: Storage): Rec<Data> {
    const rawString = localStorage.getItem("positions");
    return rawString?.length && JSON.parse(rawString) || {};
}

function applyStoredTheme() {
    const theme = getStoredTheme(localStorage);
    if (theme) applyTheme(theme);
}

function skeleton() {
    return [1, 2].map(x =>
        <Card key={x} className="m-4">
            <CardHeader>
                <CardTitle>
                    <Skeleton className="h-10 w-40 mb-4"/>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full rounded-lg"/>
            </CardContent>
        </Card>
    )
}