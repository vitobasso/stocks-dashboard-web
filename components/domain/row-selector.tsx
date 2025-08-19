import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input";
import {PlusIcon, XIcon} from "lucide-react"
import {useState} from "react";

type Props = {
    tickers: string[]
    setTickers(tickers: string[]): void
}

export function RowSelector(props: Props) {

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

    return <div className="dialog max-w-30 p-1">
        <div className="flex w-full">
            <Input id="input-ticker" placeholder="Add..." className="flex-1"
                   onChange={e => setNewTicker(e.target.value)}
                   onKeyUp={handleEnterKey}/>
            <Button size="icon" className="size-8 ml-2 mr-1" onClick={() => addTicker(newTicker)}>
                <PlusIcon/>
            </Button>
        </div>
        <div className="w-full max-h-125 p-1 overflow-y-auto">
            <ul>
                {props.tickers.map(t =>
                    <li key={t} className="flex w-full justify-between font-mono">
                        <span>{t}</span>
                        <Button variant="ghost" className="size-7"
                                onClick={() => removeTicker(t)}>
                            <XIcon/>
                        </Button>
                    </li>)}
            </ul>
        </div>
    </div>
}
