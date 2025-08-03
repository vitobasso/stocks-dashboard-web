"use client"

import {useEffect, useMemo, useState} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {QuoteData, QuoteSeries, ScrapedData, Derivation, consolidateData, getValue} from "@/lib/types";
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
    if (!rule || !value) return "white";
    const scale = chroma.scale(rule.scale).domain(rule.domain);
    return scale(value).hex();
}

function getCellColor(data: any, key: string): string {
    let value: number = formats[key] == "chart" ? quoteChange(data) : data;
    return getValueColor(value, key)
}

function renderCell(value: any, key: string) {
    if (formats[key] == "chart") return renderChart(value);
    if (formats[key] == "percent" && value) return value + "%";
    if (typeof value == "number") return Math.round(value * 10) / 10;
    return value ?? "";
}

function renderChart(data: QuoteSeries) {
    return <div style={{position: "relative"}}>
        {data && <span style={{opacity: 0.5}}>{quoteChange(data) + "%"}</span>}
        <div style={{ position: "absolute", inset: -10 }}>
            <Sparklines data={data} width={40} height={30} >
                <SparklinesLine color="black" style={{fill: "none"}}/>
            </Sparklines>
        </div>
    </div>
}

function quoteChange(data: QuoteSeries) {
    return data && calcChangePct(data[0], data[data.length - 1]);
}

function calcChangePct(start: number, end: number) {
    let result = Math.floor((end - start) / start * 100);
    if (!isNaN(result)) return result;
}

const headers: Header[] = [
    ["", ["ticker"]],
    ["quotes", ["latest", "1mo", "1y", "5y"]],
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
    "ticker": ["Ticker"],
    "latest": ["Today"],
    "fundamentals": ["Fundamentals"],
    "analystRating": ["Analyst Rating"],
    "priceForecast": ["Price Forecast"],
    "overview": ["Overview"],
    "quotes": ["Quotes"],
    "liqmd_millions": ["Liq", "Liquidez Média Diária"],
    "margem": ["Marg", "Margem Líquida"],
    "divida": ["Dív", "Dívida Líquida / Patrimônio"],
    "liquidezCorrente": ["L.Cor.", "Liquidez Corrente"],
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

const colors: Record<string, ColorRule> = {
    "1mo": {domain: [-10, 0, 10], scale: ["red", "white", "green"]},
    "1y": {domain: [-5, 8.5, 35], scale: ["red", "white", "green"]},
    "5y": {domain: [0, 30, 100], scale: ["red", "white", "green"]},
    "liquidezMediaDiaria": {domain: [4, 6], scale: ["red", "white"]},

    "P/L": {domain: [-1000, 0, 12, 20], scale: ["red", "white", "white", "red"]},
    "P/VP": {domain: [2, 5], scale: ["white", "red"]},
    "EY": {domain: [0, 10], scale: ["red", "white"]},
    "ROE": {domain: [2, 15], scale: ["red", "white"]},
    "ROIC": {domain: [0, 10], scale: ["red", "white"]},
    "margem": {domain: [0, 10], scale: ["red", "white"]},
    "divida": {domain: [1, 2], scale: ["white", "red"]},
    "liquidezCorrente": {domain: [0.5, 1], scale: ["red", "white"]},
    "lucro": {domain: [0, 8, 50], scale: ["red", "white", "green"]},
    "DY": {domain: [7, 20], scale: ["white", "green"]},

    "value": {domain: [0, 2.5, 5], scale: ["red", "red", "white", "green"]},
    "future": {domain: [0, 2.5, 5], scale: ["red", "white", "green"]},
    "past": {domain: [0, 2.5, 5], scale: ["red", "white", "green"]},
    "health": {domain: [0, 2.5, 5], scale: ["red", "white", "green"]},
    "dividend": {domain: [3, 6], scale: ["white", "green"]},

    "strong_buy": {domain: [0, 10], scale: ["white", "green"]},
    "buy": {domain: [0, 20], scale: ["white", "green"]},
    "hold": {domain: [4, 15], scale: ["white", "red"]},
    "underperform": {domain: [0, 3], scale: ["white", "red"]},
    "sell": {domain: [0, 1], scale: ["white", "red"]},

    "min_pct": {domain: [-5, 0, 30], scale: ["red", "white", "green"]},
    "avg_pct": {domain: [0, 10, 80], scale: ["red", "white", "green"]},
    "max_pct": {domain: [15, 50, 100], scale: ["red", "white", "green"]},
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
