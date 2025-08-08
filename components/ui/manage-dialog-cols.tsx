import {CSSProperties, useState} from "react"
import {DialogDescription} from "@/components/ui/dialog"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Checkbox} from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input"

export type HeaderOption = {
    group: string
    key: string
}

type Props = {
    allHeaders: HeaderOption[]
    selectedHeaders: string[]
    getLabel(key: string): string
    setHeaderSelection(headers: string[]): void
    className?: string
    style?: CSSProperties
}

export function ManageDialogCols(props: Props) {
    const [search, setSearch] = useState("")

    const groups = Array.from(new Set(props.allHeaders.map(h => h.group)))

    function isSelected(h: HeaderOption) {
        return props.selectedHeaders.includes(`${h.group}.${h.key}`)
    }

    function toggle(h: HeaderOption){
        let key = `${h.group}.${h.key}`
        let prev = props.selectedHeaders
        props.setHeaderSelection(prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }

    const filtered = props.allHeaders.filter(h =>
        props.getLabel(h.key).toLowerCase().includes(search.toLowerCase()) ||
        h.key.toLowerCase().includes(search.toLowerCase())
    )

    return <div className={props.className} style={{...props.style}}>
        <DialogDescription className="mb-6"> Columns </DialogDescription>
        <Input
            placeholder="Search columns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2"/>
        <div className="flex-1 max-h-120 overflow-auto">
            <Accordion type="multiple" defaultValue={groups}>
                {groups.map(group => <AccordionItem key={group} value={group}>
                        <AccordionTrigger>
                            <div className="flex w-full items-center justify-between">
                                <span className="font-bold">{props.getLabel(group)}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pl-4">
                                {filtered
                                    .filter(h => h.group === group)
                                    .map(h => (
                                        <label key={h.key} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox checked={isSelected(h)}
                                                      onCheckedChange={() => toggle(h)}/>
                                            <span className="text-sm">{props.getLabel(h.key)}</span>
                                            <span className="text-xs text-muted-foreground">{h.key}</span>
                                        </label>
                                    ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>)}
            </Accordion>
        </div>
    </div>
}
