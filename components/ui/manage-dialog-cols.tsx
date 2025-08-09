import {CSSProperties, useState} from "react"
import {DialogDescription} from "@/components/ui/dialog"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Checkbox} from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input"
import {Header, Label} from "@/app/page";
import {Data, getBasename, getGroup} from "@/lib/data";

export type HeaderOption = {
    group: string
    key: string
}

type Props = {
    allHeaders: string[]
    selectedHeaders: string[]
    getLabel(key: string): Label
    setHeaderSelection(headers: string[]): void
    className?: string
    style?: CSSProperties
}

export function ManageDialogCols(props: Props) {
    const [search, setSearch] = useState("")

    const groups = Array.from(new Set(props.allHeaders.map(h => h.split(".")[0])))

    function isSelected(key: string) {
        return props.selectedHeaders.includes(key)
    }

    function toggle(key: string){
        let prev = props.selectedHeaders
        props.setHeaderSelection(prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }

    const filtered = props.allHeaders.filter(key =>
        getBasename(key).toLowerCase().includes(search.toLowerCase()) ||
        props.getLabel(key)?.short?.toLowerCase().includes(search.toLowerCase()) ||
        props.getLabel(key)?.long?.toLowerCase().includes(search.toLowerCase())
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
                                <span className="font-bold">{props.getLabel(group).short}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pl-4">
                                {filtered
                                    .filter(key => getGroup(key) === group)
                                    .map(key => (
                                        <label key={getBasename(key)} className="flex items-center gap-2 cursor-pointer">
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

export function selectedHeaders(headers: Header[]): string[] {
    return headers.flatMap(([_,ks]) => ks)
}

export function headerOptions(data: Data): string[] {
    let set = Object.values(data).map(entry => Object.keys(entry))
        .reduce((acc, entry) => acc.union(new Set(entry)), new Set<string>);
    return [...set].map(path => {
        return path
    })
}

