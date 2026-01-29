import {Rec} from "@/lib/utils/records";
import {Dispatch, SetStateAction} from "react";

export type RowView = { name: string, items: string[] };
export type ColView = { name: string, items: string[] };
export type ViewsAvailable = { rowViews: RowView[], colViews: ColView[] }
export type ViewSelection = { assetClass: string, rowViewNames: Rec<string[]>, colViewNames: Rec<string[]> };

type Axis = "row" | "col";
type AnyView = RowView | ColView;

const keyMap = {
    row: {views: "rowViews", viewNames: "rowViewNames"},
    col: {views: "colViews", viewNames: "colViewNames"},
} as const;

export function viewsCrud(
    setViewsAvailable: Dispatch<SetStateAction<Record<string, ViewsAvailable> | null>>,
    setSelection: Dispatch<SetStateAction<ViewSelection | null>>
) {

    function updateViews(axis: Axis,
                         ac: string,
                         fn: (v: AnyView[]) => AnyView[],
                         onUpdated?: (result: AnyView[]) => void) {
        setViewsAvailable(v => {
            if (!v) return v;
            const updated = fn(v[ac][keyMap[axis].views])
            if (onUpdated) onUpdated(updated);
            return {
                ...v,
                [ac]: {
                    ...v[ac],
                    [keyMap[axis].views]: updated,
                },
            };
        });
    }

    function select(axis: Axis, fn: (v: string[]) => string[]) {
        setSelection(s => {
            if (!s) return s;
            return {
                ...s,
                [keyMap[axis].viewNames]: {
                    ...s[keyMap[axis].viewNames],
                    [s.assetClass]: fn(s[keyMap[axis].viewNames][s.assetClass])
                }
            };
        })
    }

    return {
        selectSingle: (axis: Axis) => (name: string) => select(axis, () => [name]),
        selectToggle: (axis: Axis) => (name: string) => select(axis, before =>
            before.includes(name) ? (before.length > 1 ? before.filter(v => v !== name) : before) : [...before, name]
        ),
        create: (axis: Axis, ac: string) => (created: RowView | ColView) => {
            updateViews(axis, ac, (xs) => [...xs, created]);
            select(axis, () => [created.name]);
        },
        edit: (axis: Axis, ac: string) => (oldName: string, updated: RowView | ColView) => {
            updateViews(axis, ac, (xs) => xs.map(x => (x.name === oldName ? updated : x)));
            select(axis, before => {
                const i = before.indexOf(oldName)
                return i < 0 ? before : before.with(i, updated.name)
            })
        },
        delete: (axis: Axis, ac: string) => (name: string) => {
            updateViews(axis, ac,
                (xs) => xs.filter(x => x.name !== name),
                (xs) => select(axis, before => {
                    const after = before.filter(n => n !== name)
                    return after.length ? after : [xs[0].name]
                })
            );
        },
    }
}