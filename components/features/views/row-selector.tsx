import {Input} from "@/components/ui/input";
import {XIcon} from "lucide-react"
import {forwardRef, useMemo, useState} from "react";
import {Badge} from "@/components/ui/badge";

type Props = {
    rows: string[]
    setRows(rows: string[]): void
    allTickers: string[]
    autoFocus?: boolean
}

export const RowSelector = forwardRef<HTMLInputElement, Props>((props, ref) => {

    const [newTicker, setNewTicker] = useState("");
    const [highlight, setHighlight] = useState(0);

    const suggestions = useMemo(() => {
        const q = newTicker.trim().toUpperCase();
        if (!q) return [] as string[];
        const set = new Set(props.rows);
        return props.allTickers
            .filter(t => t.includes(q) && !set.has(t))
            .slice(0, 10);
    }, [newTicker, props.rows, props.allTickers]);

    function addTicker(newTicker: string) {
        newTicker = newTicker.trim().toUpperCase();
        if (!newTicker) return;
        if (!props.allTickers.includes(newTicker)) return;
        if (props.rows.includes(newTicker)) return;
        const updatedTickers = [...props.rows, newTicker];
        props.setRows(updatedTickers);
        setNewTicker("");
        setHighlight(0);
    }

    function removeTicker(ticker: string) {
        const updatedTickers = props.rows.filter(item => item !== ticker)
        props.setRows(updatedTickers);
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (suggestions.length) setHighlight((h) => (h + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (suggestions.length) setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (suggestions.length) addTicker(suggestions[highlight] ?? newTicker);
            else addTicker(newTicker);
        } else if (e.key === "Escape") {
            setNewTicker("");
            setHighlight(0);
        }
    }

    return <div className="dialog p-1 space-y-4">
        <div className="flex relative">
            <Input id="input-ticker" inputMode="text" placeholder="Buscar..." value={newTicker} className="flex-1"
                   autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-autocomplete="list"
                   onChange={e => { setNewTicker(e.target.value); setHighlight(0); }}
                   onKeyDown={onKeyDown}
                   ref={ref} autoFocus={props.autoFocus}/>
            {newTicker && suggestions.length > 0 && (
                <div className="absolute left-0 right-12 top-full mt-1 z-20 max-h-40 overflow-auto rounded-md border bg-background shadow">
                    {suggestions.map((t, i) => (
                        <button key={t}
                                className={`w-full text-left px-2 py-1 font-mono text-sm hover:bg-accent ${i === highlight ? 'bg-accent' : ''}`}
                                onMouseEnter={() => setHighlight(i)}
                                onMouseDown={(e) => { e.preventDefault(); addTicker(t); }}>
                            {t}
                        </button>
                    ))}
                </div>
            )}
        </div>
        <div className="flex flex-wrap max-h-125 overflow-y-auto gap-1">
            {props.rows.toSorted().map(t =>
                <Badge key={t} variant="default" className="font-mono text-sm">
                    <label>{t}</label>
                    <button className="opacity-70 hover:opacity-100" aria-label={`Remove ${t}`}
                            onClick={() => removeTicker(t)}>
                        <XIcon className="h-3 w-3"/>
                    </button>
                </Badge>
            )}
        </div>
    </div>
});

RowSelector.displayName = 'RowSelector';
