"use client"

import {useEffect, useMemo, useState} from "react";
import {consolidateData, Derivation, getValue, QuoteData, ScrapedData} from "@/lib/types";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';
import {Cell, CellRendererProps, ColumnOrColumnGroup, DataGrid} from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import {ManageDialog} from "@/components/ui/manage-dialog";

export default function Home() {
    const [scraped, setScraped] = useState<ScrapedData>({});
    const [quotes, setQuotes] = useState<QuoteData>({});
    const [tickers, setTickers] = useState<string[]>([]);

    useEffect(() => {
        setTickers(loadTickers(localStorage));

        fetch("/api/scraped")
            .then(res => res.json())
            .then(json => setScraped(json));
    }, []);

    useEffect(() => {
        localStorage.setItem("tickers", JSON.stringify(tickers));

        tickers?.length && fetch("/api/quotes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tickers}),
        })
            .then(res => res.json())
            .then(json => setQuotes(json));
    }, [tickers]);

    const data = useMemo(() => consolidateData(scraped, quotes, derivations), [scraped, quotes]);

    type Row = any

    const columns: readonly ColumnOrColumnGroup<Row, unknown>[] = headers.map(([group, keys]) => ({
        name: labels[group]?.[0] ?? group,
        headerCellClass: 'text-center',
        children: keys.map(key => ({
            key,
            name: <span title={labels[key]?.[1] ?? ""}>{labels[key]?.[0] ?? key}</span>,
            frozen: key == "ticker",
            headerCellClass: 'text-center',
            width: key == "ticker" ? "68px" : "52px",
            renderCell(props) {
                return renderValue(key, props.row[key]);
            }
        }))
    }));

    const rows: Row[] = tickers.filter(ticker => data[ticker]).map(ticker => {
        let entries = headers.flatMap(([group, keys]) => keys.map(key => [group, key]))
            .map(([group, key], hi) => {
                let value = key === "ticker" ? ticker : getValue(data[ticker], group, key)
                return [key, value]
            });
        return Object.fromEntries(entries);
    });

    function renderCell(key: React.Key, props: CellRendererProps<Row, unknown>) {
        let cellData = props.row[key as string];
        let color = getColor(key as string, cellData);
        return <Cell key={key} {...props} className="text-center" style={{backgroundColor: color}}/>;
    }

    return <>
        <ManageDialog tickers={tickers} setTickers={setTickers} />
        <DataGrid style={{height: "100vh"}} columns={columns} rows={rows} renderers={{renderCell}}/>
    </>
}

type Header = [group: string, keys: string[]];
type ColorRule = {domain: number[], colors: string[]}

function getColor(key: string, data: any): string {
    let value: number = formats[key] == "chart" ? quoteChange(data) : data;
    let rule = colors[key];
    if (!rule || value == null || isNaN(value)) return bgColor;
    const scale = chroma.scale(rule.colors).domain(rule.domain);
    return scale(value).hex();
}

function renderValue(key: string, value: any) {
    if (formats[key] == "chart") return renderChart(value);
    if (formats[key] == "percent" && value) return value + "%";
    if (typeof value == "number") {
        if (isNaN(value)) return "";
        return Math.round(value * 10) / 10;
    }
    return value ?? "";
}

function renderChart(data: number[]) {
    return <div style={{position: "relative"}}>
        {data && <span>{quoteChange(data) + "%"}</span>}
        <div style={{ position: "absolute", inset: -10 }}>
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

function copy(originalPath: string): Derivation {
    return { function: (args) => args[0], arguments: [originalPath] }
}

function loadTickers(localStorage: Storage): string[] {
    let rawTickers = localStorage.getItem("tickers");
    return rawTickers?.length && JSON.parse(rawTickers) || initialTickers;
}

const headers: Header[] = [
    ["", ["ticker"]],
    ["quotes", ["latest", "1mo", "1y", "5y"]], //TODO compare with latest when displaying % change?
    ["fundamentals", [
        "liqmd_millions",
        "P/L",
        "P/VP",
        "EY",
        "ROE",
        "ROIC",
        "margem",
        "divida",
        "liquidezCorrente",
        "lucro",
        "DY",
    ]],
    ["overview", [ "value", "future", "past", "health", "dividend" ]],
    ["analystRating", [ "strong_buy", "buy", "hold", "underperform", "sell" ]],
    ["priceForecast", [ "min_pct", "avg_pct", "max_pct" ]],
];

const derivations: Record<string, Derivation> = {
    "priceForecast.min_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["priceForecast.min", "quotes.latest"],
    },
    "priceForecast.avg_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["priceForecast.avg", "quotes.latest"],
    },
    "priceForecast.max_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["priceForecast.max", "quotes.latest"],
    },
    "fundamentals.liqmd_millions": {
        function: (args) => args[0] / 1000000,
        arguments: ["fundamentals.liquidezMediaDiaria"],
    },
    "fundamentals.EY": {
        function: (args) => Math.round(100 / args[0]),
        arguments: ["fundamentals.EV/EBIT"],
    },
    "quotes.1mo": copy("quoteCharts.1mo"),
    "quotes.1y": copy("quoteCharts.1y"),
    "quotes.5y": copy("quoteCharts.5y"),
}

