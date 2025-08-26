export type Header = { group: string, keys: string[] };

export const defaultColumns: Header[] = [
    {group: "Perfil", keys: ["ticker", "investidor10.financeiro.segmento"]},
    {group: "Posição", keys: ["derived_position.total_price", "b3_position.average_price"]},
    {group: "Preço", keys: ["quotes.latest", "yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]},
    {group: "Fundamentos", keys: ["liqmd_millions", "p_l", "p_vp", "ey", "roe", "roic", "marg_liquida", "div_liq_patri", "liq_corrente",
            "cagr_lucros_5_anos", "dy"].map(s => `statusinvest.${s}`)
    },
    {group: "Recomendação", keys: ["strong_buy", "buy", "hold", "sell", "strong_sell"].map(s => `yahoo_recommendations.${s}`)},
    {group: "Previsão", keys: ["min_pct", "avg_pct", "max_pct"].map(s => `derived_forecast.${s}`)},
];

export const defaultRows = [
    "VALE3",
    "ITUB4",
    "PETR4",
    "BBDC4",
]