"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Metadata, splitByAssetClass} from "@/lib/data";
import {makeLabelGetter} from "@/lib/metadata/labels";
import {ManageDialog} from "@/components/domain/manage-dialog";
import {DataGrid} from "@/components/domain/data-grid";
import {Analytics} from "@vercel/analytics/next"
import {defaultColumns, defaultRows, Header} from "@/lib/metadata/defaults";
import {applyTheme, getStoredTheme} from "@/lib/theme";
import {mapValues, Rec, recordOfKeys, settersByKey} from "@/lib/utils/records";
import {indexByFields} from "@/lib/utils/collections";

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
        if (!classOfTicker) return;
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

    if (!assetClasses || !metadata || !data || !getLabel || !classOfTicker || !rows || !columns) return;
    return <>
        {assetClasses.map(ac => <div key={ac} className="pb-6">
                <p className="text-xl font-bold p-2">{getLabel[ac](ac).short}</p>
                <DataGrid className="h-auto"
                          rows={rows[ac]} columns={columns[ac]} data={data[ac]} getLabel={getLabel[ac]}
                          onGroupHeaderClick={onGroupHeaderClick(ac)}/>
            </div>
        )}
        <ManageDialog metadata={metadata} getLabel={getLabel}
                      rows={rows} setRows={settersByKey(assetClasses, setRows)}
                      columns={columns} setColumns={settersByKey(assetClasses, setColumns)}
                      setPositions={setPositions} classOfTickers={classOfTicker}
                      openPanel={openPanel} setOpenPanel={onOpenPanelChange} groupFilter={groupFilter}/>
        <Analytics/>
    </>
}

async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}

async function fetchScraped(rows: Rec<string[]>): Promise<Rec<Data>> {
    const urlParams = new URLSearchParams();
    for (const [assetClass, r] of Object.entries(rows)) {
        if (r.length) urlParams.append(assetClass, r.join(","));
    }
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