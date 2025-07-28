"use client"

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Home() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/api/data")
            .then((res) => res.text())
            .then((csv) => {
                const columnSeparator = ";"
                const [headerLine, ...lines] = csv.trim().split("\n");
                const headers: string[] = headerLine.split(columnSeparator);
                const rows: string[][] = lines.map((line) => line.split(columnSeparator));
                setData([headers, ...rows]);
            });
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
