export type Header = { group: string, keys: string[] };

export const defaultHeaders: Header[] = [
    {group: "", keys: ["ticker"]},
    {group: "Posição", keys: ["derived_position.total_price", "b3_position.average_price"]},
    {group: "Preço", keys: ["quotes.latest", "yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]},
    {group: "Fundamentos", keys: ["liqmd_millions", "p_l", "p_vp", "ey", "roe", "roic", "marg_liquida", "div_liq_patri", "liq_corrente",
            "cagr_lucros_5_anos", "dy"].map(s => `statusinvest.${s}`)
    },
    {group: "Score", keys: ["value", "future", "past", "health", "dividend"].map(s => `simplywallst.${s}`)},
    {group: "Recomendação", keys: ["strongBuy", "buy", "hold", "sell", "strongSell"].map(s => `yahoo_api_rating.${s}`)},
    {group: "Previsão", keys: ["min_pct", "avg_pct", "max_pct"].map(s => `derived_forecast.${s}`)},
];

export const defaultTickers = [
    "ABCB4",
    "BBAS3",
    "BBSE3",
    "CMIG4",
    "CPFE3",
    "CXSE3",
    "FESA4",
    "GGBR4",
    "GOAU4",
    "ISAE4",
    "ITSA4",
    "LEVE3",
    "NEOE3",
    "PETR4",
    "PRIO3",
    "RECV3",
    "RENT3",
    "ROMI3",
    "TAEE11",
    "UNIP6",
    "VALE3",
    "WEGE3",
]