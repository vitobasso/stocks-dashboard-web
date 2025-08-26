import {Input} from "@/components/ui/input";
import React, {useEffect, useMemo, useState} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Header} from "@/lib/metadata/defaults";
import {getLabel} from "@/lib/metadata/labels";
import {columnGroupPerKey, columnGroupPerPrefix, columnGroups} from "@/lib/metadata/column-groups";
import {getPrefix, getSuffix} from "@/lib/data";
import {toNorm} from "@/lib/utils/strings";
import {invertSubset} from "@/lib/utils/collections";

type Props = {
    allKeys: string[]
    columns: Header[]
    setColumns(columns: Header[]): void
}

export function ColumnSelector(props: Props) {

    const [search, setSearch] = useState("")
    const [openValues, setOpenValues] = useState<string[]>([])

    const isSearching = search.trim().length > 0
    const q = toNorm(search)

    const allGroups = Object.keys(columnGroups);
    const allPrefixes = useMemo(() => Array.from(new Set(props.allKeys.map(h => getPrefix(h)))), [props.allKeys])
    const selectedKeys = useMemo(() => props.columns.map(h => h.keys).flat()
        .reduce((s, k) => s.add(k), new Set<string>()), [props.columns])

    const groupOfKey = useMemo(() => columnGroupPerKey(props.allKeys), [props.allKeys]) // Map<key, group>
    const groupOfPrefix = useMemo(() => columnGroupPerPrefix(allPrefixes), [allPrefixes]) // Map<prefix, group>
    const prefixesOfGroup = useMemo(() => invertSubset(groupOfPrefix), [groupOfPrefix]) // Map<group, prefixes>

    function keyMatches(key: string): boolean {
        return toNorm(getSuffix(key)).includes(q) ||
            toNorm(getLabel(key)?.short).includes(q) ||
            toNorm(getLabel(key)?.long).includes(q)
    }

    function prefixSelfMatches(prefix: string): boolean {
        const label = getLabel(prefix)
        return toNorm(prefix).includes(q) ||
            toNorm(label?.short).includes(q) ||
            toNorm(label?.long).includes(q)
    }

    function prefixMatches(prefix: string): boolean {
        if (!isSearching) return true
        if (prefixSelfMatches(prefix)) return true
        // any key under this prefix matches
        return props.allKeys.some(k => getPrefix(k) === prefix && keyMatches(k))
    }

    function groupMatches(group: string): boolean {
        if (!isSearching) return true
        if (toNorm(group).includes(q)) return true
        // any prefix in this group matches
        const anyPrefix = allPrefixes.some(p => groupOfPrefix.get(p) === group && prefixMatches(p))
        if (anyPrefix) return true
        // any key in this group matches
        return props.allKeys.some(k => groupOfKey.get(k) === group && keyMatches(k))
    }

    // sets for name matches, used to widen visibility
    const groupNameMatched = new Set(allGroups.filter(g => toNorm(g).includes(q)))
    const prefixNameMatched = new Set(allPrefixes.filter(p => prefixSelfMatches(p)))

    // filtered after search
    const filteredKeys = isSearching ? props.allKeys.filter(keyMatches) : props.allKeys
    const filteredPrefixes = isSearching
        ? allPrefixes.filter(p => prefixMatches(p) || groupNameMatched.has(groupOfPrefix.get(p) ?? ""))
        : allPrefixes
    const filteredGroups = isSearching ? allGroups.filter(groupMatches) : allGroups

    // auto-suggest open values
    useEffect(() => {
        if (!isSearching) return
        const open = new Set<string>()
        // open all matching groups by name
        for (const g of groupNameMatched) open.add(g)
        // open all matching prefixes by name and their groups
        for (const p of prefixNameMatched) {
            open.add(p)
            const g = groupOfPrefix.get(p)
            if (g) open.add(g)
        }
        // open ancestors of matching keys
        for (const k of filteredKeys) {
            const g = groupOfKey.get(k)
            if (g) open.add(g)
            const p = getPrefix(k)
            if (p) open.add(p)
        }
        setOpenValues(Array.from(open))
    }, [q])

    return <div className="w-full">
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}/>
        <div className="flex-1 max-h-123 p-1 overflow-auto">
            <Accordion type="multiple" value={openValues} onValueChange={(v: string[]) => setOpenValues(v)}>
                {filteredGroups.map(group => {
                    const groupPrefixes = (prefixesOfGroup.get(group) ?? []).filter(p => filteredPrefixes.includes(p))
                    return ColumnGroup(group, groupPrefixes, filteredKeys, groupNameMatched, prefixNameMatched, groupOfKey, selectedKeys, props)
                })}
            </Accordion>
        </div>
    </div>
}


