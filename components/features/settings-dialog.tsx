"use client";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Import, Moon, Settings, Sun} from "lucide-react"
import React, {useCallback, useState} from "react";
import {Data} from "@/lib/data";
import PositionsImporter from "@/components/features/positions-importer";
import {Fab, FabMenuItem} from "@/components/ui/fab";
import {getAppliedTheme, toggleTheme} from "@/lib/theme";
import {Rec} from "@/lib/utils/records";

type Props = {
    classOfTickers: Map<string, string>
    setPositions(p: React.SetStateAction<Rec<Data>>): void
    openPanel: string | null
    setOpenPanel(o: React.SetStateAction<string | null>): void
}

export function SettingsDialog(props: Props) {

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

    return <>
        <Fab icon={<Settings className="size-6"/>} position="tr" label="Configurações">
            {({close}) => <>
                <FabMenuItem className="w-46" onClick={trigger("import", close)}>
                    <Import className="size-4"/>
                    Importar B3
                </FabMenuItem>
                <FabMenuItem className="w-46" onClick={() => { toggleTheme(); close(); }}>
                    <Sun className="size-4 hidden dark:block"/>
                    <Moon className="size-4 dark:hidden"/>
                    {getAppliedTheme() == "light" ? "Tema Escuro" : "Tema Claro"}
                </FabMenuItem>
            </>}
        </Fab>
        <Dialog open={openPanel === "import"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="tr" hideOverlay className="sm:max-w-[28rem] p-4" aria-describedby={undefined}>
                <DialogHeader><DialogTitle>Importar Posição B3</DialogTitle></DialogHeader>
                <PositionsImporter
                    setPositions={props.setPositions}
                    classOfTickers={props.classOfTickers}
                />
            </DialogContent>
        </Dialog>
    </>
}
