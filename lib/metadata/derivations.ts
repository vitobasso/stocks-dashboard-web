import {ChartData, DataValue} from "@/lib/data";
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
    priceVariation: {
        function: (args) => calcChangePct(Number(args[0]), Number(args[1])),
        arguments: ["b3_position.average_price", "yahoo_quote.latest"],
    },
    cumulativeReturn: {
        function: (args) => {
            const investedValue = Number(args[0]) * Number(args[1])
            const currentValuePlusDividends = Number(args[0]) * Number(args[2]) + Number(args[3])
            return calcChangePct(investedValue, currentValuePlusDividends)
        },
        arguments: ["b3_position.quantity", "b3_position.average_price", "yahoo_quote.latest", "b3_position.total_dividends"],
    },
    chart1mo: {
        function: (args) => calc1moChart(args[0] as ChartData, Number(args[1])),
        arguments: ["yahoo_chart.1mo", "yahoo_quote.latest"],
    },
}

export const derivations: Rec<Derivations> = {
    "stock_br": {
        "derived.b3_position.current_value": common.currentValue,
        "derived.b3_position.total_value": common.currentValuePlusDividends,
        "derived.b3_position.invested_value": common.investedValue,
        "derived.b3_position.price_variation": common.priceVariation,
        "derived.b3_position.cumulative_return": common.cumulativeReturn,
        "derived.yahoo_chart.1mo": common.chart1mo,
        "derived.forecast.min_pct": {
            function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
            arguments: ["yahoo_target.min", "yahoo_quote.latest"],
        },
        "derived.forecast.avg_pct": {
            function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
            arguments: ["yahoo_target.avg", "yahoo_quote.latest"],
        },
        "derived.forecast.max_pct": {
            function: (args) => calcChangePct(Number(args[1]), Number(args[0])),
            arguments: ["yahoo_target.max", "yahoo_quote.latest"],
        },
        "derived.statusinvest.ey": {
            function: (args) => Math.round(100 / Number(args[0])),
            arguments: ["statusinvest.ev_ebit"],
        },
        "derived.statusinvest.intrinsic_value": {
            function: (args) => Math.sqrt(22.5 * Number(args[0]) * Number(args[1])),
            arguments: ["statusinvest.lpa", "statusinvest.vpa"],
        },
    },
    "reit_br": {
        "derived.b3_position.current_value": common.currentValue,
        "derived.b3_position.total_value": common.currentValuePlusDividends,
        "derived.b3_position.invested_value": common.investedValue,
        "derived.b3_position.price_variation": common.priceVariation,
        "derived.b3_position.cumulative_return": common.cumulativeReturn,
        "derived.yahoo_chart.1mo": common.chart1mo,
    },
}

function calcChangePct(start: number, end: number): number | undefined {
    const result = (end - start) / start * 100;
    if (isFinite(result)) return result;
}

function calc1moChart(staleChart: ChartData, latestQuote: number): ChartData | undefined {
    if (!staleChart?.series?.length) return undefined;
    if (staleChart.series.length < 3) return staleChart;

    // undo variation calculation to recover the "startingValue" which was avg of 3 values, one of which is not contained in series
    const lastThree = staleChart.series.slice(-3);
    const avgLastThree = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
    const startingValue = avgLastThree / (staleChart.variation + 1)

    return {
        series: [...staleChart.series, latestQuote],
        variation: (latestQuote - startingValue) / startingValue,
    };
}

export const schema: Rec<string[]> = mapValues(derivations, (d) => Object.keys(d))