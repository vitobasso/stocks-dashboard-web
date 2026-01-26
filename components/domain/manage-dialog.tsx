"use client";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Import, Moon, Settings, Sun} from "lucide-react"
import React, {useCallback, useMemo, useState} from "react";
import {Data, Metadata} from "@/lib/data";
import {Label} from "@/lib/metadata/labels";
import PositionsImporter from "@/components/domain/positions-importer";
import {Fab, FabMenuItem} from "@/components/ui/fab";
import {toggleAppliedTheme} from "@/lib/theme";
import {Rec, recordOfKeys} from "@/lib/utils/records";
import {consolidateSchema} from "@/lib/schema";

type Props = {
    metadata: Rec<Metadata>
    getLabel: Rec<(path: string) => Label>
    classOfTickers: Map<string, string>
    setPositions(p: React.SetStateAction<Rec<Data>>): void
    openPanel: string | null
    setOpenPanel(o: React.SetStateAction<string | null>): void
    groupFilter: string | null
}

export function ManageDialog(props: Props) {

    const { assetClasses, allKeys } = useMemo(() => {
        if (!props.metadata) return { assetClasses: undefined, allKeys: undefined };
        const assetClasses = Object.keys(props.metadata);
        const allKeys = recordOfKeys(assetClasses, ac => consolidateSchema(props.metadata[ac].schema, ac));
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
        <Fab icon={<Settings className="size-6"/>} position="tr" label="Customizar">
            {({close}) => <>
                <FabMenuItem className="w-46" onClick={trigger("import", close)}>
                    <Import className="size-4"/>
                    Importar
                </FabMenuItem>
                <FabMenuItem className="w-46" onClick={() => { toggleTheme(); close(); }}>
                    <Sun className="size-4 hidden dark:block"/>
                    <Moon className="size-4 dark:hidden"/>
                    Tema
                </FabMenuItem>
            </>}
        </Fab>
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
