"use client";
import {ReactElement, useCallback, useMemo, useState} from "react";
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid as ReactDataGrid, SortColumn} from "react-data-grid";
import {
    ChartData,
    Data,
    DataEntry,
    DataValue,
    getPrefix,
    getValue,
    Metadata,
    MetadataSource,
    SpecificMetadata
} from "@/lib/data";
import chroma, {Color} from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {bgColor, colors, fgColor, green, red} from "@/lib/metadata/colors";
import {Label} from "@/lib/metadata/labels";
import {useCssVars} from "@/hooks/use-css-vars";
import {getAsNumber, getAsSortable, getAsText, isChart} from "@/lib/metadata/formats";
import {cn} from "@/lib/utils";
import {getAppliedTheme} from "@/lib/theme";
import {timeAgo} from "@/lib/utils/datetime";
import {filterEntries, Rec} from "@/lib/utils/records";
import {useClickedCell} from "@/components/features/data-grid/use-clicked-cell";
import {useColumnWidth} from "@/components/features/data-grid/use-column-width";

type Props = {
    rows: string[]
    columns: string[]
    data: Data
    metadata: Metadata
    labeler(path: string): Label
    className?: string
}

type Row = Record<string, string | number>;

export function DataGrid(props: Props) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [hoveredCol, setHoveredCol] = useState<string | null>(null);
    const { getColWidthPx, getColStats } = useColumnWidth(props.data, getAsText);

    const handleCellHover = useCallback((row: Row, columnKey: string, isHovered: boolean) => {
        setHoveredRow(isHovered ? row.ticker as string : null);
        setHoveredCol(isHovered ? columnKey : null);
    }, []);

    const columns: readonly ColumnOrColumnGroup<Row>[] = useMemo(() => ["ticker", ...props.columns].map(key => ({
        key,
        name: renderHeader(props.labeler(key)),
        frozen: isTicker(key),
        sortable: !isTicker(key),
        headerCellClass: cn('text-center', hoveredCol === key && 'bg-foreground/5'),
        cellClass: cellClass(key),
        minWidth: getColWidthPx(key),
        width: getColWidthPx(key),
        renderCell: p => renderCellWithTooltip(key, p.row)
    })), [props.columns]);

    const baseRows: Row[] = useMemo(() => props.rows.toSorted().filter(ticker => props.data[ticker]).map(ticker => {
        const entries = props.columns
            .map((key) => {
                const value = getValue(props.data[ticker], key)
                return [key, value]
            });
        return {"ticker": ticker, ...Object.fromEntries(entries)};
    }), [props.rows, props.data]);

    function renderHeader(label: Label, onClick?: (e: React.MouseEvent) => void): ReactElement {
        const content = onClick ?
            <span className={"cursor-pointer"} onClick={onClick}>{label.short}</span> : <span>{label.short}</span>;
        if (!label.long) return content;
        return <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>{label.long}</TooltipContent>
        </Tooltip>
    }

    function renderValue(key: string, value: DataValue): ReactElement {
        if (isChart(key)) return renderChart(key, value);
        return <>{getAsText(key, value) ?? ""}</>;
    }

    function renderChart(key: string, data: DataValue): ReactElement {
        const chart = data as ChartData
        if (!chart) return <></>
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
        const stats = getColStats(key);
        const textAlign = stats?.maxLength && stats.maxLength > 10 ? 'text-left' : 'text-center';
        return `p-2 ${textAlign}`;
    }

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    function getSortedRows<T extends Row>(rows: T[]): T[] {
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

    const sortedRows = useMemo(() => getSortedRows(baseRows), [baseRows]);
    const renderers = useMemo(() => ({renderCell}), [hoveredCol])

    const { onCellClick, isClicked } = useClickedCell<Row>(row => row.ticker as string)

    function renderCellWithTooltip(key: string, row: Row) {
        const ticker = row.ticker as string;
        const renderedValue = renderValue(key, row[key])
        if (isTicker(key)) {
            return <TickerCellTooltip open={isClicked(ticker, key)} renderedValue={renderedValue} ticker={ticker} meta={props.metadata.sources}/>
        } else {
            return <DataCellTooltip open={isClicked(ticker, key)} renderedValue={renderedValue} colKey={key} dataEntry={props.data[ticker]}/>
        }
    }

    return <ReactDataGrid className={cn("font-mono", props.className)}
                          rows={sortedRows} columns={columns}
                          sortColumns={sortColumns} onSortColumnsChange={setSortColumns}
                          renderers={renderers} onCellClick={onCellClick}/>
}

type CellTooltipProps = {
    open: boolean
    renderedValue: ReactElement
    colKey: string
    dataEntry: DataEntry
}

export function DataCellTooltip({open, renderedValue, colKey, dataEntry}: CellTooltipProps): ReactElement {

    function specificMetadata(key: string, dataEntry?: DataEntry): SpecificMetadata | undefined {
        let prefix = getPrefix(key)
        while (prefix) {
            const metaKey = prefix + ".meta"
            const found = dataEntry?.[metaKey];
            if (found) return found as SpecificMetadata
            prefix = getPrefix(prefix)
        }
        return undefined
    }

    const meta = specificMetadata(colKey, dataEntry)
    const updatedAt = meta?.updated_at ? timeAgo(new Date(meta.updated_at)) : undefined
    if (!meta?.source && !meta?.updated_at) return renderedValue;
    return <Tooltip open={open}>
        <TooltipTrigger asChild>
            <div className="cursor-pointer">{renderedValue}</div>
        </TooltipTrigger>
        <TooltipContent>
            <div className="text-center">
                {meta?.source && <p>
                    <a href={meta.source} target="_blank" rel="noopener noreferrer" className="underline">
                        {meta.source}
                    </a>
                </p>}
                {updatedAt && <p>Atualizado {updatedAt}</p>}
            </div>
        </TooltipContent>
    </Tooltip>
}

type TickerTooltipProps = {
    open: boolean
    renderedValue: ReactElement
    ticker: string
    meta: Rec<MetadataSource>
}

export function TickerCellTooltip({open, renderedValue, ticker, meta}: TickerTooltipProps): ReactElement {

    function tickerUrls(ticker: string): [string, string][] {
        const sourcesWithUrl = filterEntries(meta, (k, v) => Boolean(v.ticker_url))
        const tuples: [string, string][] = Object.entries(sourcesWithUrl)
            .map(([_, v]) => [
                v.label,
                v.ticker_url!.replace('$ticker', ticker)
            ]);
        return tuples
            .toSorted((a, b) => a[0].localeCompare(b[0]));
    }

    return <Tooltip open={open}>
        <TooltipTrigger asChild>
            <div className="cursor-pointer">{renderedValue}</div>
        </TooltipTrigger>
        <TooltipContent side="right">
            <div className="">
                <p className="font-bold">Links</p>
                {tickerUrls(ticker).map(([source, url]) =>
                    <p key={source}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                            {source}
                        </a>
                    </p>
                )}
            </div>
        </TooltipContent>
    </Tooltip>
}

function isTicker(key: string) {
    return key === "ticker";
}
