import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Header} from "@/lib/metadata/defaults";
import {getLabel} from "@/lib/metadata/labels";

type Props = {
    allKeys: string[]
    headers: Header[]
    setHeaders(headers: Header[]): void
}

export function HeaderSelector(props: Props) {

    const [search, setSearch] = useState("")

    const allPrefixes = Array.from(new Set(props.allKeys.map(h => getPrefix(h))))

    const filteredKeys = props.allKeys.filter(key =>
        getSuffix(key).toLowerCase().includes(search.toLowerCase()) ||
        getLabel(key)?.short?.toLowerCase().includes(search.toLowerCase()) ||
        getLabel(key)?.long?.toLowerCase().includes(search.toLowerCase())
    )

    const filteredPrefixes = allPrefixes.filter(prefix => filteredKeys.map(getPrefix).includes(prefix));

    return <div className="w-full">
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}/>
        <div className="flex-1 max-h-123 p-1 overflow-auto">
            <Accordion type="multiple" defaultValue={filteredPrefixes}>
                {filteredPrefixes.map(prefix => HeaderGroup(prefix, filteredKeys, props))}
            </Accordion>
        </div>
    </div>
}

function HeaderGroup(prefix: string, filteredKeys: string[], props: Props) {
    return <AccordionItem key={prefix} value={prefix}>
        <AccordionTrigger>
            <div className="flex w-full items-center justify-between">
                <span className="font-bold">{getLabel(prefix).short}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="space-y-2 pl-4">
                {filteredKeys
                    .filter(key => getPrefix(key) === prefix)
                    .map(key => HeaderItem(key, props))}
            </div>
        </AccordionContent>
    </AccordionItem>;
}

function HeaderItem(key: string, props: Props) {

    function isSelected(key: string) {
        return !!props.headers.find(h => h.keys.includes(key))
    }

    function toggle(key: string) {
        let newSelection: Header[] = toggleSelection(key, props.headers);
        props.setHeaders(newSelection)
    }

    return <label key={getSuffix(key)} className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={isSelected(key)} onCheckedChange={() => toggle(key)}/>
        <span className="text-sm">
            {getLabel(key).short}
        </span>
        <span className="text-xs text-muted-foreground">
            {getLabel(key).long}
        </span>
    </label>;
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
        const group = defaultGroup(key);
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

function defaultGroup(key: string): string {
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
