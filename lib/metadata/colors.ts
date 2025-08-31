export const bgColor = "--background";
export const red = "--chart-1";
export const green = "--chart-2";

export type Colors = Record<string, ColorRule>;
export type ColorRule = { domain: number[], colors: string[] }

export const colors: Colors = {
    "yahoo_chart.1mo": {domain: [-20, -5, 10, 20], colors: [red, bgColor, bgColor, green]},
    "yahoo_chart.1y": {domain: [-20, 8.8, 18.8, 45], colors: [red, bgColor, bgColor, green]}, //selic anual media: 13.84
    "yahoo_chart.5y": {domain: [0, 70, 115, 150], colors: [red, bgColor, bgColor, green]}, //selic acc 5 anos: 92.4

    "statusinvest.p_l": {domain: [-1000, 0, 12, 20], colors: [red, bgColor, bgColor, red]},
    "statusinvest.p_vp": {domain: [2, 5], colors: [bgColor, red]},
    "statusinvest.p_ebit": {domain: [0, 8, 12, 25], colors: [green, bgColor, bgColor, red]},
    "statusinvest.psr": {domain: [0, 1, 3, 8], colors: [green, bgColor, bgColor, red]},
    "statusinvest.p_cap_giro": {domain: [0, 5, 10, 20], colors: [green, bgColor, bgColor, red]},
    "statusinvest.p_at_cir_liq": {domain: [0, 5, 10, 20], colors: [green, bgColor, bgColor, red]},
    "statusinvest.p_ativos": {domain: [0, 0.5, 1.5, 3], colors: [green, bgColor, bgColor, red]},
    "statusinvest.peg_ratio": {domain: [0, 1, 2, 4], colors: [green, bgColor, bgColor, red]},
    "statusinvest.roe": {domain: [2, 15], colors: [red, bgColor]},
    "statusinvest.roic": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.roa": {domain: [0, 8, 15, 25], colors: [red, bgColor, bgColor, green]},
    "statusinvest.ev_ebit": {domain: [0, 6, 10, 20], colors: [green, bgColor, bgColor, red]},
    "statusinvest.marg_liquida": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.margem_bruta": {domain: [0, 20], colors: [red, bgColor]},
    "statusinvest.margem_ebit": {domain: [0, 15], colors: [red, bgColor]},
    "statusinvest.div_liq_patri": {domain: [1, 2], colors: [bgColor, red]},
    "statusinvest.divida_liquida_ebit": {domain: [-1, 0.5, 2, 4], colors: [green, bgColor, bgColor, red]},
    "statusinvest.liq_corrente": {domain: [0.5, 1], colors: [red, bgColor]},
    "statusinvest.giro_ativos": {domain: [0, 0.5, 1, 2], colors: [red, bgColor, bgColor, green]},
    "statusinvest.cagr_lucros_5_anos": {domain: [0, 8, 15, 50], colors: [red, bgColor, bgColor, green]},
    "statusinvest.cagr_receitas_5_anos": {domain: [0, 5, 15, 40], colors: [red, bgColor, bgColor, green]},
    "statusinvest.dy": {domain: [7, 20], colors: [bgColor, green]},

    "simplywall.value": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.future": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.past": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.health": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywall.dividend": {domain: [3, 6], colors: [bgColor, green]},

    "yahoo_recommendations.strong_buy": {domain: [1, 10], colors: [bgColor, green]},
    "yahoo_recommendations.buy": {domain: [2, 20], colors: [bgColor, green]},
    "yahoo_recommendations.hold": {domain: [4, 15], colors: [bgColor, red]},
    "yahoo_recommendations.sell": {domain: [0, 4], colors: [bgColor, red]},
    "yahoo_recommendations.strong_sell": {domain: [0, 2], colors: [bgColor, red]},

    // Investidor10 fundamentals (mirror StatusInvest where applicable)
    "investidor10.fundamentos.p_l": {domain: [-1000, 0, 12, 20], colors: [red, bgColor, bgColor, red]},
    "investidor10.fundamentos.p_vp": {domain: [2, 5], colors: [bgColor, red]},
    "investidor10.fundamentos.p_ebit": {domain: [0, 8, 12, 25], colors: [green, bgColor, bgColor, red]},
    "investidor10.fundamentos.p_ativo": {domain: [0, 0.5, 1.5, 3], colors: [green, bgColor, bgColor, red]},
    "investidor10.fundamentos.p_cap_giro": {domain: [0, 5, 10, 20], colors: [green, bgColor, bgColor, red]},
    "investidor10.fundamentos.p_ativo_circ_liq": {domain: [0, 5, 10, 20], colors: [green, bgColor, bgColor, red]},
    "investidor10.fundamentos.dividend_yield_bbdc4": {domain: [7, 20], colors: [bgColor, green]},
    "investidor10.fundamentos.payout": {domain: [75, 120], colors: [bgColor, red]},
    "investidor10.fundamentos.margem_liquida": {domain: [0, 10], colors: [red, bgColor]},
    "investidor10.fundamentos.margem_bruta": {domain: [0, 20], colors: [red, bgColor]},
    "investidor10.fundamentos.margem_ebit": {domain: [0, 15], colors: [red, bgColor]},
    "investidor10.fundamentos.ev_ebit": {domain: [0, 6, 10, 20], colors: [green, bgColor, bgColor, red]},
    "investidor10.fundamentos.roe": {domain: [2, 15], colors: [red, bgColor]},
    "investidor10.fundamentos.roic": {domain: [0, 10], colors: [red, bgColor]},
    "investidor10.fundamentos.roa": {domain: [0, 8, 15, 25], colors: [red, bgColor, bgColor, green]},
    "investidor10.fundamentos.giro_ativos": {domain: [0, 0.5, 1, 2], colors: [red, bgColor, bgColor, green]},
    "investidor10.fundamentos.patrimonio_ativos": {domain: [0, 0.3, 0.6, 0.9], colors: [red, bgColor, bgColor, green]},
    "investidor10.fundamentos.passivos_ativos": {domain: [0.6, 1], colors: [bgColor, red]},
    "investidor10.fundamentos.liquidez_corrente": {domain: [0.5, 1], colors: [red, bgColor]},
    "investidor10.fundamentos.cagr_receitas_5_anos": {domain: [0, 5, 15, 40], colors: [red, bgColor, bgColor, green]},
    "investidor10.fundamentos.cagr_lucros_5_anos": {domain: [0, 8, 15, 50], colors: [red, bgColor, bgColor, green]},
    "investidor10.financeiro.free_float": {domain: [20, 40], colors: [red, bgColor]},
    "investidor10.financeiro.tag_along": {domain: [80, 100], colors: [red, bgColor]},

    "derived.b3_position.rendimento": {domain: [-50, 0, 50], colors: [red, bgColor, green]},
    "derived.statusinvest.ey": {domain: [0, 10], colors: [red, bgColor]},
    "derived.statusinvest.liqmd_millions": {domain: [4, 6], colors: [red, bgColor]},
    "derived.forecast.min_pct": {domain: [-20, 0, 10, 30], colors: [red, bgColor, bgColor, green]},
    "derived.forecast.avg_pct": {domain: [-5, 5, 20, 80], colors: [red, bgColor, bgColor, green]},
    "derived.forecast.max_pct": {domain: [10, 25, 60, 100], colors: [red, bgColor, bgColor, green]},

}