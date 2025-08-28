import {Data, DataEntry} from "@/lib/data";

type Trade = {
    ticker: string;
    side: "buy" | "sell";
    quantity: number;
    unitPrice: number;
};

type StockPosition = {
    quantity: number;
    averagePrice: number;
};

export const schema = [
    "b3_position.quantity",
    "b3_position.average_price",
]

export function extractData(rows: any[]): Data {
    const trades: Trade[] = rows.map(getTrade);
    const positions: Map<string, StockPosition> = calculatePositions(trades);
    return standardizeData(positions);
}

function calculatePositions(trades: Trade[]): Map<string, StockPosition> {
    const positions = new Map<string, StockPosition>();
    for (const t of trades) {
        const prev = positions.get(t.ticker) || {quantity: 0, averagePrice: 0};
        if (t.side === "buy") {
            let totalPrice = prev.averagePrice * prev.quantity + t.quantity * t.unitPrice;
            let totalQuantity = prev.quantity + t.quantity;
            prev.averagePrice = totalPrice / totalQuantity;
            prev.quantity += t.quantity;
        } else { // t.side === "buy"
            prev.quantity -= t.quantity;
        }

        if (prev.quantity > 0) {
            positions.set(t.ticker, prev);
        } else {
            positions.delete(t.ticker);
        }
    }
    return positions;
}

function getTrade(r: any): Trade {
    const side = r["Entrada/Saída"] == "Credito" ? "buy" : "sell";
    const ticker = r["Produto"].split(" - ")[0].trim();
    const quantity = Number(r["Quantidade"]);
    const unitPrice = parseFloat(
        String(r["Preço unitário"])
            .replace(/[^\d,.-]/g, "") // remove "R$"
            .replace(",", ".")
    );
    return {ticker, side, quantity, unitPrice};
}

function standardizeData(map: Map<string, StockPosition>): Data {
    return Object.fromEntries(
        [...map].map(([outerKey, record]) => [outerKey, standardizeRecord(record)])
    );
}

function standardizeRecord(record: DataEntry): DataEntry {
    const newRecord: DataEntry = {};
    for (const [k, v] of Object.entries(record)) {
        let newKey = "b3_position." + camelToSnake(k);
        newRecord[newKey] = v;
    }
    return newRecord;
}

function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => "_" + letter.toLowerCase());
}
