type Event = {
    ticker: string;
    amount: number;
}

export function extractDividends(rows: Record<string, unknown>[]): Map<string, number> {
    const events: Event[] = rows.filter(isDividendEvent).map(getEvent).reverse();
    return calculate(events);
}

function calculate(events: Event[]): Map<string, number> {
    const totalPerTicker = new Map<string, number>();
    for (const t of events) {
        const prev = totalPerTicker.get(t.ticker) || 0;
        totalPerTicker.set(t.ticker, prev + t.amount);
    }
    return totalPerTicker;
}

function isDividendEvent(r: Record<string, unknown>): boolean {
    const filteredTypes = ["Dividendo", "Juros Sobre Capital Próprio", "Rendimento"];
    return filteredTypes.includes(String(r["Movimentação"]));
}

function getEvent(r: Record<string, unknown>): Event {
    return {
        ticker: getTicker(r),
        amount: parsePrice(r["Valor da Operação"]),
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