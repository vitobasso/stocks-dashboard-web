export const bgColor = "#F0EEE5";
const red = "#D23D2D";
const green = "#428554";

export type Colors = Record<string, ColorRule>;
export type ColorRule = { domain: number[], colors: string[] }

export const colors: Colors = {
    "yahoo_chart.1mo": {domain: [-20, -5, 10, 20], colors: [red, bgColor, bgColor, green]},
    "yahoo_chart.1y": {domain: [-20, 8.8, 18.8, 45], colors: [red, bgColor, bgColor, green]}, //selic anual media: 13.84
    "yahoo_chart.5y": {domain: [0, 70, 115, 150], colors: [red, bgColor, bgColor, green]}, //selic acc 5 anos: 92.4

    "statusinvest.p_l": {domain: [-1000, 0, 12, 20], colors: [red, bgColor, bgColor, red]},
    "statusinvest.p_vp": {domain: [2, 5], colors: [bgColor, red]},
    "statusinvest.ey": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.roe": {domain: [2, 15], colors: [red, bgColor]},
    "statusinvest.roic": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.marg_liquida": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.div_liq_patri": {domain: [1, 2], colors: [bgColor, red]},
    "statusinvest.liq_corrente": {domain: [0.5, 1], colors: [red, bgColor]},
    "statusinvest.cagr_lucros_5_anos": {domain: [0, 8, 15, 50], colors: [red, bgColor, bgColor, green]},
    "statusinvest.dy": {domain: [7, 20], colors: [bgColor, green]},

    "simplywall.value": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.future": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.past": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.health": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.dividend": {domain: [3, 6], colors: [bgColor, green]},

    "yahoo_recommendations.strongBuy": {domain: [1, 10], colors: [bgColor, green]},
    "yahoo_recommendations.buy": {domain: [2, 20], colors: [bgColor, green]},
    "yahoo_recommendations.hold": {domain: [4, 15], colors: [bgColor, red]},
    "yahoo_recommendations.sell": {domain: [0, 4], colors: [bgColor, red]},
    "yahoo_recommendations.strongSell": {domain: [0, 2], colors: [bgColor, red]},

    "statusinvest.liqmd_millions": {domain: [4, 6], colors: [red, bgColor]},
    "derived_forecast.min_pct": {domain: [-20, 0, 10, 30], colors: [red, bgColor, bgColor, green]},
    "derived_forecast.avg_pct": {domain: [-5, 5, 20, 80], colors: [red, bgColor, bgColor, green]},
    "derived_forecast.max_pct": {domain: [10, 25, 60, 100], colors: [red, bgColor, bgColor, green]},
}