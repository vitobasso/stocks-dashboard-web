import {DataValue} from "@/lib/data";
import {mapValues, Rec} from "@/lib/utils/records";

type Derivation = { function: (args: DataValue[]) => DataValue | undefined, arguments: string[] };
export type Derivations = Rec<Derivation>;

const common: Derivations = {
    currentValue: {
        function: (args) => Number(args[0]) * Number(args[1]),
        arguments: ["b3_position.quantity", "yahoo_quote.latest"],
    },
    currentValuePlusDividends: {
        function: (args) => Number(args[0]) * Number(args[1]) + Number(args[2]),
        arguments: ["b3_position.quantity", "yahoo_quote.latest", "b3_position.total_dividends"],
    },
    investedValue: {
        function: (args) => Number(args[0]) * Number(args[1]),
        arguments: ["b3_position.quantity", "b3_position.average_price"],
    },
    returnPct: {
        function: (args) => calcChangePct(Number(args[0]), Number(args[1])),
        arguments: ["b3_position.average_price", "yahoo_quote.latest"],
    },
    returnWithDividendsPct: {
        function: (args) => {
            const investedValue = Number(args[0]) * Number(args[1])
            const currentValuePlusDividends = Number(args[0]) * Number(args[2]) + Number(args[3])
            return calcChangePct(investedValue, currentValuePlusDividends)
        },
        arguments: ["b3_position.quantity", "b3_position.average_price", "yahoo_quote.latest", "b3_position.total_dividends"],
    },
}

export const derivations: Rec<Derivations> = {
    "stock_br": {
        "derived.b3_position.current_value": common.currentValue,
        "derived.b3_position.current_value_plus_dividends": common.currentValuePlusDividends,
        "derived.b3_position.invested_value": common.investedValue,
        "derived.b3_position.return": common.returnPct,
        "derived.b3_position.return_with_dividends": common.returnWithDividendsPct,
        "derived.forecast.min_pct": {
            function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
            arguments: ["yahoo.forecast.min", "yahoo_quote.latest"],
        },
        "derived.forecast.avg_pct": {
            function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
            arguments: ["yahoo.forecast.avg", "yahoo_quote.latest"],
        },
        "derived.forecast.max_pct": {
            function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
            arguments: ["yahoo.forecast.max", "yahoo_quote.latest"],
        },
        "derived.statusinvest.liqmd_millions": { //TODO make it part of normalization
            function: (args) => Number(args[0]) / 1000000,
            arguments: ["statusinvest.liquidez_media_diaria"],
        },
        "derived.statusinvest.ey": {
            function: (args) => Math.round(100 / Number(args[0])),
            arguments: ["statusinvest.ev_ebit"],
        },
    },
    "reit_br": {
        "derived.b3_position.current_value": common.currentValue,
        "derived.b3_position.invested_value": common.investedValue,
        "derived.b3_position.return": common.returnPct,
        "derived.b3_position.return_with_dividends": common.returnWithDividendsPct,
    },
}

function calcChangePct(start: number, end: number): number | undefined {
    const result = Math.floor((end - start) / start * 100);
    if (isFinite(result)) return result;
}

export const schema: Rec<string[]> = mapValues(derivations, (d) => Object.keys(d))