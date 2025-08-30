import {CSSProperties, ReactElement, useState} from "react";
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid as ReactDataGrid, SortColumn} from "react-data-grid";
import {calcStats, ColumnStats, Data, getValue} from "@/lib/data";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {bgColor, colors, green, red} from "@/lib/metadata/colors";
import {Header} from "@/lib/metadata/defaults";
import {Label} from "@/lib/metadata/labels";
import {useCssVars} from "@/hooks/use-css-vars";
import {formatAsText, isChart} from "@/lib/metadata/formats";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react"

type Props = {
    rows: string[]
    columns: Header[]
    data: Data
    getLabel: (path: string) => Label
    style?: CSSProperties
    onGroupHeaderClick?: (group: string) => void
    onAddRowClick?: () => void
}

type Row = Record<string, string | number>;

export function DataGrid(props: Props) {

    const columnStats = calcStats(props.data, formatAsText);

    const columns: readonly ColumnOrColumnGroup<Row>[] = props.columns.map(h => ({
        name: renderHeader(h.group, true),
        headerCellClass: 'text-center',
        children: h.keys.map(key => ({
            key,
            name: renderHeader(key),
            frozen: key == "ticker",
            sortable: true,
            headerCellClass: 'text-center',
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

    function renderHeader(key: string, isGroup?: boolean): ReactElement {
        const label = props.getLabel(key)
        const content = <span className={isGroup && props.onGroupHeaderClick ? "cursor-pointer" : undefined}
                            onClick={isGroup && props.onGroupHeaderClick ? () => props.onGroupHeaderClick!(key) : undefined}>
            {label.short}
        </span>;
        return label.long ?
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent>
                    {label.long ?? ""}
                </TooltipContent>
            </Tooltip>
            :
            content;
    }

    function renderValue(key: string, value: unknown) {
        if (key === "ticker" && value === "__add__") return renderAddButton(props)
        if (isChart(key)) return renderChart((value as number[]) ?? []);
        return formatAsText(key, value) ?? "";
    }

    function renderChart(data: number[]) {
        const number = quoteChange(data);
        return <div style={{position: "relative"}}>
            {Number.isFinite(number) && <span>{number}%</span>}
            <div style={{position: "absolute", inset: -10}}>
                <Sparklines data={data} width={60} height={39} style={{opacity: 0.25}}>
                    <SparklinesLine color="black" style={{fill: "none"}}/>
                </Sparklines>
            </div>
        </div>
    }

    function quoteChange(data: number[]) {
        return data && calcChangePct(data[0], data[data.length - 1]);
    }

    function calcChangePct(start: number, end: number) {
        const result = Math.floor((end - start) / start * 100);
        if (isFinite(result)) return result;
    }

    function renderCell(key: React.Key, props: CellRendererProps<Row, unknown>) {
        const cellData = props.row[key as string];
        const color = getColor(key as string, cellData);
        return <Cell key={key} {...props} className="text-center" style={{backgroundColor: color}}/>;
    }

    const cssVars = useCssVars([bgColor, red, green])

    function getColor(key: string, data: unknown): string {
        const value = isChart(key) ? quoteChange((data as number[]) ?? []) : data;
        const rule = colors[key];
        const numeric = Number(value as number);
        if (!rule || value == null || value === "" || !isFinite(numeric)) return cssVars[bgColor];
        const cssColors = rule.colors.map(c => cssVars[c]);
        const scale = chroma.scale(cssColors).domain(rule.domain);
        return scale(numeric).hex();
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
            if (a[columnKey] < b[columnKey]) return direction === 'ASC' ? -1 : 1;
            if (a[columnKey] > b[columnKey]) return direction === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    const displayRows = [...(getSortedRows(baseRows)), {ticker: "__add__"}]

    return <ReactDataGrid className={"font-mono"} style={props.style} rows={displayRows} columns={columns}
                          sortColumns={sortColumns} onSortColumnsChange={setSortColumns} renderers={{renderCell}}/>
}

const charWidthPx = 8.5;
const paddingPx = 16;
const defaultWidthPx = 50;

function widthPx(key: string, columnStats: Map<string, ColumnStats>): number {
    const stats = columnStats.get(key);
    return stats ? stats.maxLength * charWidthPx + paddingPx : defaultWidthPx;
}

function renderAddButton(props: Props) {
    return <div className="flex justify-center">
        <Button size="icon" variant="link" className="cursor-pointer size-4" onClick={props.onAddRowClick}
                aria-label="Add row">
            <Plus/>
        </Button>
    </div>;
}


