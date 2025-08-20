import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input";
import {PlusIcon, XIcon} from "lucide-react"
import {useState} from "react";
import {Badge} from "@/components/ui/badge";

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

    return <div className="dialog p-1 space-y-4">
        <div className="flex">
            <Input id="input-ticker" placeholder="Adicionar..." className="flex-1"
                   onChange={e => setNewTicker(e.target.value)}
                   onKeyUp={handleEnterKey}/>
            <Button size="icon" className="size-8 ml-2 mr-1" onClick={() => addTicker(newTicker)}>
                <PlusIcon/>
            </Button>
        </div>
        <div className="flex flex-wrap max-h-125 overflow-y-auto gap-1">
            {props.tickers.map(t =>
                <Badge key={t} variant="default" className="font-mono text-sm">
                    {t}
                    <button className="opacity-70 hover:opacity-100" aria-label={`Remove ${t}`}
                            onClick={() => removeTicker(t)}>
                        <XIcon className="h-3 w-3"/>
                    </button>
                </Badge>
            )}
        </div>
    </div>
}
