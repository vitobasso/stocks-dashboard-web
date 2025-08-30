import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Settings, Columns3, Rows2, Import, Moon, Sun} from "lucide-react"
import {RowSelector} from "@/components/domain/row-selector";
import React, {useCallback, useState} from "react";
import {Data} from "@/lib/data";
import {Header} from "@/lib/metadata/defaults";
import {Label} from "@/lib/metadata/labels";
import PositionsImporter from "@/components/domain/positions-importer";
import ColumnOrderer from "@/components/domain/column-orderer";
import {ColumnSelector} from "@/components/domain/column-selector";
import {Fab, FabMenuItem} from "@/components/ui/fab";
import {toggleAppliedTheme} from "@/lib/theme";

type Props = {
    allKeys: string[]
    rows: string[]
    columns: Header[]
    setRows(rows: string[]): void
    setColumns(columns: Header[]): void
    getLabel: (path: string) => Label
    setPositions(positions: Data): void
}

type MenuItem = null | "rows" | "cols" | "import";

export function ManageDialog(props: Props) {

    const [openPanel, setOpenPanel] = useState<MenuItem>(null)
    const close = useCallback(() => setOpenPanel(null), [])

    function trigger(item: MenuItem, close: () => void) {
        return () => { setOpenPanel(item); close(); }
    }

    function toggleTheme() {
        const t = toggleAppliedTheme();
        try { localStorage.setItem("theme", t); } catch {}
    }

    return <>
        <Fab icon={<Settings className="size-6"/>} position="br" direction="up" label="Abrir menu de ações">
            {({ close }) => <>
                <FabMenuItem onClick={trigger("rows", close)}>
                    <Rows2 className="size-4"/>
                    Linhas
                </FabMenuItem>
                <FabMenuItem onClick={trigger("cols", close)}>
                    <Columns3 className="size-4"/>
                    Colunas
                </FabMenuItem>
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

        <Dialog open={openPanel === "rows"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="br" hideOverlay className="sm:max-w-[28rem] p-4">
                <DialogHeader><DialogTitle>Customizar Linhas</DialogTitle></DialogHeader>
                <RowSelector {...props}/>
            </DialogContent>
        </Dialog>

        <Dialog open={openPanel === "cols"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="br" hideOverlay className="sm:max-w-[34rem] w-[90vw] p-4">
                <DialogHeader><DialogTitle>Customizar Colunas</DialogTitle></DialogHeader>
                <div className="flex justify-between gap-4">
                    <ColumnSelector {...props}/>
                    <div className="flex-1/2 overflow-auto">
                        <ColumnOrderer {...props} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={openPanel === "import"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="br" hideOverlay className="sm:max-w-[28rem] p-4">
                <DialogHeader><DialogTitle>Importar Posição</DialogTitle></DialogHeader>
                <PositionsImporter {...props}/>
            </DialogContent>
        </Dialog>
    </>
}
