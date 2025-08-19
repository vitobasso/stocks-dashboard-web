import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input";
import {PlusIcon, XIcon} from "lucide-react"
import {CSSProperties, useState} from "react";

type Props = {
    tickers: string[]
    setTickerSelection(tickers: string[]): void
    className?: string
    style?: CSSProperties
}

export function ManageDialogRows(props: Props) {

    let [newTicker, setNewTicker] = useState("");

    function addTicker(newTicker: string) {
        newTicker = newTicker.toUpperCase();
        if (props.tickers.includes(newTicker)) return;
        let updatedTickers = [...props.tickers, newTicker];
        props.setTickerSelection(updatedTickers);
    }

    function removeTicker(ticker: string) {
        let updatedTickers = props.tickers.filter(item => item !== ticker)
        props.setTickerSelection(updatedTickers);
    }

    function handleEnterKey(arg: any) {
        if (arg.code == "Enter") {
            addTicker(newTicker)
        }
    }

    return <div className={props.className} style={{...props.style}}>
        <div className="dialog max-w-30 p-1">
            <div className="flex w-full">
                <Input id="input-ticker" placeholder="Add..." className="flex-1"
                       onChange={e => setNewTicker(e.target.value)}
                       onKeyUp={handleEnterKey}/>
                <Button size="icon" className="size-8 ml-2 mr-1">
                    <PlusIcon/>
                </Button>
            </div>
            <div className="w-full max-h-106 p-1 overflow-y-auto">
                <ul>
                    {props.tickers.map(t => <li key={t} className="flex w-full justify-between font-mono">
                            <span>{t}</span>
                            <Button variant="ghost" className="size-7"
                                    onClick={() => removeTicker(t)}>
                                <XIcon/>
                            </Button>
                        </li>)}
                </ul>
            </div>
        </div>
    </div>
}
