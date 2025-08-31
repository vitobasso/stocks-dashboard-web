"use client";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Columns3, Import, Moon, Rows2, Settings, Sun} from "lucide-react"
import {RowSelector} from "@/components/domain/row-selector";
import React, {useCallback, useMemo, useState} from "react";
import {Data, Metadata} from "@/lib/data";
import {Header} from "@/lib/metadata/defaults";
import {Label} from "@/lib/metadata/labels";
import PositionsImporter from "@/components/domain/positions-importer";
import ColumnOrderer from "@/components/domain/column-orderer";
import {ColumnSelector} from "@/components/domain/column-selector";
import {Fab, FabMenuItem} from "@/components/ui/fab";
import {toggleAppliedTheme} from "@/lib/theme";
import {Rec, recordOfKeys} from "@/lib/utils/records";
import {consolidateSchema} from "@/lib/schema";
import {StateSetter} from "@/lib/utils/react";

type Props = {
    metadata: Rec<Metadata>
    getLabel: Rec<(path: string) => Label>
    classOfTickers: Map<string, string>
    rows: Rec<string[]>
    setRows: Rec<StateSetter<string[]>>
    columns: Rec<Header[]>
    setColumns: Rec<StateSetter<Header[]>>
    setPositions(p: React.SetStateAction<Rec<Data>>): void
    openPanel: string | null
    setOpenPanel(o: React.SetStateAction<string | null>): void
    groupFilter: string | null
}

export function ManageDialog(props: Props) {

    const { assetClasses, allKeys } = useMemo(() => {
        if (!props.metadata) return { assetClasses: undefined, allKeys: undefined };
        const assetClasses = Object.keys(props.metadata);
        const allKeys = recordOfKeys(assetClasses, ac => consolidateSchema(props.metadata[ac].schema));
        return { assetClasses, allKeys };
    }, [props.metadata]);

    const [internalOpen, setInternalOpen] = useState<string | null>(null)
    const openPanel = props.openPanel ?? internalOpen
    const setOpenPanel = props.setOpenPanel ?? setInternalOpen //FIXME props.setOpenPanel is never undefined so setInternalOpen is never called?
    const close = useCallback(() => setOpenPanel(null), [setOpenPanel])

    function trigger(item: string, close: () => void) {
        return () => { 
            setOpenPanel(item);
            close(); 
        }
    }

    function toggleTheme() {
        const t = toggleAppliedTheme();
        try { localStorage.setItem("theme", t); } catch {}
    }

    if (!assetClasses || !allKeys) return;
    return <>
        <Fab icon={<Settings className="size-6"/>} position="br" direction="up" label="Abrir menu de ações">
            {({close}) => <>
                {assetClasses.map(ac =>
                    <div key={ac}>
                        <FabMenuItem onClick={trigger(`${ac}-rows`, close)}>
                            <Rows2 className="size-4"/>
                            {props.getLabel[ac](ac).short} - Linhas
                        </FabMenuItem>
                        <FabMenuItem onClick={trigger(`${ac}-cols`, close)}>
                            <Columns3 className="size-4"/>
                            {props.getLabel[ac](ac).short} - Colunas
                        </FabMenuItem>
                    </div>
                )}
                <FabMenuItem onClick={trigger("import", close)}>
                    <Import className="size-4"/>
                    Importar
                </FabMenuItem>
                <FabMenuItem onClick={() => { toggleTheme(); close(); }}>
                    <Sun className="size-4 hidden dark:block"/>
                    <Moon className="size-4 dark:hidden"/>
                    Tema
                </FabMenuItem>
            </>}
        </Fab>

        {assetClasses.map(ac =>
            <div key={ac}>
                <Dialog open={openPanel === `${ac}-rows`} onOpenChange={(o) => !o && close()}>
                    <DialogContent position="br" hideOverlay className="sm:max-w-[28rem] p-4">
                        <DialogHeader><DialogTitle>Customizar Linhas - {ac}</DialogTitle></DialogHeader>
                        <RowSelector
                            allTickers={props.metadata[ac].tickers}
                            rows={props.rows[ac]}
                            setRows={props.setRows[ac]}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={openPanel === `${ac}-cols`} onOpenChange={(o) => !o && close()}>
                    <DialogContent position="br" hideOverlay className="sm:max-w-[34rem] w-[90vw] p-4">
                        <DialogHeader><DialogTitle>Customizar Colunas - {ac}</DialogTitle></DialogHeader>
                        <div className="flex justify-between gap-4">
                            <ColumnSelector
                                allKeys={allKeys[ac]}
                                getLabel={props.getLabel[ac]}
                                columns={props.columns[ac]}
                                setColumns={props.setColumns[ac]}
                                groupFilter={props.groupFilter}
                            />
                            <div className="flex-1/2 overflow-auto">
                                <ColumnOrderer
                                    columns={props.columns[ac]}
                                    setColumns={props.setColumns[ac]}
                                    getLabel={props.getLabel[ac]}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )}

        <Dialog open={openPanel === "import"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="br" hideOverlay className="sm:max-w-[28rem] p-4">
                <DialogHeader><DialogTitle>Importar Posição</DialogTitle></DialogHeader>
                <PositionsImporter
                    setPositions={props.setPositions}
                    classOfTickers={props.classOfTickers}
                />
            </DialogContent>
        </Dialog>
    </>
}
