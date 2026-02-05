"use client";
import {Input} from "@/components/ui/input";
import React, {forwardRef, useDeferredValue, useEffect, useState} from "react";
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

export const ColumnSelector = forwardRef<HTMLInputElement, Props>(
    ({columns, setColumns, allKeys, labeler, autoFocus}: Props, ref) => {

    const [search, setSearch] = useState("")

    const deferredSearch = useDeferredValue(search)
    const isSearching = deferredSearch.trim().length > 0
    const normSearch = toNorm(deferredSearch)

    const selectedKeys: Set<string> = columns.reduce((s, k) => {
        s.add(k);
        return s
    }, new Set<string>())

    const keysByGroup = groupBy(allKeys, getRoot)
    const allGroups = [...keysByGroup.keys()]

    function keyMatches(key: string): boolean {
        return toNorm(labeler(key)?.short).includes(normSearch) ||
            toNorm(labeler(key)?.long).includes(normSearch)
    }

    function groupMatchesByName(group: string): boolean {
        const label = labeler(group)
        return toNorm(label?.short).includes(normSearch) ||
            toNorm(label?.long).includes(normSearch)
    }
    const groupsMatchingByName = new Set(allGroups.filter(g => groupMatchesByName(g)));

    function groupMatches(group: string): boolean {
        return !isSearching || groupMatchesByName(group) || allKeys.some(k => getRoot(k) === group && keyMatches(k))
    }
    const groupsMatching = !isSearching ? new Set() : new Set(allGroups.filter(g => groupMatches(g)))
    const stableGroupsMatching = [...groupsMatching].toSorted().join("|");

    const [accordionChanges, setAccordionChanges] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setAccordionChanges({}); // eslint-disable-line react-hooks/set-state-in-effect
    }, [stableGroupsMatching]);

    const groupsExpanded = allGroups.filter(group => {
        if (groupsMatching.size) {
            if (!groupsMatching.has(group)) return false;
            return accordionChanges[group] || accordionChanges[group] === undefined;
        }
        return accordionChanges[group];
    });

    function onAccordionChange(openGroups: string[]) {
        const added = openGroups.filter(g => !groupsExpanded.includes(g));
        const removed = groupsExpanded.filter(g => !openGroups.includes(g));
        setAccordionChanges(prev => ({
            ...prev,
            ...Object.fromEntries(added.map(g => [g, true])),
            ...Object.fromEntries(removed.map(g => [g, false])),
        }));
    }

    // filtered after search
    const visibleKeys = isSearching ? allKeys.filter(keyMatches) : allKeys
    const visibleGroups = isSearching ? allGroups.filter(g => groupMatches(g)) : allGroups

    return <div className="w-full">
        <Input className="mb-2"
               placeholder="Buscar..." value={search}
               onChange={e => setSearch(e.target.value)}
               ref={ref} autoFocus={autoFocus}/>
        <div className="flex-1 p-1">
            <Accordion type="multiple" value={groupsExpanded} onValueChange={onAccordionChange}>
                {visibleGroups.map(group => {
                    const byGroup = (key: string) => getRoot(key) === group
                    const allKeysInGroup = keysByGroup.get(group) ?? []
                    const visibleKeysInGroup = groupsMatchingByName.has(group) ? allKeysInGroup : visibleKeys.filter(byGroup)
                    return ColumnGroup(group, allKeysInGroup, visibleKeysInGroup, selectedKeys, columns, setColumns, labeler)
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
    columns: string[],
    setColumns: (columns: string[]) => void,
    labeler: (key: string) => Label
) {
    const selectedCount = keysInGroup.filter(k => selectedKeys.has(k)).length
    const checkedState = selectedCount === 0 ? false : (selectedCount === keysInGroup.length ? true : "indeterminate")

    function onToggle(checked: boolean) {
        setColumns(updatedSelection(checked, columns, keysInGroup))
    }

    const groupLabel = labeler(group);
    const keysBySubgroup = groupBy(visibleKeysInGroup, (k) => labeler(getPrefix(k)).short)
    const subgroups = organizeSubgroups(group, keysBySubgroup, labeler);

    return <AccordionItem key={group} value={group} className="border-b-0">
        <AccordionTrigger className="pt-0">
            <div className="flex items-center gap-2">
                <Checkbox className="cursor-default" checked={checkedState} onCheckedChange={onToggle}
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
                    {subgroup !== groupLabel.short && <label className="text-muted-foreground">{subgroup}</label>}
                    {(keysBySubgroup.get(subgroup) ?? []).map(key => ColumnKey(key, selectedKeys, columns, setColumns, labeler))}
                </div>)}
            </div>
        </AccordionContent>
    </AccordionItem>;
}

function ColumnKey(
    key: string,
    selectedKeys: Set<string>,
    columns: string[],
    setColumns: (columns: string[]) => void,
    labeler: (key: string) => Label
) {

    function onToggle(checked: boolean) {
        setColumns(updatedSelection(checked, columns, [key]))
    }

    const label = labeler(key)
    return <label key={getSuffix(key)} className="flex items-center gap-2"
                  onClick={() => onToggle(!selectedKeys.has(key))}>
        <Checkbox checked={selectedKeys.has(key)}/>
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