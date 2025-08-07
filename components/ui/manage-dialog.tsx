import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input";
import {PlusIcon, XIcon} from "lucide-react"
import {useState} from "react";

type Props = {
    tickers: string[]
    setTickers(tickers: string[]): void
}

export function ManageDialog(props: Props) {

    let [newTicker, setNewTicker] = useState("");

    function addTicker(newTicker: string) {
        newTicker = newTicker.toUpperCase();
        if (props.tickers.includes(newTicker)) return;
        let updatedTickers = [...props.tickers, newTicker];
        props.setTickers(updatedTickers);
    }

    function removeTicker(ticker: string) {
        let updatedTickers = props.tickers.filter(item => item !== ticker)
        props.setTickers(updatedTickers);
    }

    function handleEnterKey(arg: any) {
        if (arg.code == "Enter") {
            addTicker(newTicker)
        }
    }

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline">Manage Tickers</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Manage Tickers</DialogTitle>
                        <DialogDescription>
                            Add and remove tickers to the table.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="dialog max-w-30 max-h-120 overflow-y-auto">
                            <div className="flex w-full items-center">
                                <Input id="input-ticker" placeholder="Ticker..." className="flex-1"
                                       onChange={e => setNewTicker(e.target.value)}
                                       onKeyUp={handleEnterKey}/>
                                <Button size="icon" className="size-8">
                                    <PlusIcon/>
                                </Button>
                            </div>
                            <ul className="w-full">
                                {props.tickers.map(t => (
                                    <li key={t} className="flex w-full items-center justify-between">
                                        <span>{t}</span>
                                        <Button size="icon"
                                                className="size-8 bg-transparent hover:bg-transparent text-black"
                                                onClick={() => removeTicker(t)}>
                                            <XIcon/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
