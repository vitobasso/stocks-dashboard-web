import {CSSProperties} from "react";
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid} from "react-data-grid";
import {FinalData, getValue} from "@/lib/data";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';

type Props = {
    tickers: string[];
    labels: Labels;
    formats: Formats;
    colors: Colors;
    headers: Header[];
    data: FinalData;
    style?: CSSProperties;
    bgColor: string;
}

type Row = any
export type Header = [group: string, keys: string[]];
export type Formats = Record<string, "chart" | "percent">;
export type Labels = Record<string, string[]>;
export type Colors = Record<string, ColorRule>;
export type ColorRule = { domain: number[], colors: string[] }

export function TickerGrid(props: Props) {

    const columns: readonly ColumnOrColumnGroup<Row, unknown>[] = props.headers.map(([group, keys]) => ({
        name: props.labels[group]?.[0] ?? group,
        headerCellClass: 'text-center',
        children: keys.map(key => ({
            key,
            name: <span title={props.labels[key]?.[1] ?? ""}>{props.labels[key]?.[0] ?? key}</span>,
            frozen: key == "ticker",
            headerCellClass: 'text-center',
            width: key == "ticker" ? "68px" : "52px",
            renderCell(props) {
                return renderValue(key, props.row[key]);
            }
        }))
    }));

    const rows: Row[] = props.tickers.filter(ticker => props.data[ticker]).map(ticker => {
        let entries = props.headers.flatMap(([group, keys]) => keys.map(key => [group, key]))
            .map(([group, key], hi) => {
                let value = key === "ticker" ? ticker : getValue(props.data[ticker], group, key)
                return [key, value]
            });
        return Object.fromEntries(entries);
    });

    function renderValue(key: string, value: any) {
        if (props.formats[key] == "chart") return renderChart(value);
        if (props.formats[key] == "percent" && value) return value + "%";
        if (typeof value == "number") {
            if (isNaN(value)) return "";
            return Math.round(value * 10) / 10;
        }
        return value ?? "";
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
        let value: number = props.formats[key] == "chart" ? quoteChange(data) : data;
        let rule = props.colors[key];
        if (!rule || value == null || isNaN(value)) return props.bgColor;
        const scale = chroma.scale(rule.colors).domain(rule.domain);
        return scale(value).hex();
    }

    return <DataGrid className={"font-mono"} style={props.style} rows={rows} columns={columns}
                     renderers={{renderCell}}/>
}