function ColumnGroup(
    group: string,
    prefixes: string[],
    keys: string[],
    groupNameMatched: Set<string>,
    prefixNameMatched: Set<string>,
    groupOfKey: Map<string, string>,
    selectedKeys: Set<string>,
    props: Props,
) {
    return <AccordionItem key={group} value={group}>
        <AccordionTrigger>
            <span className="font-semibold">{group}</span>
        </AccordionTrigger>
        <AccordionContent>
            <div className="pl-4">
                {prefixes.map(prefix => {
                    const byPrefix = (key: string) => getPrefix(key) === prefix
                    const allKeysForPrefix = props.allKeys.filter(byPrefix)
                    const keysForThisPrefix = (groupNameMatched.has(group) || prefixNameMatched.has(prefix))
                        ? allKeysForPrefix
                        : keys.filter(byPrefix)
                    return ColumnPrefix(prefix, keysForThisPrefix, allKeysForPrefix, groupOfKey, selectedKeys, props)
                })}
            </div>
        </AccordionContent>
    </AccordionItem>;
}

function ColumnPrefix(prefix: string, keys: string[], allKeysForPrefix: string[], groupOfKey: Map<string, string>, selectedKeys: Set<string>, props: Props) {

    const selectedCount = allKeysForPrefix.filter(k => selectedKeys.has(k)).length
    const checkedState = selectedCount === 0 ? false : (selectedCount === allKeysForPrefix.length ? true : "indeterminate")

    function onToggle(checked: boolean) {
        props.setColumns(updateSelection(checked, props.columns, allKeysForPrefix, groupOfKey))
    }

    return <AccordionItem key={prefix} value={prefix} className="border-b-0">
        <AccordionTrigger className="pt-0">
            <div className="flex items-center gap-2">
                <Checkbox checked={checkedState} onCheckedChange={onToggle}
                          onClick={(e) => e.stopPropagation()}/>
                <span className="text-sm">{getLabel(prefix).short}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="space-y-2 pl-4">
                {keys.map(key => ColumnKey(key, groupOfKey, selectedKeys, props))}
            </div>
        </AccordionContent>
    </AccordionItem>;
}

function ColumnKey(key: string, groupOfKey: Map<string, string>, selectedKeys: Set<string>, props: Props) {

    function onToggle(checked: boolean) {
        props.setColumns(updateSelection(checked, props.columns, [key], groupOfKey))
    }

    const label = getLabel(key)
    return <label key={getSuffix(key)} className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={selectedKeys.has(key)} onCheckedChange={onToggle}/>
        <span className="text-sm font-mono">
            {label.short}
        </span>
        <span className="text-xs text-muted-foreground">
            {label.long}
        </span>
    </label>;
}

function updateSelection(checked: boolean, columns: Header[], keys: string[], groupOfKey: Map<string, string>): Header[] {
    return checked
        ? addKeysToColumns(columns, keys, groupOfKey)
        : removeKeysFromColumns(columns, keys)
}

function addKeysToColumns(cols: Header[], keys: string[], groupOfKey: Map<string, string>): Header[] {
    for (const k of keys) {
        const already = cols.some(h => h.keys.includes(k))
        if (already) continue
        const g = groupOfKey.get(k) ?? ""
        const idx = cols.findIndex(h => h.group === g)
        if (idx >= 0) {
            const h = cols[idx]
            if (!h.keys.includes(k)) {
                cols = cols.map((hh, i) => i === idx ? {...hh, keys: [...hh.keys, k]} : hh)
            }
        } else {
            cols = [...cols, {group: g, keys: [k]}]
        }
    }
    return cols
}

function removeKeysFromColumns(columns: Header[], keys: string[]): Header[] {
    const removeSet = new Set(keys)
    return columns.map(h => ({...h, keys: h.keys.filter(k => !removeSet.has(k))}))
}
