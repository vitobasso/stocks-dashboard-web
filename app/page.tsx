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
    const groupMap: Record<string, number> = {};
    headers.forEach((h) => {
        groupMap[h.group] = (groupMap[h.group] || 0) + 1;
    });

    return (
        <Card className="m-4 p-4 overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Object.entries(groupMap).map(([group, span], i) => (
                            <TableHead key={i} colSpan={span} className="text-center font-bold">
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
                                    const value = h.key === "ticker" ? row.ticker : getNestedValue(row, h.group, h.key);
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

function getNestedValue(row: TickerRow, group: string, key: string) {
    const map: Record<string, any> = {
        Fundaments: row.fundaments,
        "Analyst Rating": row.analystRating,
        "Price Forecast": row.priceForecast,
        Overview: row.overview,
        Price: row.price,
    };
    return map[group]?.[key];
}

function getHeaders(data: TickerRow[]) {
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

type ColorRule = {min: number, minColor: string, max: number, maxColor: string}

function getColor(value: number, key: string): string {
    let rule = coloring[key];
    if (!rule) return "white";
    const scale = chroma.scale(["white", "red"]).domain([rule.min, rule.max]);
    return scale(value).hex();
}

const colsIncluded = [
    "ticker",
    "LIQUIDEZ MEDIA DIARIA",
    "P/L",
    "P/VP",
    "EV/EBIT",
    "ROE",
    "ROIC",
    "MARG LIQUIDA",
    "DIV LIQ / PATRI",
    "LIQ CORRENTE",
    "CAGR LUCROS 5 ANOS",
    "DY",
    "strong_buy",
    "buy",
    "hold",
    "underperform",
    "sell",
    "min",
    "avg",
    "max",
]

const coloring: { [key: string]: ColorRule } = {
    "P/VP": {min: 2, minColor: "white", max: 5, maxColor: "red"},
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
