"use client"

import {useEffect, useMemo, useState} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {QuoteData, QuoteEntry, QuoteSeries, ScrapedData, ScrapedEntry} from "@/shared/types";
import chroma from "chroma-js";
import {Sparklines, SparklinesLine} from 'react-sparklines';

export default function Home() {
    const [scraped, setScraped] = useState<ScrapedData>({});
    const [quotes, setQuotes] = useState<QuoteData>({});

    useEffect(() => {
        fetch("/api/scraped")
            .then(res => res.json())
            .then(json => setScraped(json));
        fetch("/api/quotes")
            .then(res => res.json())
            .then(json => setQuotes(json));
    }, []);

    const data = useMemo(() => consolidateData(scraped, quotes), [scraped, quotes]);

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
                                    let cellData = getCellValue(data[ticker], group, key);
                                    let color = getCellColor(cellData, key);
                                    let renderedCell = key === "ticker" ? ticker : renderCell(cellData, key);
                                    return <TableCell style={{backgroundColor: color}} key={hi}>
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
type DerivedEntry = Record<keyof typeof derivations, any>
type FinalEntry = ScrapedEntry & QuoteEntry & DerivedEntry;
type FinalData = Record<string, FinalEntry>;
type ColorRule = {min: number, minColor: string, max: number, maxColor: string}
type Derivation = {function: (...args: any[]) => any, arguments: string[]};

function getCellValue(row: FinalEntry, group: string, key: string) {
    return (row as any)[group]?.[key];
}

function getValueColor(value: number, key: string): string {
    let rule = colors[key];
    if (!rule || !value) return "white";
    const scale = chroma.scale([rule.minColor, rule.maxColor]).domain([rule.min, rule.max]);
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

function mergeData<A extends Record<string, any>, B extends Record<string, any>>
(data1: Record<string, A>, data2: Record<string, B>): Record<string, A & B> {
    let entries = Object.keys({ ...data1, ...data2 }).map(key => {
        let value = mergeEntries(data1[key], data2[key]);
        return [key, value]
    });
    return Object.fromEntries(entries);
}

function mergeEntries(data1: Record<string, any>, data2: Record<string, any>): Record<string, any> {
    if (!data1) return data2;
    if (!data2) return data1;
    let entries = Object.keys({ ...data1, ...data2 }).map(key => {
        let value = { ...data1[key], ...data2[key] };
        return [key, value]
    });
    return Object.fromEntries(entries);
}

function deriveData(data: Record<string, Record<string, any>>): Record<string, DerivedEntry> {
    let entries = Object.keys(data).map(ticker => {
        let derived = deriveEntry(data[ticker]);
        return [ticker, derived];
    })
    return Object.fromEntries(entries);
}

function deriveEntry(data: Record<string, any>): Record<string, DerivedEntry> {
    let entries = Object.keys(derivations).map(path => {
        let derivation = derivations[path];
        let args = derivation.arguments.map((path) => getValueByPath(data, path))
        let value = derivation.function(args);
        return [path, value];
    })
    let flatObj = Object.fromEntries(entries);
    return unflatten(flatObj);
}

function unflatten(obj: Record<string, any>): Record<string, Record<string, any>> {
    const result: Record<string, any> = {};
    for (const flatKey in obj) {
        const [group, key] = flatKey.split(".");
        result[group] ??= {};
        result[group][key] = obj[flatKey];
    }
    return result;
}

function getValueByPath(data: any, path: string) {
    let [group, key] = path.split(".");
    return getCellValue(data, group, key);
}

function consolidateData(scraped: ScrapedData, quotes: QuoteData): FinalData {
    let merged = mergeData(scraped, quotes);
    let derived = deriveData(merged);
    return mergeData(merged, derived);
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
    ["analystRating", [
        "strong_buy",
        "buy",
        "hold",
        "underperform",
        "sell",
    ]],
    ["priceForecast", [
        "min_pct",
        "avg_pct",
        "max_pct",
    ]],
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
    "margem": ["Margem", "Margem Líquida"],
    "divida": ["Dívida", "Dívida Líquida / Patrimônio"],
    "liquidezCorrente": ["L.Cor.", "Liquidez Corrente"],
    "lucro": ["Lucro", "CAGR Lucros 5 Anos"],
    "strong_buy": ["SBuy", "Strong Buy"],
    "buy": ["Buy"],
    "hold": ["Hold"],
    "underperform": ["Und", "Underperform"],
    "sell": ["Sell"],
    "min_pct": ["Min"],
    "avg_pct": ["Avg"],
    "max_pct": ["Max"],
}

const colors: Record<string, ColorRule> = {
    "1mo": {min: 0, max: 10, minColor: "white", maxColor: "green"}, //TODO red 10% -> 0% white
    "1y": {min: 8.5, max: 35, minColor: "white", maxColor: "green"}, //TODO red -5% -> 8.5% white
    "5y": {min: 30, max: 100, minColor: "white", maxColor: "green"}, //TODO red 0% -> 0.3% white
    "liquidezMediaDiaria": {min: 4, max: 6, minColor: "red", maxColor: "white"},
    "P/L": {min: 12, max: 20, minColor: "white", maxColor: "red"}, //TODO < 0 red
    "P/VP": {min: 2, max: 5, minColor: "white", maxColor: "red"},
    "EY": {min: 0, max: 10, minColor: "red", maxColor: "white"},
    "ROE": {min: 2, max: 15, minColor: "red", maxColor: "white"},
    "ROIC": {min: 0, max: 10, minColor: "red", maxColor: "white"},
    "margem": {min: 0, max: 10, minColor: "red", maxColor: "white"},
    "divida": {min: 1, max: 2, minColor: "white", maxColor: "red"},
    "liquidezCorrente": {min: 0.5, max: 1, minColor: "red", maxColor: "white"},
    "lucro": {min: 8, max: 50, minColor: "white", maxColor: "green"}, //TODO red 0 -> 8 white
    "DY": {min: 7, max: 20, minColor: "white", maxColor: "green"},
    "strong_buy": {min: 0, max: 10, minColor: "white", maxColor: "green"},
    "buy": {min: 0, max: 20, minColor: "white", maxColor: "green"},
    "hold": {min: 4, max: 15, minColor: "white", maxColor: "red"},
    "underperform": {min: 0, max: 3, minColor: "white", maxColor: "red"},
    "sell": {min: 0, max: 1, minColor: "white", maxColor: "red"},
    "min_pct": {min: 0, max: 30, minColor: "white", maxColor: "green"}, //TODO red -5% -> 0% white
    "avg_pct": {min: 10, max: 80, minColor: "white", maxColor: "green"}, //TODO red 0% -> 10% white
    "max_pct": {min: 50, max: 100, minColor: "white", maxColor: "green"}, //TODO red 15% -> 50% white
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
