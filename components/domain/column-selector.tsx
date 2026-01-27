"use client";
import {Input} from "@/components/ui/input";
import React, {useCallback, useEffect, useMemo, useRef, useState, useDeferredValue} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/lib/metadata/labels";
import {getPrefix, getSuffix} from "@/lib/data";
import {toNorm} from "@/lib/utils/strings";

type Props = {
    columns: string[]
    setColumns(columns: string[]): void
    allKeys: string[]
    getLabel(path: string): Label
}

export function ColumnSelector(props: Props) {

    const [search, setSearch] = useState("")
    const [openValues, setOpenValues] = useState<string[]>([])
    const manualOpenRef = useRef(false) // when true, do not auto-suggest open values

    const deferredSearch = useDeferredValue(search)
    const isSearching = deferredSearch.trim().length > 0
    const q = useMemo(() => toNorm(deferredSearch), [deferredSearch])

    const selectedKeys: Set<string> = useMemo(() =>
            props.columns.reduce((s, k) => {
                s.add(k);
                return s
            }, new Set<string>())
        , [props.columns]);


    const basePrefixes = Array.from(new Set(props.allKeys.map(h => getPrefix(h))));

    function keyMatches(key: string): boolean {
        return toNorm(getSuffix(key)).includes(q) ||
            toNorm(props.getLabel(key)?.short).includes(q) ||
            toNorm(props.getLabel(key)?.long).includes(q)
    }

    const {getLabel} = props;
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

    // sets for name matches, used to widen visibility
    const prefixNameMatched = useMemo(() => new Set(basePrefixes.filter(p => prefixSelfMatches(p))), [basePrefixes, prefixSelfMatches])

    // filtered after search
    const visibleKeys = isSearching ? props.allKeys.filter(keyMatches) : props.allKeys
    const visiblePrefixes = isSearching
        ? basePrefixes.filter(p => prefixMatches(p))
        : basePrefixes

    // auto-suggest open values in the accordion
    useEffect(() => {
        if (!isSearching || manualOpenRef.current) return
        const open = new Set<string>()
        // open all matching prefixes by name and their groups
        for (const p of prefixNameMatched) {
            open.add(p)
        }
        // open ancestors of matching keys
        for (const k of visibleKeys) {
            const p = getPrefix(k)
            if (p) open.add(p)
        }
        const next = Array.from(open)
        setOpenValues(prev => (
            prev.length === next.length && prev.every((v, i) => v === next[i])
        ) ? prev : next)
    }, [q, visibleKeys, isSearching, prefixNameMatched])

    // reset manual override when search query changes
    useEffect(() => {
        manualOpenRef.current = false
    }, [q])

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
                {visiblePrefixes.map(prefix => {
                    const byPrefix = (key: string) => getPrefix(key) === prefix
                    const keysInPrefix = props.allKeys.filter(byPrefix)
                    const visibleKeysInPrefix = prefixNameMatched.has(prefix) ? keysInPrefix : []
                    return ColumnPrefix(prefix, keysInPrefix, visibleKeysInPrefix, selectedKeys, props)
                })}
            </Accordion>
        </div>
    </div>
}

function ColumnPrefix(
    prefix: string,
    keysInPrefix: string[],
    visibleKeysInPrefix: string[],
    selectedKeys: Set<string>,
    props: Props
) {
    const selectedCount = keysInPrefix.filter(k => selectedKeys.has(k)).length
    const checkedState = selectedCount === 0 ? false : (selectedCount === keysInPrefix.length ? true : "indeterminate")

    function onToggle(checked: boolean) {
        props.setColumns(updatedSelection(checked, props.columns, keysInPrefix))
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
                {visibleKeysInPrefix.map(key => ColumnKey(key, selectedKeys, props))}
            </div>
        </AccordionContent>
    </AccordionItem>;
}

function ColumnKey(key: string, selectedKeys: Set<string>, props: Props) {

    function onToggle(checked: boolean) {
        props.setColumns(updatedSelection(checked, props.columns, [key]))
    }

    const label = props.getLabel(key)
    return <label key={getSuffix(key)} className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={selectedKeys.has(key)} onCheckedChange={onToggle}/>
        <span className="text-sm font-mono">{label.short}</span>
        <span className="text-xs text-muted-foreground">{label.long}</span>
    </label>;
}

function updatedSelection(checked: boolean, prev: string[], toggledKeys: string[]): string[] {
    return checked
        ? addKeysToSelection(prev, toggledKeys)
        : removeKeysFromSelection(prev, toggledKeys)
}

function addKeysToSelection(selectionState: string[], toggledKeys: string[]): string[] {
    return Array.from(new Set([...selectionState, ...toggledKeys]));
}

function removeKeysFromSelection(selectionState: string[], toggledKeys: string[]): string[] {
    const removeSet = new Set(toggledKeys)
    return selectionState.filter(k => !removeSet.has(k))
}
