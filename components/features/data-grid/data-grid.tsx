"use client";
import {ReactElement, useState} from "react";
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
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Label} from "@/lib/metadata/labels";
import {getAsSortable, getAsText, isChart} from "@/lib/metadata/formats";
import {cn} from "@/lib/utils";
import {timeAgo} from "@/lib/utils/datetime";
import {filterEntries, Rec} from "@/lib/utils/records";
import {useClickedCell} from "@/components/features/data-grid/use-clicked-cell";
import {useColumnWidth} from "@/components/features/data-grid/use-column-width";
import {useHoveredCellHighlight} from "@/components/features/data-grid/use-hovered-cell-highlight";
import {useCellColors} from "@/components/features/data-grid/use-cell-colors";


type Props = {
    rows: string[]
    columns: string[]
    data: Data
    metadata: Metadata
    labeler(path: string): Label
    className?: string
}

type Row = Record<string, string | number>;

export function DataGrid({ rows, columns, data, metadata, labeler, className }: Props) {

    const allColKeys = ["ticker", ...columns];
    const getRowId = (row: Row) => row.ticker as string

    const {getWidthPx, getMaxTextLength} = useColumnWidth(data, getAsText);
    const {hoveredCellCss, colClass} = useHoveredCellHighlight(columns);
    const {onCellClick, isClicked} = useClickedCell<Row>(getRowId)

    const dgCols: readonly ColumnOrColumnGroup<Row>[] = allColKeys.map(key => ({
        key,
        name: renderHeader(labeler(key)),
        frozen: isTicker(key),
        sortable: !isTicker(key),
        headerCellClass: cn('text-center', colClass(key)),
        cellClass: cn(cellClass(key), colClass(key)),
        minWidth: getWidthPx(key),
        width: getWidthPx(key),
        renderCell: p => renderCellWithTooltip(key, p.row)
    }))

    const dgRows: Row[] = rows.toSorted().filter(ticker => data[ticker]).map(ticker => {
        const entries = columns
            .map((key) => {
                const value = getValue(data[ticker], key)
                return [key, value]
            });
        return {"ticker": ticker, ...Object.fromEntries(entries)};
    });

    function renderHeader(label: Label, onClick?: (e: React.MouseEvent) => void): ReactElement {
        const content = onClick ?
            <span className={"cursor-pointer"} onClick={onClick}>{label.short}</span> : <span>{label.short}</span>;
        if (!label.long) return content;
        return <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>{label.long}</TooltipContent>
        </Tooltip>
    }

    const renderCellWithTooltip = (key: string, row: Row) => {
        const ticker = row.ticker as string;
        const renderedValue = DataCell(key, row[key])
        if (isTicker(key)) {
            return <TickerCellTooltip open={isClicked(ticker, key)} renderedValue={renderedValue} ticker={ticker} meta={metadata.sources}/>
        } else {
            return <DataCellTooltip open={isClicked(ticker, key)} renderedValue={renderedValue} colKey={key} dataEntry={data[ticker]}/>
        }
    }

    function cellClass(key: string) {
        const maxLength = getMaxTextLength(key);
        const textAlign = maxLength && maxLength > 10 ? 'text-left' : 'text-center';
        return `p-2 ${textAlign}`;
    }

    const getCellColor = useCellColors(allColKeys);

    function renderCell(key: React.Key, cellProps: CellRendererProps<Row, unknown>) {
        const colKey = cellProps.column.key as string;
        const cellData = cellProps.row[colKey];
        const color = getCellColor(colKey, cellData);
        return <Cell key={key} {...cellProps} className={cellProps.className} style={{backgroundColor: color}}/>;
    }

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    function getSortedRows(rows: Row[]): Row[] {
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

    return <>
        <style>{hoveredCellCss}</style>
        <ReactDataGrid className={cn("font-mono", className)}
                       rows={getSortedRows(dgRows)} columns={dgCols}
                       sortColumns={sortColumns} onSortColumnsChange={setSortColumns}
                       renderers={{renderCell}} onCellClick={onCellClick}/>
    </>
}


function DataCell(key: string, value: DataValue): ReactElement {
    if (isChart(key)) return ChartCell(key, value);
    return <>{getAsText(key, value) ?? ""}</>;
}

function ChartCell(key: string, data: DataValue): ReactElement {
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
            .map(([, v]) => [
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
