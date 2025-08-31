"use client";
import {Input} from "@/components/ui/input";
import React, {useCallback, useEffect, useMemo, useRef, useState, useDeferredValue} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Header} from "@/lib/metadata/defaults";
import {Label} from "@/lib/metadata/labels";
import {columnGroupPerKey, columnGroupPerPrefix, columnGroups} from "@/lib/metadata/column-groups";
import {getPrefix, getSuffix} from "@/lib/data";
import {toNorm} from "@/lib/utils/strings";
import {groupByValues} from "@/lib/utils/collections";

type Props = {
    allKeys: string[]
    columns: Header[]
    setColumns(columns: Header[]): void
    getLabel(path: string): Label
    groupFilter: string | null
}

export function ColumnSelector(props: Props) {

    const [search, setSearch] = useState("")
    const [openValues, setOpenValues] = useState<string[]>([])
    const manualOpenRef = useRef(false) // when true, do not auto-suggest open values

    const deferredSearch = useDeferredValue(search)
    const isSearching = deferredSearch.trim().length > 0
    const q = useMemo(() => toNorm(deferredSearch), [deferredSearch])

    const allGroups = Object.keys(columnGroups);
    const baseGroups = props.groupFilter ? allGroups.filter(g => g === props.groupFilter) : allGroups
    const allPrefixes = useMemo(() => Array.from(new Set(props.allKeys.map(h => getPrefix(h)))), [props.allKeys])
    const selectedKeys = useMemo(() => props.columns.map(h => h.keys).flat()
        .reduce((s, k) => s.add(k), new Set<string>()), [props.columns])

    const groupOfKey = useMemo(() => columnGroupPerKey(props.allKeys), [props.allKeys]) // Map<key, group>
    const groupOfPrefix = useMemo(() => columnGroupPerPrefix(allPrefixes), [allPrefixes]) // Map<prefix, group>
    const prefixesOfGroup = useMemo(() => groupByValues(groupOfPrefix), [groupOfPrefix]) // Map<group, prefixes>

    function keyMatches(key: string): boolean {
        return toNorm(getSuffix(key)).includes(q) ||
            toNorm(props.getLabel(key)?.short).includes(q) ||
            toNorm(props.getLabel(key)?.long).includes(q)
    }

    const { getLabel } = props;
    const prefixSelfMatches = useCallback((prefix: string): boolean => {
        const label = getLabel(prefix)
        return toNorm(prefix).includes(q) ||
            toNorm(label?.short).includes(q) ||
            toNorm(label?.long).includes(q)
    }, [getLabel, q]);

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
    const groupNameMatched = useMemo(() => new Set(allGroups.filter(g => toNorm(g).includes(q))), [allGroups, q])
    const prefixNameMatched = useMemo(() => new Set(allPrefixes.filter(p => prefixSelfMatches(p))), [allPrefixes, prefixSelfMatches])

    // filtered after search
    const filteredKeys = isSearching ? props.allKeys.filter(keyMatches) : props.allKeys
    const filteredPrefixes = isSearching
        ? allPrefixes.filter(p => prefixMatches(p) || groupNameMatched.has(groupOfPrefix.get(p) ?? ""))
        : allPrefixes
    const filteredGroups = (isSearching ? baseGroups.filter(groupMatches) : baseGroups)

    // auto-suggest open values in the accordion
    useEffect(() => {
        if (!isSearching || manualOpenRef.current) return
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
        const next = Array.from(open)
        setOpenValues(prev => (
            prev.length === next.length && prev.every((v, i) => v === next[i])
        ) ? prev : next)
    }, [q, filteredKeys, groupNameMatched, groupOfKey, groupOfPrefix, isSearching, prefixNameMatched])

    // reset manual override when search query changes
    useEffect(() => {
        manualOpenRef.current = false
    }, [q])

    // when filtering by group, auto-open that group
    useEffect(() => {
        if (!props.groupFilter) return
        const open = new Set<string>([props.groupFilter])
        const prefixes = prefixesOfGroup.get(props.groupFilter)
        if (prefixes) prefixes.forEach(p => open.add(p))
        setOpenValues(Array.from(open))
    }, [props.groupFilter, prefixesOfGroup])

    const onValueChange = useCallback((v: string[]) => {
        manualOpenRef.current = true;
        setOpenValues(v)
    }, [])

    return <div className="w-full">
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}/>
        <div className="flex-1 max-h-123 p-1 overflow-auto">
            <Accordion type="multiple" value={openValues} onValueChange={onValueChange}>
                {filteredGroups.map(group => {
                    const groupPrefixes = (prefixesOfGroup.get(group) ?? []).filter(p => filteredPrefixes.includes(p))
                    return ColumnGroup(group, groupPrefixes, filteredKeys, groupNameMatched, prefixNameMatched,
                        groupOfKey, selectedKeys, props)
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

function ColumnPrefix(prefix: string, keys: string[], allKeysForPrefix: string[], groupOfKey: Map<string, string>,
                      selectedKeys: Set<string>, props: Props) {

    const selectedCount = allKeysForPrefix.filter(k => selectedKeys.has(k)).length
    const checkedState = selectedCount === 0 ? false : (selectedCount === allKeysForPrefix.length ? true : "indeterminate")

    function onToggle(checked: boolean) {
        props.setColumns(updatedSelection(checked, props.columns, allKeysForPrefix, groupOfKey))
    }

    const label = props.getLabel(prefix);
    return <AccordionItem key={prefix} value={prefix} className="border-b-0">
        <AccordionTrigger className="pt-0">
            <div className="flex items-center gap-2">
                <Checkbox checked={checkedState} onCheckedChange={onToggle}
                          onClick={(e) => e.stopPropagation()}/>
                <div>
                    <div className="text-sm">{label.short}</div>
                    <div className="text-xs text-muted-foreground">{label.long}</div>
                </div>
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
        props.setColumns(updatedSelection(checked, props.columns, [key], groupOfKey))
    }

    const label = props.getLabel(key)
    return <label key={getSuffix(key)} className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={selectedKeys.has(key)} onCheckedChange={onToggle}/>
        <span className="text-sm font-mono">{label.short}</span>
        <span className="text-xs text-muted-foreground">{label.long}</span>
    </label>;
}

function updatedSelection(checked: boolean, columns: Header[], keys: string[], groupOfKey: Map<string, string>): Header[] {
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
