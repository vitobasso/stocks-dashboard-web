import {DataValue} from "@/lib/data";

type Derivation = { function: (args: DataValue[]) => DataValue | undefined, arguments: string[] };
export type Derivations = Record<string, Derivation>;

export const derivations: Derivations = {
    "derived.b3_position.total_price": {
        function: (args) => Number(args[0]) * Number(args[1]),
        arguments: ["b3_position.quantity", "quotes.latest"],
    },
    "derived.b3_position.rendimento": {
        function: (args) => calcChangePct(Number(args[0]), Number(args[1])),
        arguments: ["b3_position.average_price", "quotes.latest"],
    },
    "derived.forecast.min_pct": {
        function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
        arguments: ["yahoo.forecast.min", "quotes.latest"],
    },
    "derived.forecast.avg_pct": {
        function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
        arguments: ["yahoo.forecast.avg", "quotes.latest"],
    },
    "derived.forecast.max_pct": {
        function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
        arguments: ["yahoo.forecast.max", "quotes.latest"],
    },
    "derived.statusinvest.liqmd_millions": {
        function: (args) => Number(args[0]) / 1000000,
        arguments: ["statusinvest.liquidez_media_diaria"],
    },
    "derived.statusinvest.ey": {
        function: (args) => Math.round(100 / Number(args[0])),
        arguments: ["statusinvest.ev_ebit"],
    },
}

function calcChangePct(start: number, end: number): number | undefined {
    const result = Math.floor((end - start) / start * 100);
    if (isFinite(result)) return result;
}

export const schema: string[] = Object.keys(derivations)