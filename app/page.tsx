"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Metadata} from "@/lib/data";
import {makeLabelGetter} from "@/lib/metadata/labels";
import {Skeleton} from "@/components/ui/skeleton";
import {SettingsDialog} from "@/components/features/settings-dialog";
import {DataGrid} from "@/components/features/data-grid";
import {mapValues, Rec, recordOfKeys} from "@/lib/utils/records";
import {indexByFields} from "@/lib/utils/collections";
import {ViewSelector} from "@/components/features/views/view-selector";
import {loadPositions, savePositions} from "@/lib/local-storage/local-storage";
import {fetchMeta, useQuotes, useScraped} from "@/lib/api-client";

export default function Page() {

    // query results
    const [metadata, setMetadata] = useState<Rec<Metadata> | null>(null);

    // user defined state
    const [assetClass, setAssetClass] = useState<string | null>(null);
    const [rows, setRows] = useState<string[] | null>(null);
    const [columns, setColumns] = useState<string[] | null>(null);
    const [positions, setPositions] = useState<Rec<Data>>({});

    useEffect(() => {
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
        savePositions(positions);
    }, [positions]);

    const scraped = useScraped(assetClass, rows);
    const quotes = useQuotes(rows, classOfTicker);

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
                              getLabel={getLabel[assetClass]}/>
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

function skeleton() {
    return <div className="m-4">
        <Skeleton className="h-7 w-[8vw] m-2"/>
        <Skeleton className="h-7 w-[45vw] m-2"/>
        <Skeleton className="h-7 w-[30vw] m-2"/>
        <Skeleton className="h-[60vh] w-full rounded-lg"/>
    </div>
}