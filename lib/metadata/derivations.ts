type Derivation = { function: (...args: any[]) => any, arguments: string[] };
export type Derivations = Record<string, Derivation>;

export const derivations: Derivations = {
    "derived_position.total_price": {
        function: (args) => args[1] * args[0],
        arguments: ["b3_position.quantity", "quotes.latest"],
    },
    "derived_forecast.min_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo.forecast.min", "quotes.latest"],
    },
    "derived_forecast.avg_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo.forecast.avg", "quotes.latest"],
    },
    "derived_forecast.max_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo.forecast.max", "quotes.latest"],
    },
    "statusinvest.liqmd_millions": {
        function: (args) => args[0] / 1000000,
        arguments: ["statusinvest.liquidez_media_diaria"],
    },
    "statusinvest.ey": {
        function: (args) => Math.round(100 / args[0]),
        arguments: ["statusinvest.ev_ebit"],
    },
}

function calcChangePct(start: number, end: number) {
    let result = Math.floor((end - start) / start * 100);
    if (!isNaN(result)) return result;
}

export const schema: string[] = Object.keys(derivations)