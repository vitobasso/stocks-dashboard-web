"use client"

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export default function Home() {
    const [data, setData] = useState<string[][]>([]);

    useEffect(() => {
        fetch("/api/data")
            .then(res => res.text())
            .then(csv => setData(filterCsv(csv)));
    }, []);

    if (data.length === 0) return <div className="p-4">Loading...</div>;

    const [headers, ...rows] = data;

    return (
        <Card className="m-4 p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map((h, i) => (
                            <TableHead key={i}>{h}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, ri) => (
                        <TableRow key={ri}>
                            {row.map((cell, ci) => (
                                <TableCell
                                    key={ci}
                                    className={
                                        ci === 2 && parseFloat(cell) > 100 ? "text-red-500" : ""
                                    }
                                >
                                    {cell}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

const colsIncluded = [
    "TICKER",
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

function filterCsv(csv: string): string[][] {
    const columnSeparator = ";"
    const [headerLine, ...lines] = csv.trim().split("\n");
    const allHeaders = headerLine.split(columnSeparator);
    const selectedCols = colsIncluded.map(col => allHeaders.indexOf(col))
    const headers = selectedCols.map(i => allHeaders[i]);
    const rows = lines
        .map(row => row.split(columnSeparator))
        .map(row => selectedCols.map(i => row[i]))
        .filter(row => rowsIncluded.includes(row[0]));
    return [headers, ...rows];
}