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
import {ManageDialogRows} from "@/components/ui/manage-dialog-rows";
import {ManageDialogCols} from "@/components/ui/manage-dialog-cols";
import {useEffect, useState} from "react";
import {Header, Label} from "@/app/page";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

type Props = {
    tickers: string[]
    allHeaders: string[]
    headers: string[]
    getLabel(key: string): Label
    setTickers(tickers: string[]): void
    setHeaders(headers: Header[]): void
}

export function ManageDialog(props: Props) {
    let [open, setOpen] = useState(false)
    let [tickerSelection, setTickerSelection] = useState<string[]>(props.tickers);
    let [headerSelection, setHeaderSelection] = useState<string[]>(props.headers);

    useEffect(() => {
        if (open) {
            setTickerSelection(props.tickers);
            setHeaderSelection(props.headers);
        }
    }, [open, props.tickers, props.headers]);

    function save() {
        props.setTickers(tickerSelection)
        props.setHeaders(convertHeaders(headerSelection))
        setOpen(false)
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="left-0" asChild>
            <Settings className="size-8 p-1"/>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
                <DialogTitle>Customizar</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="rows">
                <TabsList>
                    <TabsTrigger value="rows">Linhas</TabsTrigger>
                    <TabsTrigger value="cols">Colunas</TabsTrigger>
                </TabsList>
                <TabsContent value="rows">
                    <ManageDialogRows style={{ flex: '0.1 1 auto' }} setTickerSelection={setTickerSelection}
                                      tickers={tickerSelection}/>
                </TabsContent>
                <TabsContent value="cols">
                    <ManageDialogCols style={{ flex: '1 1 auto' }} setHeaderSelection={setHeaderSelection}
                                      allHeaders={props.allHeaders} selectedHeaders={headerSelection}
                                      getLabel={props.getLabel}/>
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

function convertHeaders(options: string[]): Header[] {
    const map = new Map<string, string[]>();
    options.forEach(key => {
        let group = getHeaderGroup(key)
        if (!map.has(group)) map.set(group, []);
        map.get(group)!.push(key);
    });
    return Array.from(map.entries());
}

function getHeaderGroup(path: string): string {
    let prefixMap: Record<string, string> = {
        "": "",
        "b3_position": "Posição",
        "quotes": "Preço",
        "yahoo_chart": "Preço",
        "statusinvest": "Fundamentos",
        "simplywallst": "Score",
        "yahoo_api_rating": "Recomendação",
        "derived_forecast": "Previsão",
    }
    let group = path == "ticker" ? "" : path.split(".")[0];
    return prefixMap[group] ?? path
}