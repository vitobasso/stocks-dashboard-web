type Derivation = { function: (...args: any[]) => any, arguments: string[] };
export type Derivations = Record<string, Derivation>;

export const derivations: Derivations = {
    "derived.b3_position.total_price": {
        function: (args) => args[1] * args[0],
        arguments: ["b3_position.quantity", "quotes.latest"],
    },
    "derived.forecast.min_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo.forecast.min", "quotes.latest"],
    },
    "derived.forecast.avg_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo.forecast.avg", "quotes.latest"],
    },
    "derived.forecast.max_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo.forecast.max", "quotes.latest"],
    },
    "derived.statusinvest.liqmd_millions": {
        function: (args) => args[0] / 1000000,
        arguments: ["statusinvest.liquidez_media_diaria"],
    },
    "derived.statusinvest.ey": {
        function: (args) => Math.round(100 / args[0]),
        arguments: ["statusinvest.ev_ebit"],
    },
}

function calcChangePct(start: number, end: number) {
    let result = Math.floor((end - start) / start * 100);
    if (!isNaN(result)) return result;
}

export const schema: string[] = Object.keys(derivations)