import {Rec} from "@/lib/utils/records";
import {Dispatch, SetStateAction} from "react";

export type RowList = { name: string, items: string[] };
export type ColList = { name: string, items: string[] };
export type ViewsAvailable = { rowLists: RowList[], colLists: ColList[] }
export type ViewSelection = { assetClass: string, rowListNames: Rec<string>, colListNames: Rec<string> };

type Axis = "row" | "col";

const cfg = {
    row: {lists: "rowLists", names: "rowListNames"},
    col: {lists: "colLists", names: "colListNames"},
} as const;

export function viewListCrud(
    setViewsAvailable: Dispatch<SetStateAction<Record<string, ViewsAvailable> | null>>,
    setSelection: Dispatch<SetStateAction<ViewSelection | null>>
) {

    function updateViews(axis: Axis, ac: string, fn: (v: RowList[] | ColList[]) => RowList[] | ColList[]) {
        setViewsAvailable(v => {
            if (!v) return v;
            return {
                ...v,
                [ac]: {
                    ...v[ac],
                    [cfg[axis].lists]: fn(v[ac][cfg[axis].lists]),
                },
            };
        });
    }

    function select(axis: Axis, fn: (v: string) => string) {
        setSelection(s => {
            if (!s) return s;
            return {
                ...s,
                [cfg[axis].names]: {
                    ...s[cfg[axis].names],
                    [s.assetClass]: fn(s[cfg[axis].names][s.assetClass])
                }
            };
        })
    }

    return {
        select: (axis: Axis) => (name: string) => select(axis, () => name),
        create: (axis: Axis, ac: string) => (created: RowList | ColList) => {
            updateViews(axis, ac, (xs) => [...xs, created]);
            select(axis, () => created.name);
        },
        edit: (axis: Axis, ac: string) => (oldName: string, updated: RowList | ColList) => {
            updateViews(axis, ac, (xs) => xs.map(x => (x.name === oldName ? updated : x)));
            select(axis, v => v == oldName ? updated.name : v)
        },
        delete: (axis: Axis, ac: string) => (name: string) => {
            const fn = (xs: RowList[] | ColList[]) => xs.filter(x => x.name !== name)
            setViewsAvailable(v => {
                if (!v) return v;
                const result = fn(v[ac][cfg[axis].lists])
                select(axis, v => v == name ? result[0].name : v)
                return {
                    ...v,
                    [ac]: {
                        ...v[ac],
                        [cfg[axis].lists]: result,
                    },
                };
            });
        },
    }
}