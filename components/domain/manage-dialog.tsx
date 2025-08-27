import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Settings, Columns3, Rows2, Import} from "lucide-react"
import {RowSelector} from "@/components/domain/row-selector";
import React, {useCallback, useState} from "react";
import {Data} from "@/lib/data";
import PositionsImporter from "@/components/domain/positions-importer";
import {Header} from "@/lib/metadata/defaults";
import ColumnOrderer from "@/components/domain/column-orderer";
import {ColumnSelector} from "@/components/domain/column-selector";
import {Fab, FabMenuItem} from "@/components/ui/fab";

type Props = {
    allKeys: string[]
    rows: string[]
    columns: Header[]
    setRows(rows: string[]): void
    setColumns(columns: Header[]): void
    setPositions(positions: Data): void
}

type MenuItem = null | "rows" | "cols" | "import";

export function ManageDialog(props: Props) {
    const [openPanel, setOpenPanel] = useState<MenuItem>(null)
    const close = useCallback(() => setOpenPanel(null), [])
    function trigger(item: MenuItem, close: () => void) {
        return () => { setOpenPanel(item); close(); }
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
            </>}
        </Fab>

        <Dialog open={openPanel === "rows"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="br" hideOverlay className="sm:max-w-[28rem] p-4">
                <DialogHeader><DialogTitle>Customizar Linhas</DialogTitle></DialogHeader>
                <RowSelector {...props}/>
            </DialogContent>
        </Dialog>

        <Dialog open={openPanel === "cols"} onOpenChange={(o) => !o && close()}>
            <DialogContent position="br" hideOverlay className="sm:max-w-[44rem] w-[90vw] max-w-[90vw] p-4">
                <DialogHeader><DialogTitle>Customizar Colunas</DialogTitle></DialogHeader>
                <div className="flex justify-between gap-4">
                    <div className="flex-2/3 overflow-auto">
                        <ColumnOrderer {...props} />
                    </div>
                    <ColumnSelector {...props}/>
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
