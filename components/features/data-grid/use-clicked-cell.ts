import {Rec} from "@/lib/utils/records";
import {useCallback, useEffect, useState} from "react";
import {CellMouseArgs} from "react-data-grid";

type CellId = {
    rowId: string;
    colId: string;
}

/**
 * Keeps trick of which Cell was last clicked in a ReactDataGrid.
 * The returned onCellClick must be passed to the ReactDataGrid to capture updates.
 */
export function useClickedCell<Row extends Rec<unknown>>(getRowId: (row: Row) => string) {
    const [clickedCell, setClickedCell] = useState<CellId | null>(null)

    const isSameCell = useCallback(
        (a: CellId, b: CellId | null) => a.rowId === b?.rowId && a.colId === b?.colId,
        [clickedCell])

    const onCellClick = useCallback((args: CellMouseArgs<Row>) => {
        const rowId = getRowId(args.row) as string
        const colId = args.column.key as string
        setClickedCell(prev => isSameCell({rowId, colId}, prev) ? null : {rowId, colId});
    }, [getRowId])

    const isClicked = useCallback(
        (rowId: string, colId: string) => isSameCell({rowId, colId}, clickedCell),
        [clickedCell])

    useEffect(() => {
        if (!clickedCell) return

        function clear() {
            setClickedCell(null)
        }

        function onPointerDown(e: PointerEvent) {
            const target = e.target
            if (!(target instanceof Element)) return clear()
            // skip clear when we want onCellClick to toggle the state off:
            if (target.closest('[role="gridcell"]')) return // clicking the same cell
            if (target.closest('[data-slot="tooltip-content"]')) return // clicking the tooltip
            clear()
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") clear()
        }

        window.addEventListener("pointerdown", onPointerDown)
        window.addEventListener("keydown", onKeyDown)
        return () => {
            window.removeEventListener("pointerdown", onPointerDown)
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [clickedCell])

    return {onCellClick, isClicked, clickedCell}
}