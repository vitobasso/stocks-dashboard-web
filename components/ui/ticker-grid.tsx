import {CSSProperties, ReactElement} from "react";
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid} from "react-data-grid";
import {Data, getValue} from "@/lib/data";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Colors, Formats, Header, Label} from "@/app/page";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

type Props = {
    tickers: string[];
    getLabel(key: string): Label
    formats: Formats;
    colors: Colors;
    headers: Header[];
    data: Data;
    style?: CSSProperties;
    bgColor: string;
}

type Row = Record<string, any>;

export function TickerGrid(props: Props) {

    const columns: readonly ColumnOrColumnGroup<Row>[] = props.headers.map(([group, keys]) => ({
        name: renderHeader(group),
        headerCellClass: 'text-center',
        children: keys.map(key => ({
            key,
            name: renderHeader(key),
            frozen: key == "ticker",
            headerCellClass: 'text-center',
            width: key == "ticker" ? "68px" : "52px",
            renderCell(props) {
                return renderValue(key, props.row[key]);
            }
        }))
    }));

    const rows: Row[] = props.tickers.filter(ticker => props.data[ticker]).map(ticker => {
        let entries = props.headers.flatMap(([_, keys]) => keys)
            .map((key) => {
                let value = key === "ticker" ? ticker : getValue(props.data[ticker], key)
                return [key, value]
            });
        return Object.fromEntries(entries);
    });

    function renderHeader(key: string): ReactElement {
        let label = props.getLabel(key)
        return label.long ?
            <Tooltip>
                <TooltipTrigger>{label?.short}</TooltipTrigger>
                <TooltipContent>
                    {label.long ?? ""}
                </TooltipContent>
            </Tooltip>
            :
            <>{label.short}</>;
    }

    function renderValue(key: string, value: any) {
        if (props.formats[key] == "chart") return renderChart(value);
        if (props.formats[key] == "percent" && value) return value + "%";
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
        let value = props.formats[key] == "chart" ? quoteChange(data) : data;
        let rule = props.colors[key];
        if (!rule || value == null || value === "" || isNaN(value)) return props.bgColor;
        const scale = chroma.scale(rule.colors).domain(rule.domain);
        return scale(value as number).hex();
    }

    return <DataGrid className={"font-mono"} style={props.style} rows={rows} columns={columns}
                     renderers={{renderCell}}/>
}