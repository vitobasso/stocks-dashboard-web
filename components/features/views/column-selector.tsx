"use client";
import {Input} from "@/components/ui/input";
import React, {useCallback, useEffect, useMemo, useRef, useState, useDeferredValue, forwardRef} from "react";
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
    autoFocus?: boolean
}

export const ColumnSelector = forwardRef<HTMLInputElement, Props>((props, ref) => {

    const [search, setSearch] = useState("")
    const [expandedPrefixes, setExpandedPrefixes] = useState<string[]>([])
    const manualExpandRef = useRef(false) // when true, do not auto-suggest expand values

    const deferredSearch = useDeferredValue(search)
    const isSearching = deferredSearch.trim().length > 0
    const q = useMemo(() => toNorm(deferredSearch), [deferredSearch])

    const selectedKeys: Set<string> = useMemo(() =>
            props.columns.reduce((s, k) => {
                s.add(k);
                return s
            }, new Set<string>())
        , [props.columns]);

    const allPrefixes = Array.from(new Set(props.allKeys.map(h => getPrefix(h))))
        .toSorted((a, b) => props.getLabel(a)?.short.localeCompare(props.getLabel(b)?.short));

    function keyMatches(key: string): boolean {
        return toNorm(props.getLabel(key)?.short).includes(q) ||
            toNorm(props.getLabel(key)?.long).includes(q)
    }

    const {getLabel} = props;
    const prefixItselfMatches = useCallback((prefix: string): boolean => {
        const label = getLabel(prefix)
        return toNorm(label?.short).includes(q) ||
            toNorm(label?.long).includes(q)
    }, [getLabel, q]);

    function prefixOrChildrenMatch(prefix: string): boolean {
        if (!isSearching) return true
        if (prefixItselfMatches(prefix)) return true
        // any key under this prefix matches
        return props.allKeys.some(k => getPrefix(k) === prefix && keyMatches(k))
    }

    // prefix name matches, used to widen search results
    const prefixNamesMatching = useMemo(() => new Set(allPrefixes.filter(p => prefixItselfMatches(p))), [allPrefixes, prefixItselfMatches])

    // filtered after search
    const visibleKeys = isSearching ? props.allKeys.filter(keyMatches) : props.allKeys
    const visiblePrefixes = isSearching
        ? allPrefixes.filter(p => prefixOrChildrenMatch(p))
        : allPrefixes

    // auto-suggest expand values in the accordion
    useEffect(() => {
        if (!isSearching || manualExpandRef.current) return
        const expand = new Set<string>()
        // expand all matching prefixes by name
        for (const p of prefixNamesMatching) {
            expand.add(p)
        }
        // expand ancestors of matching keys
        for (const k of visibleKeys) {
            const p = getPrefix(k)
            if (p) expand.add(p)
        }
        const next = Array.from(expand)
        setExpandedPrefixes(prev => (
            prev.length === next.length && prev.every((v, i) => v === next[i])
        ) ? prev : next)
    }, [q, visibleKeys, isSearching, prefixNamesMatching])

    // reset manual override of accordion expand/collapse state when search query changes
    useEffect(() => {
        manualExpandRef.current = false
    }, [q])

    const onAccordionChange = useCallback((v: string[]) => {
        manualExpandRef.current = true;
        setExpandedPrefixes(v)
    }, [])

    return <div className="w-full">
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}
               ref={ref} autoFocus={props.autoFocus}/>
        <div className="flex-1 p-1">
            <Accordion type="multiple" value={expandedPrefixes} onValueChange={onAccordionChange}>
                {visiblePrefixes.map(prefix => {
                    const byPrefix = (key: string) => getPrefix(key) === prefix
                    const allKeysInPrefix = props.allKeys.filter(byPrefix)
                    const visibleKeysInPrefix = prefixNamesMatching.has(prefix) ? allKeysInPrefix : visibleKeys.filter(byPrefix)
                    return ColumnPrefix(prefix, allKeysInPrefix, visibleKeysInPrefix, selectedKeys, props)
                })}
            </Accordion>
        </div>
    </div>
});

ColumnSelector.displayName = 'ColumnSelector';

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
