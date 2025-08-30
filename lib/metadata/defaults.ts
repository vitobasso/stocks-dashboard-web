export type Header = { group: string, keys: string[] };

export const defaultColumns: Header[] = [
    {group: "Perfil", keys: ["ticker", "b3_listagem.setor"]},
    {group: "Posição", keys: ["derived.b3_position.total_price", "b3_position.average_price"]},
    {group: "Preço", keys: ["quotes.latest", "yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]},
    {group: "Fundamentos", keys: ["derived.statusinvest.liqmd_millions", "statusinvest.p_l", "statusinvest.p_vp",
            "derived.statusinvest.ey", "statusinvest.roe", "statusinvest.roic", "statusinvest.marg_liquida",
            "statusinvest.div_liq_patri", "statusinvest.liq_corrente", "statusinvest.cagr_lucros_5_anos",
            "statusinvest.dy"]
    },
    {group: "Score", keys: []},
    {group: "Recomendação", keys: ["strong_buy", "buy", "hold", "sell", "strong_sell"]
            .map(s => `yahoo_recommendations.${s}`)},
    {group: "Previsão", keys: ["min_pct", "avg_pct", "max_pct"].map(s => `derived.forecast.${s}`)},
];

export const defaultRows = [
    "VALE3",
    "ITUB4",
    "PETR4",
    "BBDC4",
]