import {Input} from "@/components/ui/input";
import {XIcon} from "lucide-react"
import {forwardRef, useState} from "react";
import {Badge} from "@/components/ui/badge";

type Props = {
    rows: string[]
    setRows(rows: string[]): void
    allTickers: string[]
    autoFocus?: boolean
}

export const RowSelector = forwardRef<HTMLInputElement, Props>((props, ref) => {

    const [inputText, setInputText] = useState("");
    const [highlight, setHighlight] = useState(0);

    const suggestions = getSuggestions();
    function getSuggestions(): string[] {
        const normText = inputText.trim().toUpperCase();
        if (!normText) return [];
        const set = new Set(props.rows);
        return props.allTickers
            .filter(t => t.includes(normText) && !set.has(t))
            .slice(0, 10);
    }

    function addTicker(inputText: string) {
        const normText = inputText.trim().toUpperCase();
        if (!normText) return;
        if (!props.allTickers.includes(normText)) return;
        if (props.rows.includes(normText)) return;
        const updatedTickers = [...props.rows, normText];
        props.setRows(updatedTickers);
        setInputText("");
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
            if (suggestions.length) addTicker(suggestions[highlight] ?? inputText);
            else addTicker(inputText);
        } else if (e.key === "Escape") {
            setInputText("");
            setHighlight(0);
        }
    }

    return <div className="dialog p-1 space-y-4">
        <div className="flex relative">
            <Input id="input-ticker" inputMode="text" placeholder="Buscar..." value={inputText} className="flex-1"
                   autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-autocomplete="list"
                   onChange={e => { setInputText(e.target.value); setHighlight(0); }}
                   onKeyDown={onKeyDown}
                   ref={ref} autoFocus={props.autoFocus}/>
            {inputText && suggestions.length > 0 && (
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
