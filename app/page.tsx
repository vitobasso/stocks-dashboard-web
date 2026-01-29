"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Metadata, splitByAssetClass} from "@/lib/data";
import {makeLabelGetter} from "@/lib/metadata/labels";
import {Skeleton} from "@/components/ui/skeleton";
import {SettingsDialog} from "@/components/domain/settings-dialog";
import {DataGrid} from "@/components/domain/data-grid";
import {applyTheme} from "@/lib/theme";
import {allKeys, mapValues, mergeRecords, Rec, recordOfKeys} from "@/lib/utils/records";
import {indexByFields} from "@/lib/utils/collections";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ViewSelector} from "@/components/domain/view-selector";
import {loadPositions, loadTheme, savePositions} from "@/lib/local-storage/local-storage";

export default function Page() {

    // query results
    const [metadata, setMetadata] = useState<Rec<Metadata> | null>(null);
    const [scraped, setScraped] = useState<Rec<Data>>({});
    const [quotes, setQuotes] = useState<Rec<Data>>({});

    // user defined state
    const [assetClass, setAssetClass] = useState<string | null>(null);
    const [rows, setRows] = useState<string[] | null>(null);
    const [columns, setColumns] = useState<string[] | null>(null);
    const [positions, setPositions] = useState<Rec<Data>>({});

    useEffect(() => {
        applyStoredTheme();
        setPositions(loadPositions());
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
        if (!assetClass || !rows) return;
        fetchScraped(assetClass, rows).then(setScraped);
        return listenScraped(assetClass, rows, setScraped);
    }, [assetClass, rows]);

    useEffect(() => {
        if (!rows || !classOfTicker) return;
        fetchQuotes(rows, classOfTicker).then(setQuotes);
    }, [assetClass, rows, classOfTicker]);

    useEffect(() => {
        savePositions(positions);
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

    if (!metadata || !assetClasses || !getLabel)
        return skeleton();
    return <div className="min-h-screen flex flex-col">
        <div className="flex flex-col gap-2 m-4">
            <ViewSelector metadata={metadata} getLabel={getLabel}
                          setAssetClass={setAssetClass} setRows={setRows} setCols={setColumns} />
            {(!assetClass || !rows || !columns || !metadata || !data || !classOfTicker) ? skeleton() :
                <>
                    <DataGrid className="h-auto"
                              rows={rows} columns={columns} data={data[assetClass]}
                              getLabel={getLabel[assetClass]}
                              onGroupHeaderClick={onGroupHeaderClick(assetClass)}/>
                    <SettingsDialog metadata={metadata} getLabel={getLabel}
                                    setPositions={setPositions} classOfTickers={classOfTicker}
                                    openPanel={openPanel} setOpenPanel={onOpenPanelChange} groupFilter={groupFilter}/>
                </>
            }
        </div>
        <footer className="mt-auto border-t border-border mx-6 py-6 text-center text-xs text-muted-foreground">
            <p className="mt-2">
                As informações fornecidas neste site não constituem aconselhamento financeiro.
                Use por sua conta e risco.
            </p>
            <p>
                <a href="mailto:monitor.de.acoes.br@gmail.com" className="hover:underline">
                    monitor.de.acoes.br@gmail.com
                </a>
            </p>
        </footer>
    </div>

}

async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}

async function fetchScraped(ac: string, rows: string[]): Promise<Rec<Data>> {
    const urlParams = scraperParams(ac, rows);
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
    return await res.json();
}

async function fetchQuotes(rows: string[], classOfTicker: Map<string, string>): Promise<Rec<Data>> {
    if (!rows.length) return {};

    const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tickers: rows})
    });
    const data: Data = await res.json();
    return splitByAssetClass(data, classOfTicker);
}

function listenScraped(ac: string, rows: string[], setScraped: (value: ((prevState: Rec<Data>) => Rec<Data>)) => void) {
    const ws = new WebSocket(scraperLiveUrl(ac, rows));

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

function scraperLiveUrl(ac: string, rows: string[]) {
    const urlParams = scraperParams(ac, rows);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_SCRAPER_URL?.replace(/^https?:/, protocol);
    return `${baseUrl}/data-live?${urlParams.toString()}`
}

function applyStoredTheme() {
    const theme = loadTheme();
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