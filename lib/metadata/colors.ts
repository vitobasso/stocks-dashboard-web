export const bgColor = "--background";
export const fgColor = "--foreground";
export const red = "--chart-1";
export const green = "--chart-2";

type ColorSpec = {
    colorRef: string // css var name
    alpha?: number // 0-1, to multiply to the colorRef's original alpha
}
type ColorRule =
    | {
    type: "number"
    domain: number[]
    colors: ColorSpec[]
}
    | {
    type: "string"
    domain: RegExp[]
    colors: ColorSpec[]
};
type Colors = Record<string, ColorRule>;

export const colors: Colors = {

    // common

    "yahoo.derived.chart.1mo": n([-20, -5, 10, 20], [red, bgColor, bgColor, green], 0.5),
    "yahoo.chart.1mo": n([-20, -5, 10, 20], [red, bgColor, bgColor, green], 0.5),
    "yahoo.chart.1y": n([-20, 8.8, 18.8, 45], [red, bgColor, bgColor, green], 0.25), //selic anual media: 13.84
    "yahoo.chart.5y": n([0, 70, 115, 150], [red, bgColor, bgColor, green], 0.125), //selic acc 5 anos: 92.4

    "b3.derived.position.price_variation": n([-60, 0, 40], [red, bgColor, green]),
    "b3.derived.position.cumulative_return": n([-50, 0, 50], [red, bgColor, green]),

    // stock_br

    "statusinvest.p_l": n([-1000, 0, 12, 20], [red, bgColor, bgColor, red]),
    "statusinvest.p_vp": n([2, 5], [bgColor, red]),
    "statusinvest.p_ebit": n([0, 8, 12, 25], [green, bgColor, bgColor, red]),
    "statusinvest.psr": n([0, 1, 3, 8], [green, bgColor, bgColor, red]),
    "statusinvest.p_cap_giro": n([0, 5, 10, 20], [green, bgColor, bgColor, red]),
    "statusinvest.p_at_cir_liq": n([0, 5, 10, 20], [green, bgColor, bgColor, red]),
    "statusinvest.p_ativos": n([0, 0.5, 1.5, 3], [green, bgColor, bgColor, red]),
    "statusinvest.peg_ratio": n([0, 1, 2, 4], [green, bgColor, bgColor, red]),
    "statusinvest.roe": n([2, 15], [red, bgColor]),
    "statusinvest.roic": n([0, 10], [red, bgColor]),
    "statusinvest.roa": n([0, 8, 15, 25], [red, bgColor, bgColor, green]),
    "statusinvest.ev_ebit": n([0, 6, 10, 20], [green, bgColor, bgColor, red]),
    "statusinvest.marg_liquida": n([0, 10], [red, bgColor]),
    "statusinvest.margem_bruta": n([0, 20], [red, bgColor]),
    "statusinvest.margem_ebit": n([0, 15], [red, bgColor]),
    "statusinvest.div_liq_patri": n([1, 2], [bgColor, red]),
    "statusinvest.divida_liquida_ebit": n([-1, 0.5, 2, 4], [green, bgColor, bgColor, red]),
    "statusinvest.liq_corrente": n([0.5, 1], [red, bgColor]),
    "statusinvest.giro_ativos": n([0, 0.5, 1, 2], [red, bgColor, bgColor, green]),
    "statusinvest.cagr_lucros_5_anos": n([0, 8, 15, 50], [red, bgColor, bgColor, green]),
    "statusinvest.cagr_receitas_5_anos": n([0, 5, 15, 40], [red, bgColor, bgColor, green]),
    "statusinvest.dy": n([7, 20], [bgColor, green]),

    "simplywall.score.value": n([-2, 2, 4, 8], [red, bgColor, bgColor, green]),
    "simplywall.score.future": n([-2, 2, 4, 8], [red, bgColor, bgColor, green]),
    "simplywall.score.past": n([-2, 2, 4, 8], [red, bgColor, bgColor, green]),
    "simplywall.score.health": n([-2, 2, 4, 8], [red, bgColor, bgColor, green]),
    "simplywall.score.dividend": n([3, 6], [bgColor, green]),

    "yahoo.recom.strong_buy": n([1, 10], [bgColor, green]),
    "yahoo.recom.buy": n([2, 20], [bgColor, green]),
    "yahoo.recom.hold": n([4, 15], [bgColor, red]),
    "yahoo.recom.sell": n([0, 4], [bgColor, red]),
    "yahoo.recom.strong_sell": n([0, 2], [bgColor, red]),

    "investidor10.fundamentos.p_l": n([-1000, 0, 12, 20], [red, bgColor, bgColor, red]),
    "investidor10.fundamentos.p_vp": n([2, 5], [bgColor, red]),
    "investidor10.fundamentos.p_ebit": n([0, 8, 12, 25], [green, bgColor, bgColor, red]),
    "investidor10.fundamentos.p_ativo": n([0, 0.5, 1.5, 3], [green, bgColor, bgColor, red]),
    "investidor10.fundamentos.p_cap_giro": n([0, 5, 10, 20], [green, bgColor, bgColor, red]),
    "investidor10.fundamentos.p_ativo_circ_liq": n([0, 5, 10, 20], [green, bgColor, bgColor, red]),
    "investidor10.fundamentos.dividend_yield_bbdc4": n([7, 20], [bgColor, green]),
    "investidor10.fundamentos.payout": n([75, 120], [bgColor, red]),
    "investidor10.fundamentos.margem_liquida": n([0, 10], [red, bgColor]),
    "investidor10.fundamentos.margem_bruta": n([0, 20], [red, bgColor]),
    "investidor10.fundamentos.margem_ebit": n([0, 15], [red, bgColor]),
    "investidor10.fundamentos.ev_ebit": n([0, 6, 10, 20], [green, bgColor, bgColor, red]),
    "investidor10.fundamentos.roe": n([2, 15], [red, bgColor]),
    "investidor10.fundamentos.roic": n([0, 10], [red, bgColor]),
    "investidor10.fundamentos.roa": n([0, 8, 15, 25], [red, bgColor, bgColor, green]),
    "investidor10.fundamentos.giro_ativos": n([0, 0.5, 1, 2], [red, bgColor, bgColor, green]),
    "investidor10.fundamentos.patrimonio_ativos": n([0, 0.3, 0.6, 0.9], [red, bgColor, bgColor, green]),
    "investidor10.fundamentos.passivos_ativos": n([0.6, 1], [bgColor, red]),
    "investidor10.fundamentos.liquidez_corrente": n([0.5, 1], [red, bgColor]),
    "investidor10.fundamentos.cagr_receitas_5_anos": n([0, 5, 15, 40], [red, bgColor, bgColor, green]),
    "investidor10.fundamentos.cagr_lucros_5_anos": n([0, 8, 15, 50], [red, bgColor, bgColor, green]),
    "investidor10.financeiro.patrimonio_liquido": n([0.5, 1.2], [red, bgColor]),
    "investidor10.financeiro.free_float": n([20, 40], [red, bgColor]),
    "investidor10.financeiro.tag_along": n([80, 100], [red, bgColor]),
    "investidor10.financeiro.segmento_de_listagem": s([/tradicional/i, /nivel 1/i, /nivel 2/i, /.*/],
        [{colorRef: red, alpha: 0.5}, {colorRef: red, alpha: 0.25}, {colorRef: red, alpha: 0.125}, {colorRef: bgColor}, ]),
    "b3.listagem.segmento_de_negociacao":s([/basico.*/i, /nivel 1/i, /nivel 2/i, /.*/],
        [{colorRef: red, alpha: 0.5}, {colorRef: red, alpha: 0.25}, {colorRef: red, alpha: 0.125}, {colorRef: bgColor}, ]),

    "statusinvest.derived.ey": n([0, 10], [red, bgColor]),
    "statusinvest.liquidez_media_diaria": n([4, 6], [red, bgColor]),
    "yahoo.derived.forecast.min_pct": n([-20, 0, 10, 30], [red, bgColor, bgColor, green], 0.25),
    "yahoo.derived.forecast.avg_pct": n([-5, 5, 20, 80], [red, bgColor, bgColor, green], 0.25),
    "yahoo.derived.forecast.max_pct": n([10, 25, 60, 100], [red, bgColor, bgColor, green], 0.25),
    "investidor10.derived.cadastral.anos_desde_estreia_na_bolsa": n([0, 5], [red, bgColor], 0.25),
    "investidor10.derived.cadastral.anos_desde_fundacao": n([0, 10], [red, bgColor], 0.25),

    // reit_br
    "fundamentus.ffo_yield":        n([0, 5, 10, 20], [red, bgColor, bgColor, green]),
    "fundamentus.dividend_yield":   n([0, 5, 8, 15], [red, bgColor, bgColor, green]),
    "fundamentus.p_vp":             n([0.95, 1.1], [bgColor, red]),
    "fundamentus.liquidez":         n([0, 0.7], [red, bgColor]),
    "fundamentus.qtd_de_imoveis":   n([0, 4], [red, bgColor]),
    "fundamentus.cap_rate":         n([0, 4, 7, 12], [red, bgColor, bgColor, green]),
    "fundamentus.vacancia_media":   n([5, 10], [bgColor, red]),

}

function n(domain: number[], colorRefs: string[], alpha?: number): ColorRule {
    const colorSpecs: ColorSpec[] = colorRefs.map(c => ({colorRef: c, alpha}));
    return {type: "number", domain, colors: colorSpecs}
}

function s(domain: RegExp[], colorsSpecs: ColorSpec[]): ColorRule {
    return {type: "string", domain, colors: colorsSpecs}
}