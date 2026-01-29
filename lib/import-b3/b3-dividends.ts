import {Rec} from "@/lib/utils/records";

type Event = {
    ticker: string;
    amount: number;
}

export function extractDividends(rows: Rec<unknown>[], oldNames: Rec<string>): Map<string, number> {
    const events: Event[] = rows.filter(isDividendEvent).map(getEvent).reverse();
    const totalPerTicker = calculate(events);
    return mergeOldNames(totalPerTicker, oldNames);
}

function calculate(events: Event[]): Map<string, number> {
    const totalPerTicker = new Map<string, number>();
    for (const t of events) {
        const prev = totalPerTicker.get(t.ticker) || 0;
        totalPerTicker.set(t.ticker, prev + t.amount);
    }
    return totalPerTicker;
}

function isDividendEvent(r: Rec<unknown>): boolean {
    const filteredTypes = ["Dividendo", "Juros Sobre Capital Próprio", "Rendimento"];
    return filteredTypes.includes(String(r["Movimentação"]));
}

function getEvent(r: Rec<unknown>): Event {
    return {
        ticker: getTicker(r),
        amount: parsePrice(r["Valor da Operação"]),
    };
}

function getTicker(r: Rec<unknown>) {
    return String(r["Produto"]).split(" - ")[0].trim();
}

function parsePrice(raw: unknown): number {
    const normalized = String(raw)
        .replace(/[^\d,.-]/g, "") // remove "R$"
        .replace(",", ".");
    return parseFloat(normalized)
}

function mergeOldNames(totalPerTicker: Map<string, number>, oldNames: Rec<string>): Map<string, number> {
    for (const [newTicker, oldTicker] of Object.entries(oldNames)) {
        const oldValue = totalPerTicker.get(oldTicker);
        if (oldValue !== undefined) {
            const newValue = totalPerTicker.get(newTicker) || 0;
            totalPerTicker.set(newTicker, newValue + oldValue);
            totalPerTicker.delete(oldTicker);
        }
    }
    return totalPerTicker;
}
