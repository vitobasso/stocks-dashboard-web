"use client";
import {Input} from "@/components/ui/input";
import React, {forwardRef, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/lib/metadata/labels";
import {getPrefix, getRoot, getSuffix} from "@/lib/data";
import {toNorm} from "@/lib/utils/strings";
import {groupBy, moveItem} from "@/lib/utils/collections";

type Props = {
    columns: string[]
    setColumns(columns: string[]): void
    allKeys: string[]
    labeler(path: string): Label
    autoFocus?: boolean
}

export const ColumnSelector = forwardRef<HTMLInputElement, Props>((props, ref) => {

    const [search, setSearch] = useState("")
    const [expandedGroups, setExpandedGroups] = useState<string[]>([])
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

    const {keysByGroup, allGroups} = useMemo(() => {
        const keysByGroup = groupBy(props.allKeys, getRoot)
        const allGroups = [...keysByGroup.keys()]
        return {keysByGroup, allGroups}
    }, [props.allKeys]);

    function keyMatches(key: string): boolean {
        return toNorm(props.labeler(key)?.short).includes(q) ||
            toNorm(props.labeler(key)?.long).includes(q)
    }

    const {labeler} = props;
    const groupItselfMatches = useCallback((group: string): boolean => {
        const label = labeler(group)
        return toNorm(label?.short).includes(q) ||
            toNorm(label?.long).includes(q)
    }, [labeler, q]);

    function groupOrChildrenMatch(group: string): boolean {
        if (!isSearching) return true
        if (groupItselfMatches(group)) return true
        // any key under this group matches
        return props.allKeys.some(k => getRoot(k) === group && keyMatches(k))
    }

    // group name matches, used to widen search results
    const groupNamesMatching = useMemo(() =>
        new Set(allGroups.filter(p => groupItselfMatches(p))
        ), [allGroups, groupItselfMatches])

    // filtered after search
    const visibleKeys = isSearching ? props.allKeys.filter(keyMatches) : props.allKeys
    const visibleGroups = isSearching
        ? allGroups.filter(p => groupOrChildrenMatch(p))
        : allGroups

    // auto-suggest expand values in the accordion
    useEffect(() => {
        if (!isSearching || manualExpandRef.current) return
        const expand = new Set<string>()
        // expand all matching groups by name
        for (const p of groupNamesMatching) {
            expand.add(p)
        }
        // expand ancestors of matching keys
        for (const k of visibleKeys) {
            const p = getRoot(k)
            if (p) expand.add(p)
        }
        const next = Array.from(expand)
        setExpandedGroups(prev => (
            prev.length === next.length && prev.every((v, i) => v === next[i])
        ) ? prev : next)
    }, [q, visibleKeys, isSearching, groupNamesMatching])

    // reset manual override of accordion expand/collapse state when search query changes
    useEffect(() => {
        manualExpandRef.current = false
    }, [q])

    const onAccordionChange = useCallback((v: string[]) => {
        manualExpandRef.current = true;
        setExpandedGroups(v)
    }, [])

    return <div className="w-full">
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}
               ref={ref} autoFocus={props.autoFocus}/>
        <div className="flex-1 p-1">
            <Accordion type="multiple" value={expandedGroups} onValueChange={onAccordionChange}>
                {visibleGroups.map(group => {
                    const byGroup = (key: string) => getRoot(key) === group
                    const allKeysInGroup = keysByGroup.get(group) ?? []
                    const visibleKeysInGroup = groupNamesMatching.has(group) ? allKeysInGroup : visibleKeys.filter(byGroup)
                    return ColumnGroup(group, allKeysInGroup, visibleKeysInGroup, selectedKeys, props)
                })}
            </Accordion>
        </div>
    </div>
});

ColumnSelector.displayName = 'ColumnSelector';

function ColumnGroup(
    group: string,
    keysInGroup: string[],
    visibleKeysInGroup: string[],
    selectedKeys: Set<string>,
    props: Props
) {
    const selectedCount = keysInGroup.filter(k => selectedKeys.has(k)).length
    const checkedState = selectedCount === 0 ? false : (selectedCount === keysInGroup.length ? true : "indeterminate")

    function onToggle(checked: boolean) {
        props.setColumns(updatedSelection(checked, props.columns, keysInGroup))
    }

    const groupLabel = props.labeler(group);
    const keysBySubgroup = groupBy(visibleKeysInGroup, (k) => props.labeler(getPrefix(k)).short)
    const subgroups = organizeSubgroups(group, keysBySubgroup, props.labeler);

    return <AccordionItem key={group} value={group} className="border-b-0">
        <AccordionTrigger className="pt-0">
            <div className="flex items-center gap-2">
                <Checkbox checked={checkedState} onCheckedChange={onToggle}
                          onClick={(e) => e.stopPropagation()}/>
                <div>
                    <div className="text-sm">{groupLabel.short}</div>
                    <div className="text-xs text-muted-foreground">{groupLabel.long}</div>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="space-y-2 pl-4">
                {subgroups.map(subgroup => <div key={subgroup} className="">
                    {subgroup !== groupLabel.short && <div className="text-muted-foreground">{subgroup}</div>}
                    {(keysBySubgroup.get(subgroup) ?? []).map(key => ColumnKey(key, selectedKeys, props))}
                </div>)}
            </div>
        </AccordionContent>
    </AccordionItem>;
}

function ColumnKey(key: string, selectedKeys: Set<string>, props: Props) {

    function onToggle(checked: boolean) {
        props.setColumns(updatedSelection(checked, props.columns, [key]))
    }

    const label = props.labeler(key)
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

function organizeSubgroups(group: string, keysBySubgroup: Map<string, string[]>, labeler: (key: string) => Label) {
    const subgroups = [...keysBySubgroup.keys()].toSorted();

    // move the "default" subgroup to the top
    const iDefault = subgroups.indexOf(labeler(group).short);
    if (iDefault > 0) moveItem(subgroups, iDefault, 0)

    // move the "derived" subgroup to the bottom
    const iDerived = subgroups.indexOf(labeler(`${group}.derived`).short);
    if (iDerived > 0) moveItem(subgroups, iDerived, subgroups.length - 1)

    return subgroups;
}