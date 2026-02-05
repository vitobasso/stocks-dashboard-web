"use client"

import {useEffect, useState} from "react";
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

    // metadata
    const metadata = useMetadataQuery()
    const assetClasses = metadata && Object.keys(metadata);
    const labeler = assetClasses && recordOfKeys(assetClasses, (ac) =>
        makeLabeler(metadata[ac].labels, metadata[ac].sources)
    );
    const classOfTicker = metadata && indexByFields(mapValues(metadata, (m) => m.tickers));

    // user defined state
    const [ac, setAc] = useState<string | undefined>(undefined);
    const [rows, setRows] = useState<string[] | undefined>(undefined);
    const [columns, setColumns] = useState<string[] | undefined>(undefined);
    const [positions, setPositions] = useState<Rec<Data>>(() => loadPositions());
    useEffect(() => savePositions(positions), [positions]);

    // data queries
    const scrapedSubscription = useScrapedSubscription();
    useEffect(() => {
        if (!ac || !rows) return;
        scrapedSubscription.add(ac, rows)
    }, [ac, rows, scrapedSubscription]);
    const scraped = useScrapedQuery(ac, rows);
    const quotes = useQuoteQuery(rows, classOfTicker);

    // consolidated data
    const baseData = rows && Object.fromEntries(rows.map((r) => [r, {}]))
    const data = assetClasses && baseData &&recordOfKeys(assetClasses, ac =>
        consolidateData([baseData, scraped[ac], quotes[ac], positions[ac]], ac)
    )

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