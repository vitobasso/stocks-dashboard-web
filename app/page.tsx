"use client"

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {TickerRow} from "@/shared/types";
import chroma from "chroma-js";

export default function Home() {
    const [data, setData] = useState<TickerRow[]>([]);

    useEffect(() => {
        fetch("/api/data")
            .then(res => res.json())
            .then(json => setData(json));
    }, []);

    if (data.length === 0) return <div className="p-4">Loading...</div>;

    const headers = getHeaders(data)
        .filter((header) => colsIncluded.includes(header.key));
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
                    {data
                        .filter(row => rowsIncluded.includes(row.ticker))
                        .map((row, ri) => (
                            <TableRow key={ri}>
                                {headers.map((h, hi) => {
                                    const value = getValue(row, h.group, h.key);
                                    const color = getColor(value, h.key);
                                    return <TableCell style={{ backgroundColor: color }} key={hi}>{value ?? ""}</TableCell>;
                                })}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Card>
    );
}

type Header = {group: string, key: string};
type ColorRule = {min: number, minColor: string, max: number, maxColor: string}

function getValue(row: TickerRow, group: string, key: string) {
    if (key === "ticker") return row.ticker;
    const map: Record<string, any> = {
        Fundaments: row.fundaments,
        "Analyst Rating": row.analystRating,
        "Price Forecast": row.priceForecast,
        Overview: row.overview,
        Price: row.price,
    };
    return map[group]?.[key];
}

function getHeaders(data: TickerRow[]): Header[] {
    const headerGroups: Record<string, Set<string>> = {
        "": new Set(["ticker"]),
        Fundaments: new Set(),
        "Analyst Rating": new Set(),
        "Price Forecast": new Set(),
        Overview: new Set(),
        Price: new Set(),
    };

    data.forEach((row) => {
        Object.keys(row.fundaments || {}).forEach((k) => headerGroups.Fundaments.add(k));
        Object.keys(row.analystRating || {}).forEach((k) => headerGroups["Analyst Rating"].add(k));
        Object.keys(row.priceForecast || {}).forEach((k) => headerGroups["Price Forecast"].add(k));
        Object.keys(row.overview || {}).forEach((k) => headerGroups.Overview.add(k));
        Object.keys(row.price || {}).forEach((k) => headerGroups.Price.add(k));
    });

    return Object.entries(headerGroups).flatMap(([group, keys]) =>
        Array.from(keys).map((key) => ({group, key}))
    );
}

function getColor(value: number, key: string): string {
    let rule = coloring[key];
    if (!rule || !value) return "white";
    const scale = chroma.scale([rule.minColor, rule.maxColor]).domain([rule.min, rule.max]);
    return scale(value).hex();
}

const colsIncluded = [
    "ticker",
    "LIQUIDEZ MEDIA DIARIA",
    "P/L",
    "P/VP",
    "EV/EBIT", //TODO convert to EY: 1 / x
    "ROE",
    "ROIC",
    "MARG LIQUIDA", //TODO not showing
    "DIV LIQ / PATRI", //TODO not showing
    "LIQ CORRENTE", //TODO not showing
    "CAGR LUCROS 5 ANOS", //TODO shorten col, allow for short label + long hint
    "DY",
    "strong_buy",
    "buy",
    "hold",
    "underperform",
    "sell",
    "min", //TODO relative to current price:
    "avg", //TODO   (x - price) / price
    "max", //TODO
]

const coloring: { [key: string]: ColorRule } = {
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

const rowsIncluded = [
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
