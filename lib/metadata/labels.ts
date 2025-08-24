export type Label = { short: string; long?: string }
export type Labels = Record<string, Label>;

const labels: Labels = {
    "ticker": {short: "Ação"},

    "derived_position.total_price": {short: "Tota", long: "Preço Total"},
    "b3_position.quantity": {short: "Qtd", long: "Quantidade"},
    "b3_position.average_price": {short: "Med", long: "Preço Médio"},

    "quotes.latest": {short: "Hoje"},

    "yahoo_chart.1mo": {short: "1mo", long: "1 mês"},
    "yahoo_chart.1y": {short: "1y", long: "1 ano"},
    "yahoo_chart.5y": {short: "5y", long: "5 anos"},

    "statusinvest.liqmd_millions": {short: "LiqM", long: "Liquidez Média Diária (Milhões)"},
    "statusinvest.p_l": {short: "P/L", long: "Preço / Lucro"},
    "statusinvest.p_vp": {short: "P/VP", long: "Preço / Valor Patrimonial"},
    "statusinvest.ey": {short: "EY", long: "Earning Yield"},
    "statusinvest.roe": {short: "ROE", long: "Retorno / Patrimônio Líquido"},
    "statusinvest.roic": {short: "ROIC", long: "Retorno / Capital Investido"},
    "statusinvest.marg_liquida": {short: "Marg", long: "Margem Líquida"},
    "statusinvest.div_liq_patri": {short: "Dív", long: "Dívida Líquida / Patrimônio"},
    "statusinvest.liq_corrente": {short: "LCor", long: "Liquidez Corrente"},
    "statusinvest.cagr_lucros_5_anos": {short: "Lucro", long: "CAGR Lucros 5 Anos"},
    "statusinvest.dy": {short: "DY", long: "Dividend Yield"},

    "simplywall.value": {short: "Valu", long: "Value"},
    "simplywall.future": {short: "Futu", long: "Future"},
    "simplywall.past": {short: "Past"},
    "simplywall.health": {short: "Heal", long: "Health"},
    "simplywall.dividend": {short: "Divi", long: "Dividend"},

    "yahoo_recommendations.strongBuy": {short: "SBuy", long: "Strong Buy"},
    "yahoo_recommendations.buy": {short: "Buy"},
    "yahoo_recommendations.hold": {short: "Hold"},
    "yahoo_recommendations.sell": {short: "Sell"},
    "yahoo_recommendations.strongSell": {short: "SSell", long: "Strong Sell"},

    "derived_forecast.min_pct": {short: "Min"},
    "derived_forecast.avg_pct": {short: "Avg"},
    "derived_forecast.max_pct": {short: "Max"},
}

export function getLabel(path: string): Label {
    let basename = path?.split(".").pop()
    return labels[path] ?? {
        short: titleize(basename ?? path),
    };
}

function titleize(key: string) {
    // replace dots/underscores, split camelCase, capitalize words
    if (!key) return "";
    const spaced = key
        .replace(/\./g, ' ')
        .replace(/[_\-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced
        .split(/\s+/)
        .map(w => (w.length ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ')
        .trim();
}