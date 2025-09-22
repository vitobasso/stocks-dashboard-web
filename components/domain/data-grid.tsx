"use client";
import {ReactElement, useCallback, useState} from "react";
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid as ReactDataGrid, SortColumn} from "react-data-grid";
import {calcStats, ChartData, ColumnStats, Data, DataValue, getValue} from "@/lib/data";
import chroma, {Color} from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {bgColor, colors, fgColor, green, red} from "@/lib/metadata/colors";
import {Header} from "@/lib/metadata/defaults";
import {Label} from "@/lib/metadata/labels";
import {useCssVars} from "@/hooks/use-css-vars";
import {getAsNumber, getAsSortable, getAsText, isChart} from "@/lib/metadata/formats";
import {cn} from "@/lib/utils";
import {getAppliedTheme} from "@/lib/theme";

type Props = {
    rows: string[]
    columns: Header[]
    data: Data
    getLabel(path: string): Label
    className?: string
    onGroupHeaderClick?(group: string): void
    onTickerHeaderClick?(): void
}

type Row = Record<string, string | number>;

export function DataGrid(props: Props) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [hoveredCol, setHoveredCol] = useState<string | null>(null);
    const columnStats = calcStats(props.data, getAsText);

    const handleCellHover = useCallback((row: Row, columnKey: string, isHovered: boolean) => {
        setHoveredRow(isHovered ? row.ticker as string : null);
        setHoveredCol(isHovered ? columnKey : null);
    }, []);

    const columns: readonly ColumnOrColumnGroup<Row>[] = props.columns.map(h => ({
        name: renderGroupHeader(h),
        headerCellClass: 'text-center',
        children: h.keys.map(key => ({
            key,
            name: isTicker(key) ? renderTickerHeader(key) : renderHeader(key, props.getLabel),
            frozen: isTicker(key),
            sortable: !isTicker(key),
            headerCellClass: cn('text-center', hoveredCol === key && 'bg-foreground/5'),
            cellClass: cellClass(key),
            minWidth: widthPx(key, columnStats),
            width: widthPx(key, columnStats),
            renderCell: props => renderValue(key, props.row[key])
        }))
    }));

    const baseRows: Row[] = props.rows.toSorted().filter(ticker => props.data[ticker]).map(ticker => {
        const entries = props.columns.flatMap(h => h.keys)
            .map((key) => {
                const value = key === "ticker" ? ticker : getValue(props.data[ticker], key)
                return [key, value]
            });
        return Object.fromEntries(entries);
    });

    function renderHeader(key: string, getLabel: (key: string) => Label, onClick?: (e: React.MouseEvent) => void): ReactElement {
        const label = getLabel(key);
        const content = onClick ?
            <span className={"cursor-pointer"} onClick={onClick}>{label.short}</span> : <span>{label.short}</span>;
        if (!label.long) return content;
        return <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>{label.long}</TooltipContent>
        </Tooltip>
    }

    function renderTickerHeader(key: string) {
        const onClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            props.onTickerHeaderClick?.();
        };
        return renderHeader(key, props.getLabel, onClick);
    }

    function renderGroupHeader(h: Header) {
        return renderHeader(h.group, (key) => ({short: key, long: ""}), () => props.onGroupHeaderClick?.(h.group))
    }

    function renderValue(key: string, value: DataValue) {
        if (isChart(key)) return renderChart(key, value);
        return getAsText(key, value) ?? "";
    }

    function renderChart(key: string, data: DataValue) {
        const chart = data as ChartData
        if (!chart) return undefined
        return <div style={{position: "relative"}}>
            <span>{getAsText(key, data)}</span>
            <div style={{position: "absolute", inset: -10}}>
                <Sparklines data={chart.series} width={60} height={39} style={{opacity: 0.25}}>
                    <SparklinesLine color="black" style={{fill: "none"}}/>
                </Sparklines>
            </div>
        </div>
    }

    function renderCell(key: React.Key, props: CellRendererProps<Row, unknown>) {
        const cellData = props.row[key as string];
        const color = getHoveredColor(key as string, props.row.ticker, cellData);
        return <Cell key={key} {...props} className="text-center" style={{backgroundColor: color.hex()}}
                     onMouseEnter={() => handleCellHover(props.row, key as string, true)}
                     onMouseLeave={() => handleCellHover(props.row, key as string, false)}/>;
    }

    const cssVars = useCssVars([bgColor, fgColor, red, green])

    function getHoveredColor(key: string, ticker: string | number, data: string | number): Color {
        const baseColor = getBaseColor(key as string, data);
        const isHovered = hoveredCol === key || hoveredRow === ticker;
        const ratio = getAppliedTheme() == "light" ? 0.1 : 0.01;
        return isHovered ? chroma.mix(baseColor, cssVars[fgColor], ratio) : chroma(baseColor);
    }

    function getBaseColor(key: string, data: DataValue): string {
        const number = getAsNumber(key, data);
        const rule = colors[key];
        if (!rule || !number) return cssVars[bgColor];
        const cssColors = rule.colors.map(c => cssVars[c]);
        const scale = chroma.scale(cssColors).domain(rule.domain);
        return scale(number).hex();
    }

    function cellClass(key: string) {
        const stats = columnStats.get(key);
        const textAlign = stats?.maxLength && stats.maxLength > 10 ? 'text-left' : 'text-center';
        return `p-2 ${textAlign}`;
    }

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    function getSortedRows<T extends Row>(rows: T[]): T[] {
        if (sortColumns.length === 0) return rows;
        const {columnKey, direction} = sortColumns[0];
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

    return <ReactDataGrid className={cn("font-mono", props.className)}
                          rows={getSortedRows(baseRows)} columns={columns}
                          sortColumns={sortColumns} onSortColumnsChange={setSortColumns}
                          renderers={{renderCell}}/>
}

function isTicker(key: string) {
    return key === "ticker";
}

const charWidthPx = 8.5;
const paddingPx = 16;
const defaultWidthPx = 50;

function widthPx(key: string, columnStats: Map<string, ColumnStats>): number {
    const stats = columnStats.get(key);
    return stats ? stats.maxLength * charWidthPx + paddingPx : defaultWidthPx;
}
