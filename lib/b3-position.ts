import {Data, DataEntry} from "@/lib/data";

type Event = {
    ticker: string;
    direction: "credit" | "debit";
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

export function extractData(rows: Record<string, unknown>[]): Data {
    const events: Event[] = rows.filter(isCalculationEvent).map(getEvent).reverse();
    const positions: Map<string, StockPosition> = calculatePositions(events);
    return standardizeData(positions);
}

function calculatePositions(events: Event[]): Map<string, StockPosition> {
    const positions = new Map<string, StockPosition>();
    for (const t of events) {
        const prev = positions.get(t.ticker) || {quantity: 0, averagePrice: 0};
        if (t.direction === "credit") {
            if (t.unitPrice > 0) {
                // normal buy/sell
                const totalPrice = prev.averagePrice * prev.quantity + t.quantity * t.unitPrice;
                const totalQuantity = prev.quantity + t.quantity;
                prev.averagePrice = totalPrice / totalQuantity;
                prev.quantity += t.quantity;
            } else {
                // split or bonus
                prev.averagePrice = prev.averagePrice * (prev.quantity / (prev.quantity + t.quantity));
                prev.quantity += t.quantity;
            }
        } else { // debit
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

function isCalculationEvent(r: Record<string, unknown>): boolean {
    /**
     "Transferência - Liquidação"           - credit or debit from regular buy and sell
     "Desdobro"                             - credit from split
     "Bonificação em Ativos""               - credit from bonus and
     "Fração em Ativos                      - automatic debit of exceeding fraction from bonus
     "Direitos de Subscrição - Exercido"    - credit from subscription exercise (comes with ticker12 for corresponding ticker11)
     TODO "Direito Sobras de Subscrição - Exercido" ?
     TODO "Grupamento" ?
     */
    const filteredTypes = ["Transferência - Liquidação", "Desdobro", "Bonificação em Ativos",
        "Fração em Ativos", "Direitos de Subscrição - Exercido"];
    return filteredTypes.includes(String(r["Movimentação"]));
}

function getEvent(r: Record<string, unknown>): Event {
    const direction = String(r["Entrada/Saída"]) == "Credito" ? "credit" : "debit";
    const ticker = String(r["Produto"]).split(" - ")[0].trim()
        .replace(/12$/, "11");
    const quantity = Number(r["Quantidade"]);
    const unitPrice = parseFloat(
        String(r["Preço unitário"])
            .replace(/[^\d,.-]/g, "") // remove "R$"
            .replace(",", ".")
    );
    return {ticker, direction, quantity, unitPrice};
}

function standardizeData(map: Map<string, StockPosition>): Data {
    return Object.fromEntries(
        [...map].map(([outerKey, record]) => [outerKey, standardizeRecord(record)])
    );
}

function standardizeRecord(record: DataEntry): DataEntry {
    const newRecord: DataEntry = {};
    for (const [k, v] of Object.entries(record)) {
        const newKey = "b3_position." + camelToSnake(k);
        newRecord[newKey] = v;
    }
    return newRecord;
}

function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => "_" + letter.toLowerCase());
}
