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
import {Header} from "@/components/ui/ticker-grid";
import {ManageDialogRows} from "@/components/ui/manage-dialog-rows";
import {HeaderOption, ManageDialogCols} from "@/components/ui/manage-dialog-cols";
import {useEffect, useState} from "react";

type Props = {
    tickers: string[]
    allHeaders: HeaderOption[]
    headers: string[]
    getLabel(key: string): string
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

    function convertHeaders(options: string[]): Header[] {
        const map = new Map<string, string[]>();
        options.forEach(path => {
            let [group, key] = path.split(".")
            if (!map.has(group)) map.set(group, []);
            map.get(group)!.push(key);
        });
        return Array.from(map.entries());
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <form>
            <DialogTrigger asChild>
                <Button variant="ghost"><Settings/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Manage Table</DialogTitle>
                </DialogHeader>
                <div className="flex justify-between">
                    <ManageDialogRows style={{ flex: '0.1 1 auto' }} setTickerSelection={setTickerSelection}
                                      tickers={tickerSelection}/>
                    <ManageDialogCols style={{ flex: '1 1 auto' }} setHeaderSelection={setHeaderSelection}
                                      allHeaders={props.allHeaders} selectedHeaders={headerSelection}
                                      getLabel={props.getLabel}/>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={save}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </form>
    </Dialog>
}
