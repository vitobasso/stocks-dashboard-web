"use client"

import {useEffect, useMemo, useState} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {QuoteData, ScrapedData, Derivation, consolidateData, getValue} from "@/lib/types";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';

export default function Home() {
    const [scraped, setScraped] = useState<ScrapedData>({});
    const [quotes, setQuotes] = useState<QuoteData>({});

    useEffect(() => {
        fetch("/api/scraped")
            .then(res => res.json())
            .then(json => setScraped(json));
        fetch("/api/quotes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tickers: rows}),
        })
            .then(res => res.json())
            .then(json => setQuotes(json));
    }, []);

    const data = useMemo(() => consolidateData(scraped, quotes, derivations), [scraped, quotes]);

    return (
        <Card className="m-4 p-4 overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map(([group, cols], i) => {
                            const label = labels[group]?.[0] ?? group;
                            return <TableHead key={i} colSpan={cols.length} className="text-center font-bold">
                                {label}
                            </TableHead>
                        })}
                    </TableRow>
                    <TableRow>
                        {headers.flatMap(([_, keys]) => keys).map((k, i) => {
                            const label = labels[k]?.[0] ?? k;
                            const hint = labels[k]?.[1] ?? "";
                            return <TableHead title={hint} key={i}>{label}</TableHead>
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.filter(ticker => data[ticker]).map((ticker, ri) =>
                        <TableRow key={ri}>
                            {headers.flatMap(([group, keys]) => keys.map(key => [group, key]))
                                .map(([group, key], hi) => {
                                    let cellData = getValue(data[ticker], group, key);
                                    let color = getCellColor(cellData, key);
                                    let renderedCell = key === "ticker" ? ticker : renderCell(cellData, key);
                                    return <TableCell className="text-center" style={{backgroundColor: color}} key={hi}>
                                        {renderedCell}
                                    </TableCell>;
                                })}
                        </TableRow>)}
                </TableBody>
            </Table>
        </Card>
    );
}

type Header = [group: string, keys: string[]];
type ColorRule = {domain: number[], scale: string[]}

function getValueColor(value: number, key: string): string {
    let rule = colors[key];
    if (!rule || !value) return bgColor;
    const scale = chroma.scale(rule.scale).domain(rule.domain);
    return scale(value).hex();
}

function getCellColor(data: any, key: string): string {
    let value: number = formats[key] == "chart" ? quoteChange(data) : data;
    return getValueColor(value, key)
}

function renderCell(value: any, key: string) {
    if (formats[key] == "chart") return renderChart(value);
    if (isNaN(value)) return "";
    if (formats[key] == "percent" && value) return value + "%";
    if (typeof value == "number") return Math.round(value * 10) / 10;
    return value ?? "";
}

function renderChart(data: number[]) {
    return <div style={{position: "relative"}}>
        {data && <span style={{opacity: 0.5}}>{quoteChange(data) + "%"}</span>}
        <div style={{ position: "absolute", inset: -10 }}>
            <Sparklines data={data} width={60} height={39} >
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

const red = "#f44335"; //TODO --chart-1
const bgColor = "#ffffff"; //TODO --background
const green = "#4CAF50"; //TODO --chart-2
const colors: Record<string, ColorRule> = {
    "1mo": {domain: [-10, 0, 10], scale: [red, bgColor, green]},
    "1y": {domain: [-5, 8.5, 35], scale: [red, bgColor, green]},
    "5y": {domain: [0, 30, 100], scale: [red, bgColor, green]},
    "liquidezMediaDiaria": {domain: [4, 6], scale: [red, bgColor]},

    "P/L": {domain: [-1000, 0, 12, 20], scale: [red, bgColor, bgColor, red]},
    "P/VP": {domain: [2, 5], scale: [bgColor, red]},
    "EY": {domain: [0, 10], scale: [red, bgColor]},
    "ROE": {domain: [2, 15], scale: [red, bgColor]},
    "ROIC": {domain: [0, 10], scale: [red, bgColor]},
    "margem": {domain: [0, 10], scale: [red, bgColor]},
    "divida": {domain: [1, 2], scale: [bgColor, red]},
    "liquidezCorrente": {domain: [0.5, 1], scale: [red, bgColor]},
    "lucro": {domain: [0, 8, 50], scale: [red, bgColor, green]},
    "DY": {domain: [7, 20], scale: [bgColor, green]},

    "value": {domain: [0, 2.5, 5], scale: [red, red, bgColor, green]},
    "future": {domain: [0, 2.5, 5], scale: [red, bgColor, green]},
    "past": {domain: [0, 2.5, 5], scale: [red, bgColor, green]},
    "health": {domain: [0, 2.5, 5], scale: [red, bgColor, green]},
    "dividend": {domain: [3, 6], scale: [bgColor, green]},

    "strong_buy": {domain: [0, 10], scale: [bgColor, green]},
    "buy": {domain: [0, 20], scale: [bgColor, green]},
    "hold": {domain: [4, 15], scale: [bgColor, red]},
    "underperform": {domain: [0, 3], scale: [bgColor, red]},
    "sell": {domain: [0, 1], scale: [bgColor, red]},

    "min_pct": {domain: [-5, 0, 30], scale: [red, bgColor, green]},
    "avg_pct": {domain: [0, 10, 80], scale: [red, bgColor, green]},
    "max_pct": {domain: [15, 50, 100], scale: [red, bgColor, green]},
}

const rows = [
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
