import * as XLSX from "xlsx";
import {extractData} from "@/lib/b3-position"
import {Data} from "@/lib/data";
import {ReactElement} from "react";

type Props = {
    visibleElement: ReactElement
    setPositions(data: Data): void
}

export default function PositionsReader(props: Props) {

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const buffer = event.target?.result;
            const workbook = XLSX.read(buffer, {type: "binary"});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            const data = extractData(json)
            props.setPositions(data)
        };
        reader.readAsArrayBuffer(file);
    };

    return <label className="cursor-pointer">
        {props.visibleElement}
        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile}/>
    </label>
}
