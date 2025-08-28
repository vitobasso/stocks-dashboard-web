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

type Props = {
    rows: string[]
    columns: Header[]
    data: Data
    getLabel: (path: string) => Label
    style?: CSSProperties
}

type Row = Record<string, any>;

export function DataGrid(props: Props) {

    let columnStats = calcStats(props.data);

    const columns: readonly ColumnOrColumnGroup<Row>[] = props.columns.map(h => ({
        name: renderHeader(h.group),
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

    const rows: Row[] = props.rows.toSorted().filter(ticker => props.data[ticker]).map(ticker => {
        let entries = props.columns.flatMap(h => h.keys)
            .map((key) => {
                let value = key === "ticker" ? ticker : getValue(props.data[ticker], key)
                return [key, value]
            });
        return Object.fromEntries(entries);
    });

    function renderHeader(key: string): ReactElement {
        let label = props.getLabel(key)
        let plainHeader = <span>{label.short}</span>;
        return label.long ?
            <Tooltip>
                <TooltipTrigger asChild>{plainHeader}</TooltipTrigger>
                <TooltipContent>
                    {label.long ?? ""}
                </TooltipContent>
            </Tooltip>
            :
            plainHeader;
    }

    function renderValue(key: string, value: any) {
        if (formats[key] == "chart") return renderChart(value);
        if (formats[key] == "percent" && value) return value + "%";
        if (Number(value)) {
            if (isNaN(value)) return "";
            return trimPrecision(value);
        }
        return value ?? "";
    }

    function trimPrecision(num: number) {
        if (num >= 100) return Math.round(num)
        if (num >= 10) return Math.round(num * 10) / 10
        return Math.round(num * 100) / 100
    }

    function renderChart(data: number[]) {
        return <div style={{position: "relative"}}>
            {data && <span>{quoteChange(data) + "%"}</span>}
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
        let result = Math.floor((end - start) / start * 100);
        if (!isNaN(result)) return result;
    }

    function renderCell(key: React.Key, props: CellRendererProps<Row, unknown>) {
        let cellData = props.row[key as string];
        let color = getColor(key as string, cellData);
        return <Cell key={key} {...props} className="text-center" style={{backgroundColor: color}}/>;
    }

    let cssVars = useCssVars([bgColor, red, green])

    function getColor(key: string, data: any): string {
        let value = formats[key] == "chart" ? quoteChange(data) : data;
        let rule = colors[key];
        if (!rule || value == null || value === "" || isNaN(value)) return cssVars[bgColor];
        let cssColors = rule.colors.map(c => cssVars[c]);
        const scale = chroma.scale(cssColors).domain(rule.domain);
        return scale(value as number).hex();
    }

    function cellClass(key: string) {
        let stats = columnStats.get(key);
        return stats?.maxLength && stats.maxLength > 10 ? 'text-left' : 'text-center';
    }

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    function getSortedRows(rows: any[]): any[] {
        if (sortColumns.length === 0) return rows;

        const {columnKey, direction} = sortColumns[0];
        return [...rows].sort((a, b) => {
            if (a[columnKey] < b[columnKey]) return direction === 'ASC' ? -1 : 1;
            if (a[columnKey] > b[columnKey]) return direction === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    return <ReactDataGrid className={"font-mono"} style={props.style} rows={getSortedRows(rows)} columns={columns}
                          sortColumns={sortColumns} onSortColumnsChange={setSortColumns} renderers={{renderCell}}/>
}

const charWidthPx = 8.5;
const paddingPx = 15;
const defaultWidthPx = 50;

function widthPx(key: string, columnStats: Map<string, ColumnStats>): number {
    let stats = columnStats.get(key)
    return stats ? stats.maxLength * charWidthPx + paddingPx : defaultWidthPx
}

type Formats = Record<string, "chart" | "percent">;
const formats: Formats = {
    "yahoo_chart.1mo": "chart",
    "yahoo_chart.1y": "chart",
    "yahoo_chart.5y": "chart",
    "derived.statusinvest.ey": "percent",
    "derived.forecast.min_pct": "percent",
    "derived.forecast.avg_pct": "percent",
    "derived.forecast.max_pct": "percent",
}