const formats: Record<string, "chart" | "percent"> = {
    "1mo": "chart",
    "1y": "chart",
    "5y": "chart",
    "EY": "percent",
    "min_pct": "percent",
    "avg_pct": "percent",
    "max_pct": "percent",
}

const labels: Record<string, string[]> = {
    "ticker": ["Ação"],
    "latest": ["Hoje"],
    "quotes": ["Preço"],
    "fundamentals": ["Fundamentos"],
    "overview": ["Score"],
    "analystRating": ["Recomendação"],
    "priceForecast": ["Previsão"],
    "liqmd_millions": ["LiqM", "Liquidez Média Diária"],
    "margem": ["Marg", "Margem Líquida"],
    "divida": ["Dív", "Dívida Líquida / Patrimônio"],
    "liquidezCorrente": ["LCor", "Liquidez Corrente"],
    "lucro": ["Lucro", "CAGR Lucros 5 Anos"],
    "value": ["Valu"],
    "future": ["Futu"],
    "past": ["Past"],
    "health": ["Heal"],
    "dividend": ["Divi"],
    "strong_buy": ["SBuy", "Strong Buy"],
    "buy": ["Buy"],
    "hold": ["Hold"],
    "underperform": ["Unde", "Underperform"],
    "sell": ["Sell"],
    "min_pct": ["Min"],
    "avg_pct": ["Avg"],
    "max_pct": ["Max"],
}

const red = "#D23D2D";
const bgColor = "#F0EEE5";
const green = "#428554";
const colors: Record<string, ColorRule> = {
    "1mo": {domain: [-20, -5, 10, 20], colors: [red, bgColor, bgColor, green]},
    "1y": {domain: [-20, 8.8, 18.8, 45], colors: [red, bgColor, bgColor, green]}, //selic anual media: 13.84
    "5y": {domain: [0, 70, 115, 150], colors: [red, bgColor, bgColor, green]}, //selic acc 5 anos: 92.4
    "liquidezMediaDiaria": {domain: [4, 6], colors: [red, bgColor]},

    "P/L": {domain: [-1000, 0, 12, 20], colors: [red, bgColor, bgColor, red]},
    "P/VP": {domain: [2, 5], colors: [bgColor, red]},
    "EY": {domain: [0, 10], colors: [red, bgColor]},
    "ROE": {domain: [2, 15], colors: [red, bgColor]},
    "ROIC": {domain: [0, 10], colors: [red, bgColor]},
    "margem": {domain: [0, 10], colors: [red, bgColor]},
    "divida": {domain: [1, 2], colors: [bgColor, red]},
    "liquidezCorrente": {domain: [0.5, 1], colors: [red, bgColor]},
    "lucro": {domain: [0, 8, 15, 50], colors: [red, bgColor, bgColor, green]},
    "DY": {domain: [7, 20], colors: [bgColor, green]},

    "value": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "future": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "past": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "health": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "dividend": {domain: [3, 6], colors: [bgColor, green]},

    "strong_buy": {domain: [1, 10], colors: [bgColor, green]},
    "buy": {domain: [2, 20], colors: [bgColor, green]},
    "hold": {domain: [4, 15], colors: [bgColor, red]},
    "underperform": {domain: [0, 4], colors: [bgColor, red]},
    "sell": {domain: [0, 2], colors: [bgColor, red]},

    "min_pct": {domain: [-20, 0, 10, 30], colors: [red, bgColor, bgColor, green]},
    "avg_pct": {domain: [-5, 5, 20, 80], colors: [red, bgColor, bgColor, green]},
    "max_pct": {domain: [10, 25, 60, 100], colors: [red, bgColor, bgColor, green]},
}

const initialTickers = [
    "ABCB4",
    "BBAS3",
    "BBSE3",
    "CMIG4",
    "CPFE3",
    "CXSE3",
    "FESA4",
    "GGBR4",
    "GOAU4",
    "ISAE4",
    "ITSA4",
    "LEVE3",
    "NEOE3",
    "PETR4",
    "PRIO3",
    "RECV3",
    "RENT3",
    "ROMI3",
    "TAEE11",
    "UNIP6",
    "VALE3",
    "WEGE3",
]
