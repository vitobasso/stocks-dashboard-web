import {CSSProperties, useState} from "react"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Checkbox} from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input"
import {Label} from "@/lib/metadata/labels";
import {Header} from "@/lib/metadata/defaults";

type Props = {
    allKeys: string[]
    selectedHeaders: Header[]
    setHeaderSelection(headers: Header[]): void
    getLabel(key: string): Label
    className?: string
    style?: CSSProperties
}

export function ManageDialogCols(props: Props) {
    const [search, setSearch] = useState("")

    const allPrefixes = Array.from(new Set(props.allKeys.map(h => getPrefix(h))))

    function isSelected(key: string) {
        return !!props.selectedHeaders.find(h => h.keys.includes(key))
    }

    function toggle(key: string){
        let newSelection: Header[] = toggleSelection(key, props.selectedHeaders);
        props.setHeaderSelection(newSelection)
    }

    const filtered = props.allKeys.filter(key =>
        getSuffix(key).toLowerCase().includes(search.toLowerCase()) ||
        props.getLabel(key)?.short?.toLowerCase().includes(search.toLowerCase()) ||
        props.getLabel(key)?.long?.toLowerCase().includes(search.toLowerCase())
    )

    const filteredPrefixes = allPrefixes.filter(prefix => filtered.map(getPrefix).includes(prefix));

    return <div className={props.className} style={{...props.style}}>
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}/>
        <div className="flex-1 max-h-106 p-1 overflow-auto">
            <Accordion type="multiple" defaultValue={filteredPrefixes}>
                {filteredPrefixes.map(prefix => <AccordionItem key={prefix} value={prefix}>
                        <AccordionTrigger>
                            <div className="flex w-full items-center justify-between">
                                <span className="font-bold">{props.getLabel(prefix).short}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pl-4">
                                {filtered
                                    .filter(key => getPrefix(key) === prefix)
                                    .map(key => (
                                        <label key={getSuffix(key)} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox checked={isSelected(key)}
                                                      onCheckedChange={() => toggle(key)}/>
                                            <span className="text-sm">{props.getLabel(key).short}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {props.getLabel(key).long}
                                            </span>
                                        </label>
                                    ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>)}
            </Accordion>
        </div>
    </div>
}

function getGroup(key: string): string {
    let prefixMap: Record<string, string> = {
        "": "",
        "b3_position": "Posição",
        "quotes": "Preço",
        "yahoo_chart": "Preço",
        "statusinvest": "Fundamentos",
        "simplywallst": "Score",
        "yahoo_api_rating": "Recomendação",
        "yahoo_rating": "Recomendação",
        "tradingview_rating": "Recomendação",
        "yahoo_forecast": "Previsão",
        "tradingview_forecast": "Previsão",
        "derived_forecast": "Previsão",
    }
    let prefix = key == "ticker" ? "" : getPrefix(key);
    return prefixMap[prefix] ?? key
}

function getPrefix(path: string) {
    return path.split(".")[0]
}

function getSuffix(path: string) {
    return path.split(".")[1]
}

function toggleSelection(key: string, currentSelection: Header[]): Header[] {
    let header = currentSelection.find(h => h.keys.includes(key))
    if (header) {
        // remove key
        return currentSelection.map(h => h === header ? {...h, keys: h.keys.filter(k => k !== key)} : h)
    } else {
        // add key
        const group = getGroup(key);
        const idx = currentSelection.findIndex(h => h.group === group);
        if (idx >= 0) {
            // to exiting group
            return currentSelection.map((h, i) => i === idx ? {...h, keys: [...h.keys, key]} : h)
        } else {
            // to new group
            return [...currentSelection, {group, keys: [key]}]
        }
    }
}