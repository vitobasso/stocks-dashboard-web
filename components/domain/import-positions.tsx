import * as XLSX from "xlsx";
import {extractData} from "@/lib/b3-position"
import {Data} from "@/lib/data";

type Props = {
    setPositions(data: Data): void
}

export default function ImportPositions(props: Props) {

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

    return <div>
        <div className="font-bold">Posições</div>
        <div className="text-xs text-muted-foreground">
            1. Acesse
            <a className="underline" href="https://www.investidor.b3.com.br/login" target="_blank" rel="noopener noreferrer">
                www.investidor.b3.com.br
            </a>,
            selecione "Extratos" no menu à esquerda, "Filtrar", selecione apenas "Compra e Venda" e baixe em formato Excel.
        </div>
        <div className="text-xs text-muted-foreground">
            2. Depois <label className="underline cursor-pointer">
                clique aqui para importar
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile}/>
            </label>
        </div>

    </div>
}
