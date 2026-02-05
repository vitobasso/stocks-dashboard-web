import {getAsSortable} from "@/lib/metadata/formats";
import {useState} from "react";
import {SortColumn} from "react-data-grid";

type Row = Record<string, string | number>;

export function useSortColumns(rows: Row[]) {

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    function compareRows(a: Row, b: Row) {
        for (const {columnKey, direction} of sortColumns) {
            const av = getAsSortable(columnKey, a[columnKey]);
            const bv = getAsSortable(columnKey, b[columnKey]);

            if (av == null && bv == null) continue;
            if (av == null) return direction === 'ASC' ? -1 : 1;
            if (bv == null) return direction === 'ASC' ? 1 : -1;

            if (av < bv) return direction === 'ASC' ? -1 : 1;
            if (av > bv) return direction === 'ASC' ? 1 : -1;
        }
        return 0;
    }

    const sortedRows = sortColumns.length === 0 ? rows : rows.toSorted(compareRows);

    return {sortedRows, sortColumns, setSortColumns};

}