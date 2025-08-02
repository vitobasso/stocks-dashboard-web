"use client"

import {useEffect, useState, useMemo} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ScrapedData, ScrapedEntry, QuoteData, QuoteSeries, IntervalQuotes} from "@/shared/types";
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

    const data = useMemo(() => mergeData(scraped, quotes), [scraped, quotes]);

    if (Object.keys(data).length === 0) return <div className="p-4">Loading...</div>;

    const headers = getHeaders(Object.values(data))
        .filter((header) => cols.includes(header.key));
    const groupSizes: Record<string, number> = {};
    headers.forEach((h) => {
        groupSizes[h.group] = (groupSizes[h.group] || 0) + 1;
    });

    return (
        <Card className="m-4 p-4 overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Object.entries(groupSizes).map(([group, size], i) => (
                            <TableHead key={i} colSpan={size} className="text-center font-bold">
                                {group || "Ticker"}
                            </TableHead>
                        ))}
                    </TableRow>
                    <TableRow>
                        {headers.map((h, i) => (
                            <TableHead key={i}>{h.key}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((ticker, ri) => (
                        <TableRow key={ri}>
                            {headers.map((h, hi) => {
                                const value = h.group === "Ticker" ? ticker : getValue(data[ticker], h.group, h.key);
                                const color = getColor(value, h.key);
                                return <TableCell style={{backgroundColor: color}} key={hi}>
                                    {value ?? ""}
                                </TableCell>;
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

type Header = {group: string, key: string};
type MergedEntry = ScrapedEntry & {Quotes: IntervalQuotes};
type MergedData = Record<string, MergedEntry>;
type ColorRule = {min: number, minColor: string, max: number, maxColor: string}

function getValue(row: MergedEntry, group: string, key: string) {
    const map: Record<string, any> = {
        Fundaments: row.fundaments,
        "Analyst Rating": row.analystRating,
        "Price Forecast": row.priceForecast,
        Overview: row.overview,
        Quotes: row.Quotes,
    };
    const value = map[group]?.[key];
    if (types[key] == "chart") return renderChart(value)
    return value;
}

function renderChart(data: QuoteSeries) {
    return <Sparklines data={data} width={100} height={40}>
        <SparklinesLine color="black" style={{ fill: "none", strokeWidth: 2 }}/>
    </Sparklines>
}

function getHeaders(data: ScrapedEntry[]): Header[] {
    const headerGroups: Record<string, Set<string>> = {
        "Ticker": new Set(["ticker"]),
        Fundaments: new Set(),
        "Analyst Rating": new Set(),
        "Price Forecast": new Set(),
        Overview: new Set(),
        Quotes: new Set(["1d", "1mo", "1y", "5y"]),
    };

    data.forEach((row) => {
        Object.keys(row.fundaments || {}).forEach((k) => headerGroups.Fundaments.add(k));
        Object.keys(row.analystRating || {}).forEach((k) => headerGroups["Analyst Rating"].add(k));
        Object.keys(row.priceForecast || {}).forEach((k) => headerGroups["Price Forecast"].add(k));
        Object.keys(row.overview || {}).forEach((k) => headerGroups.Overview.add(k));
    });

    return Object.entries(headerGroups).flatMap(([group, keys]) =>
        Array.from(keys).map((key) => ({group, key}))
    );
}

function mergeData(scraped: ScrapedData, quotes: QuoteData): MergedData {
    return Object.fromEntries(
        Object.keys({ ...scraped, ...quotes }).map(key => [
            key,
            { ...scraped[key], Quotes: { ...quotes[key] } }
        ])
    );
}

function getColor(value: number, key: string): string {
    let rule = colors[key];
    if (!rule || !value) return "white";
    const scale = chroma.scale([rule.minColor, rule.maxColor]).domain([rule.min, rule.max]);
    return scale(value).hex();
}

const cols = [
    "ticker",

    // quotes
    "1y", //TODO display chart

    // fundaments
    "LIQUIDEZ MEDIA DIARIA", //TODO x / 1.000.000
    "P/L",
    "P/VP",
    "EV/EBIT", //TODO convert to EY: 1 / x
    "ROE",
    "ROIC",
    "MARG. LIQUIDA",
    "DIV. LIQ. / PATRI.",
    "LIQ. CORRENTE",
    "CAGR LUCROS 5 ANOS", //TODO shorten col, allow for short label + long hint
    "DY",

    // analyst
    "strong_buy",
    "buy",
    "hold",
    "underperform",
    "sell",
    "min", //TODO relative to current price:
    "avg", //TODO   (x - price) / price
    "max", //TODO
]

const types: Record<string, "chart" | "number" | "string"> = {
    "1y": "chart",
}

const colors: Record<string, ColorRule> = {
    "LIQUIDEZ MEDIA DIARIA": {min: 4, max: 6, minColor: "red", maxColor: "white"},
    "P/L": {min: 12, max: 20, minColor: "white", maxColor: "red"}, //TODO < 0 red
    "P/VP": {min: 2, max: 5, minColor: "white", maxColor: "red"},
    "EV/EBIT": {min: 10, max: 50, minColor: "white", maxColor: "red"},
    "ROE": {min: 2, max: 15, minColor: "red", maxColor: "white"},
    "ROIC": {min: 0, max: 10, minColor: "red", maxColor: "white"},
    "MARG LIQUIDA": {min: 0, max: 10, minColor: "red", maxColor: "white"},
    "DIV LIQ / PATRI": {min: 1, max: 2, minColor: "white", maxColor: "red"},
    "LIQ CORRENTE": {min: 0.5, max: 1, minColor: "red", maxColor: "white"},
    "CAGR LUCROS 5 ANOS": {min: 8, max: 50, minColor: "white", maxColor: "green"}, //TODO red 0 -> 8 white
    "DY": {min: 7, max: 20, minColor: "white", maxColor: "green"},
    "strong_buy": {min: 0, max: 10, minColor: "white", maxColor: "green"},
    "buy": {min: 0, max: 20, minColor: "white", maxColor: "green"},
    "hold": {min: 4, max: 15, minColor: "white", maxColor: "red"},
    "underperform": {min: 0, max: 3, minColor: "white", maxColor: "red"},
    "sell": {min: 0, max: 1, minColor: "white", maxColor: "red"},
    "min": {min: 0, max: 30, minColor: "white", maxColor: "green"}, //TODO red -5% -> 0% white
    "avg": {min: 10, max: 80, minColor: "white", maxColor: "green"}, //TODO red 0% -> 10% white
    "max": {min: 50, max: 100, minColor: "white", maxColor: "green"}, //TODO red 15% -> 50% white
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
