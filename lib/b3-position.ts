import {Data, DataEntry} from "@/lib/data";

type Event = {
    ticker: string;
    type: "credit" | "debit" | "update";
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
    const events: Event[] = rows.filter(isIncluded).map(getEvent).reverse();
    const positions: Map<string, StockPosition> = calculatePositions(events);
    return standardizeData(positions);
}

function calculatePositions(events: Event[]): Map<string, StockPosition> {
    const positions = new Map<string, StockPosition>();
    for (const t of events) {
        const prev = positions.get(t.ticker) || {quantity: 0, averagePrice: 0};
        switch (t.type) {
            case "credit":
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
                break;
            case "debit":
                prev.quantity -= t.quantity;
                break;
            case "update":
                if (!positions.has(t.ticker)) {
                    // renamed ticker being populated with total quantity from old name
                    prev.quantity = t.quantity;
                    const oldTicker = oldName[t.ticker];
                    const oldAvgPrice = oldTicker ? positions.get(oldTicker)?.averagePrice : undefined;
                    prev.averagePrice = oldAvgPrice ?? 0
                }
                break;
        }

        if (prev.quantity > 0) {
            positions.set(t.ticker, prev);
        } else {
            positions.delete(t.ticker);
        }
    }
    return positions;
}

function isIncluded(r: Record<string, unknown>): boolean {
    /**
     "Transferência - Liquidação"
     - credit or debit from regular buy and sell

     "Desdobro"
     - credit from split

     "Bonificação em Ativos"
     - credit from bonus

     "Fração em Ativos
     - debit of exceeding fraction from bonus

     "Direitos de Subscrição - Exercido"
     - credit from subscription exercise (comes with ticker12 for corresponding ticker11)

     "Atualização"
     - when a ticker is renamed this event comes with the total quantity from the old name. we credit to populate the
     new ticker name
     - after "Direitos de Subscrição - Exercido" this event comes with the same quantity. we ignore to avoid double
     credit

     TODO "Grupamento", "Recibo de Sobras de Subscrição" ?
     */
    const filteredTypes = ["Transferência - Liquidação", "Desdobro", "Bonificação em Ativos",
        "Fração em Ativos", "Direitos de Subscrição - Exercido", "Atualização"];
    return filteredTypes.includes(String(r["Movimentação"]));
}

function getEvent(r: Record<string, unknown>): Event {
    if (String(r["Movimentação"]) === "Direitos de Subscrição - Exercido") return getSubscriptionEvent(r)
    if (String(r["Movimentação"]) === "Atualização") return getUpdateEvent(r)
    else return getDefaultEvent(r)
}

function getDefaultEvent(r: Record<string, unknown>): Event {
    return {
        ticker: getTicker(r),
        type: String(r["Entrada/Saída"]) === "Credito" ? "credit" : "debit",
        quantity: Number(r["Quantidade"]),
        unitPrice: parsePrice(r["Preço unitário"])
    };
}

function getSubscriptionEvent(r: Record<string, unknown>): Event {
    return {
        ticker: getTicker(r).replace(/12$/, "11"),
        type: "credit",
        quantity: Number(r["Quantidade"]),
        unitPrice: parsePrice(r["Valor da Operação"]) / Number(r["Quantidade"]),
    };
}

function getUpdateEvent(r: Record<string, unknown>): Event {
    return {
        ticker: getTicker(r),
        type: "update",
        quantity: Number(r["Quantidade"]),
        unitPrice: 0
    };
}

function getTicker(r: Record<string, unknown>) {
    return String(r["Produto"]).split(" - ")[0].trim();
}

function parsePrice(raw: unknown): number {
    const normalized = String(raw)
        .replace(/[^\d,.-]/g, "") // remove "R$"
        .replace(",", ".");
    return parseFloat(normalized)
}

/**
 * Manually maintained history of known ticker renames.
 */
const oldName: Record<string, string> = {
    "PMLL11": "MALL11", // 23/07/2025
    "NATU3": "NTCO3",   // 02/07/2025
    "TOKY3": "MBLY3",   // 03/06/2025
    "MOTV3": "CCRO3",   // 02/05/2025
    "CTAX3": "ATMP3",   // 08/05/2025
    "FYTO11": "NCHB11", // 10/03/2025
    "VPPR11": "XPPR11", // 05/02/2025
    "FTCA11": "NCRA11", // ??/02/2025
    "REAG3": "GNJN3",   // 28/01/2025
    "ISAE4": "TRPL4",   // 19/11/2024
    "AURE3": "AESB3",   // 31/10/2024
    "GARE11": "GALG11", // 08/02/2024
    "TVRI11": "BBPO11", // 02/10/2023
    "CSUD3": "CARD3",   // 15/09/2022
    "AESB3": "TIET11",  // 29/03/2021

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
