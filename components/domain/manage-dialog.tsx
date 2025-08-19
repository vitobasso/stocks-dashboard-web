import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Settings} from "lucide-react"
import {ManageDialogRows} from "@/components/domain/manage-dialog-rows";
import {ManageDialogCols} from "@/components/domain/manage-dialog-cols";
import {useEffect, useState} from "react";
import {Data} from "@/lib/data";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ImportPositions from "@/components/domain/import-positions";
import {getLabel} from "@/lib/metadata/labels";
import {Header} from "@/lib/metadata/defaults";

type Props = {
    allKeys: string[]
    tickers: string[]
    headers: Header[]
    setTickers(tickers: string[]): void
    setHeaders(headers: Header[]): void
    setPositions(positions: Data): void
}

export function ManageDialog(props: Props) {
    let [open, setOpen] = useState(false)
    let [tickerSelection, setTickerSelection] = useState<string[]>(props.tickers);
    let [headerSelection, setHeaderSelection] = useState<Header[]>(props.headers);

    useEffect(() => {
        if (open) {
            setTickerSelection(props.tickers);
            setHeaderSelection(props.headers);
        }
    }, [open, props.tickers, props.headers]);

    function save() {
        props.setTickers(tickerSelection)
        props.setHeaders(headerSelection)
        setOpen(false)
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="left-0" asChild>
            <Settings className="size-8 p-1"/>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Customizar</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="rows" className="h-120">
                <TabsList>
                    <TabsTrigger value="rows">Linhas</TabsTrigger>
                    <TabsTrigger value="cols">Colunas</TabsTrigger>
                    <TabsTrigger value="local-data">Importar</TabsTrigger>
                </TabsList>
                <TabsContent value="rows">
                    <ManageDialogRows style={{ flex: '0.1 1 auto' }} tickers={tickerSelection}
                                      setTickerSelection={setTickerSelection} />
                </TabsContent>
                <TabsContent value="cols">
                    <ManageDialogCols style={{ flex: '1 1 auto' }} allKeys={props.allKeys} getLabel={getLabel}
                                      selectedHeaders={headerSelection} setHeaderSelection={setHeaderSelection} />
                </TabsContent>
                <TabsContent value="local-data">
                    <ImportPositions setPositions={props.setPositions}/>
                </TabsContent>
            </Tabs>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={save}>Save changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}
