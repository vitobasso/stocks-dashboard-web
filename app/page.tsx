"use client"

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

//TODO share with route.ts
type Fundaments = { [key: string]: string | number };
type Overview = { value: number; future: number; past: number; health: number; dividends: number };
type AnalystRating = { strongBuy: number; buy: number; hold: number; underperform: number; sell: number };
type PriceForecast = { min: number; avg: number; max: number };
type Price = { current: number; day: number; month: number; year: number };
type TickerRow = {
    ticker: string;
    fundaments?: Fundaments;
    overview?: Overview;
    analystRating?: AnalystRating;
    priceForecast?: PriceForecast;
    price?: Price;
};

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
                                    return <TableCell key={hi}>{value ?? ""}</TableCell>;
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

