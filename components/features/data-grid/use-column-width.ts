import {Data, DataValue} from "@/lib/data";
import {useCallback, useMemo} from "react";

const charWidthPx = 8.5;
const paddingPx = 16;
const defaultWidthPx = 50;

type ColumnStats = { maxLength: number };
type GetDisplay = (key: string, value: DataValue) => string | undefined;

export function useColumnWidth(data: Data, getAsText: GetDisplay) {
    const columnStats = useMemo(() => calcStats(data, getAsText), [data, getAsText]);

    const getColWidthPx = useCallback((key: string) => {
        const stats = columnStats.get(key);
        return stats ? stats.maxLength * charWidthPx + paddingPx : defaultWidthPx;
    }, [columnStats]);

    const getColStats = useCallback((key: string) => {
        return columnStats.get(key);
    }, [columnStats]);

    return { getColWidthPx, getColStats };
}

export function calcStats(data: Data, getDisplay: GetDisplay): Map<string, ColumnStats> {
    const stats = new Map<string, ColumnStats>();
    Object.entries(data).forEach(([ticker, cols]) => {
        accStats("ticker", ticker, getDisplay, stats)
        Object.entries(cols).forEach(([key, value]) => {
            accStats(key, value, getDisplay, stats);
        })
    })
    return stats
}

function accStats(key: string, value: DataValue, getDisplay: GetDisplay, stats: Map<string, ColumnStats>) {
    const length = getDisplay(key, value)?.length;
    if (length) {
        const currentMax = stats.get(key)?.maxLength || 0;
        const maxWidth = Math.max(currentMax, length);
        stats.set(key, {maxLength: maxWidth});
    }
}
