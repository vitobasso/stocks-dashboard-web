import {Data, DataValue} from "@/lib/data";
import {useCallback, useMemo} from "react";

const charWidthPx = 8.5;
const paddingPx = 16;
const defaultWidthPx = 50;

type ColumnStats = number;
type GetDisplay = (key: string, value: DataValue) => string | undefined;

export function useColumnWidth(data: Data, getAsText: GetDisplay) {
    const textLengthMap = useMemo(() => calcStats(data, getAsText), [data, getAsText]);

    const getWidthPx = useCallback((key: string) => {
        const stats = textLengthMap.get(key);
        return stats ? stats * charWidthPx + paddingPx : defaultWidthPx;
    }, [textLengthMap]);

    const getMaxTextLength = useCallback((key: string) => textLengthMap.get(key), [textLengthMap]);

    return { getWidthPx, getMaxTextLength };
}

export function calcStats(data: Data, getDisplay: GetDisplay): Map<string, ColumnStats> {
    const stats = new Map<string, ColumnStats>();
    for (const ticker in data) {
        const cols = data[ticker];
        accStats("ticker", ticker, getDisplay, stats);
        for (const key in cols) {
            accStats(key, cols[key], getDisplay, stats);
        }
    }
    return stats;
}

function accStats(key: string, value: DataValue, getDisplay: GetDisplay, stats: Map<string, ColumnStats>) {
    const length = getDisplay(key, value)?.length;
    if (length) {
        const currentMax = stats.get(key) ?? 0;
        if (length > currentMax) stats.set(key, length);
    }
}
