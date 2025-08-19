import {CSSProperties, ReactElement, useState} from "react";
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid, SortColumn} from "react-data-grid";
import {Data, getValue} from "@/lib/data";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {getLabel} from "@/lib/metadata/labels";
import {bgColor, colors} from "@/lib/metadata/colors";
import {Header} from "@/lib/metadata/defaults";

type Props = {
    tickers: string[];
    headers: Header[];
    data: Data;
    style?: CSSProperties;
}

type Row = Record<string, any>;

export function TickerGrid(props: Props) {

    const columns: readonly ColumnOrColumnGroup<Row>[] = props.headers.map(h => ({
        name: renderHeader(h.group),
        headerCellClass: 'text-center',
        children: h.keys.map(key => ({
            key,
            name: renderHeader(key),
            frozen: key == "ticker",
            sortable: true,
            headerCellClass: 'text-center',
            width: key == "ticker" ? "68px" : "52px",
            renderCell(props) {
                return renderValue(key, props.row[key]);
            }
        }))
    }));

    const rows: Row[] = props.tickers.filter(ticker => props.data[ticker]).map(ticker => {
        let entries = props.headers.flatMap(h => h.keys)
            .map((key) => {
                let value = key === "ticker" ? ticker : getValue(props.data[ticker], key)
                return [key, value]
            });
        return Object.fromEntries(entries);
    });

    function renderHeader(key: string): ReactElement {
        let label = getLabel(key)
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

    function getColor(key: string, data: any): string {
        let value = formats[key] == "chart" ? quoteChange(data) : data;
        let rule = colors[key];
        if (!rule || value == null || value === "" || isNaN(value)) return bgColor;
        const scale = chroma.scale(rule.colors).domain(rule.domain);
        return scale(value as number).hex();
    }

    const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

    function getSortedRows(rows: any[]): any[] {
        if (sortColumns.length === 0) return rows;

        const { columnKey, direction } = sortColumns[0];
        return [...rows].sort((a, b) => {
            if (a[columnKey] < b[columnKey]) return direction === 'ASC' ? -1 : 1;
            if (a[columnKey] > b[columnKey]) return direction === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    return <DataGrid className={"font-mono"} style={props.style} rows={getSortedRows(rows)} columns={columns}
                     sortColumns={sortColumns} onSortColumnsChange={setSortColumns} renderers={{renderCell}}/>
}

type Formats = Record<string, "chart" | "percent">;
const formats: Formats = {
    "yahoo_chart.1mo": "chart",
    "yahoo_chart.1y": "chart",
    "yahoo_chart.5y": "chart",
    "statusinvest.ey": "percent",
    "derived_forecast.min_pct": "percent",
    "derived_forecast.avg_pct": "percent",
    "derived_forecast.max_pct": "percent",
}
