import {getAsSortable} from "@/lib/metadata/formats";
import {useState} from "react";
import {SortColumn} from "react-data-grid";

type Row = Record<string, string | number>;


export function useSortColumns(rows: Row[]) {

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    const sortedRows = getSortedRows();
    function getSortedRows() {
        if (sortColumns.length === 0) return rows;
        const {columnKey, direction} = sortColumns[0]; // TODO multi cols
        return [...rows].sort((a, b) => {
            const av = getAsSortable(columnKey, a[columnKey]);
            const bv = getAsSortable(columnKey, b[columnKey]);

            if (av == null && bv == null) return 0;
            if (av == null) return direction === 'ASC' ? -1 : 1; // put null/undefined first
            if (bv == null) return direction === 'ASC' ? 1 : -1;

            if (av < bv) return direction === 'ASC' ? -1 : 1;
            if (av > bv) return direction === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    return {sortedRows, sortColumns, setSortColumns};

}