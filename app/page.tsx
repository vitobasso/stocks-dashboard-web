"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Data} from "@/lib/data";
import {makeLabeler} from "@/lib/metadata/labels";
import {Skeleton} from "@/components/ui/skeleton";
import {SettingsDialog} from "@/components/features/settings-dialog";
import {DataGrid} from "@/components/features/data-grid/data-grid";
import {mapValues, Rec, recordOfKeys} from "@/lib/utils/records";
import {indexByFields} from "@/lib/utils/collections";
import {ViewSelector} from "@/components/features/views/view-selector";
import {loadPositions, savePositions} from "@/lib/local-storage/local-storage";
import {useMetadataQuery} from "@/lib/services/use-metadata-query";
import {useQuoteQuery} from "@/lib/services/use-quote-query";
import {useScrapedQuery} from "@/lib/services/use-scraped-query";
import {useScrapedSubscription} from "@/lib/services/use-scraped-subscription";

export default function Page() {

    const metadata = useMetadataQuery()

    // user defined state
    const [ac, setAc] = useState<string | null>(null);
    const [rows, setRows] = useState<string[] | null>(null);
    const [columns, setColumns] = useState<string[] | null>(null);
    const [positions, setPositions] = useState<Rec<Data>>({});

    useEffect(() => {
        setPositions(loadPositions());
    }, []);

    useEffect(() => {
        savePositions(positions);
    }, [positions]);

    const {assetClasses, labeler, classOfTicker} = useMemo(() => {
        if (!metadata) return {assetClasses: undefined, labeler: undefined, classOfTicker: undefined};

        const assetClasses = Object.keys(metadata);
        const labeler = recordOfKeys(assetClasses, (ac) =>
            makeLabeler(metadata[ac].labels, metadata[ac].sources)
        );
        const classOfTicker = indexByFields(mapValues(metadata, (m) => m.tickers));

        return {assetClasses, labeler, classOfTicker};
    }, [metadata]);

    const scrapedSubscription = useScrapedSubscription();
    useEffect(() => {
        if (!ac || !rows) return;
        scrapedSubscription.add(ac, rows)
    }, [ac, rows, scrapedSubscription]);

    const scraped = useScrapedQuery(ac, rows);
    const quotes = useQuoteQuery(rows, classOfTicker);

    const data: Rec<Data> | undefined = useMemo(() => {
        if (!assetClasses || !rows) return;
        const base: Data = Object.fromEntries(rows.map((r) => [r, {}]))
        return recordOfKeys(assetClasses, (ac => consolidateData([base, scraped[ac], quotes[ac], positions[ac]], ac)))
    }, [rows, scraped, quotes, positions, assetClasses]);

    // ui
    const [openPanel, setOpenPanel] = useState<string | null>(null)

    if (!metadata || !assetClasses || !labeler)
        return pageSkeleton();
    return <div className="min-h-screen flex flex-col">
        <div className="flex flex-col gap-2 m-4">
            <ViewSelector metadata={metadata} labeler={labeler}
                          setAssetClass={setAc} setRows={setRows} setCols={setColumns} />
            {(!ac || !rows || !columns || !metadata || !classOfTicker || !data) ? dataGridSkeleton() :
                <>
                    <DataGrid className="flex-1"
                              rows={rows} columns={columns} data={data[ac]}
                              metadata={metadata[ac]} labeler={labeler[ac]}/>
                    <SettingsDialog setPositions={setPositions} classOfTickers={classOfTicker}
                                    openPanel={openPanel} setOpenPanel={setOpenPanel}/>
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

function pageSkeleton() {
    return <div className="m-4">
        <Skeleton className="h-7 w-[8vw] m-2"/>
        <Skeleton className="h-7 w-[45vw] m-2"/>
        <Skeleton className="h-7 w-[30vw] m-2"/>
        {dataGridSkeleton()}
    </div>
}

function dataGridSkeleton() {
    return <Skeleton className="h-[60vh] w-full rounded-lg"/>
}