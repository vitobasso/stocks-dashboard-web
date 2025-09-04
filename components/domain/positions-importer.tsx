"use client";
import * as XLSX from "xlsx";
import {extractData} from "@/lib/b3-position"
import {Data, DataEntry, splitByAssetClass} from "@/lib/data";
import {Rec} from "@/lib/utils/records";
import React from "react";

type Props = {
    setPositions(p: React.SetStateAction<Rec<Data>>): void
    classOfTickers: Map<string, string>
}

export default function PositionsImporter(props: Props) {

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = ""
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = event.target?.result;
            const workbook = XLSX.read(buffer, {type: "binary"});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: DataEntry[] = XLSX.utils.sheet_to_json(worksheet);
            const data: Data = extractData(json)
            const dataByAssetClass: Rec<Data> = splitByAssetClass(data, props.classOfTickers)
            props.setPositions(dataByAssetClass)
        };
        reader.readAsArrayBuffer(file);
    };

    return <div>
        <div className="text-xs text-muted-foreground">
            <ul className="list-decimal pl-4 pb-2 [&>li]:pt-2 [&>li>ul>li]:pt-1">
                <li>
                    Acesse <a className="underline" href="https://www.investidor.b3.com.br/login" target="_blank"
                              rel="noopener noreferrer"> www.investidor.b3.com.br </a>
                    <ul className="list-disc pl-4">
                        <li>Selecione "Extratos" no menu à esquerda</li>
                        <li>Clique em "Filtrar"</li>
                        <li>Lembre de selecionar o período</li>
                        <li>Baixe em formato Excel</li>
                    </ul>
                </li>
                <li>Depois <label className="underline cursor-pointer">
                    clique aqui para importar.
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile}/>
                </label>
                </li>
            </ul>
            Esses dados ficarão armazenados apenas no seu navegador.
        </div>
    </div>
}
