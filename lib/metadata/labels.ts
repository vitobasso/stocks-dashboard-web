import {getPrefix, getSuffix} from "@/lib/data";
import {MetadataSource} from "@/lib/data";

export type Label = { short: string; long: string }
export type Labels = Record<string, Label>;

export function makeLabelGetter(metadataKeys: Record<string, Label>,
                                metadataPrefixes: Record<string, MetadataSource>): (path: string) => Label {
    const keys = {...metadataKeys, ...keyLabels}
    const prefixes = {...metadataPrefixes, ...prefixLabels}
    return (path: string) => keys[path] ?? getPrefixLabel(path, prefixes) ?? generateLabel(path)
}

function getPrefixLabel(path: string, metadata: Record<string, MetadataSource>): Label | undefined {
    const source: MetadataSource = metadata[path] ?? metadata[getPrefix(path)] ?? getPrefixLabelByPrefix(path, metadata)
    return source && {short: source.label, long: source.url}
}

function getPrefixLabelByPrefix(path: string, metadata: Record<string, MetadataSource>): MetadataSource | undefined {
    const key = Object.keys(metadata).find((prefix) => path.startsWith(prefix))
    return key ? metadata[key] : undefined;
}

const keyLabels: Labels = {
    "ticker": {short: "Ativo", long: "Código do Ativo"},

    // from a source other than scraper
    "yahoo_quote.latest": {short: "Hoje", long: "Cotação Hoje"},
    "b3_position": {short: "B3, Posição", long: "Valores importados pelo usuário"},
    "b3_position.quantity": {short: "Qtd", long: "Quantidade de Cotas"},
    "b3_position.average_price": {short: "PMed", long: "Preço Médio"},
    "b3_position.total_dividends": {short: "DivAc", long: "Dividendos Acumulados"},

    // derived from other keys
    "derived.b3_position.invested_value": {short: "VInves", long: "Valor Investido (Qtd × Preço Médio)"},
    "derived.b3_position.current_value": {short: "VAtual", long: "Valor Atual da Posição (Qtd × Cotação Hoje)"},
    "derived.b3_position.total_value": {short: "Total", long: "Valor Total (Qtd × Cotação + Dividendos)"},
    "derived.b3_position.price_variation": {short: "Var", long: "Variação (Preço Médio → Cotação Hoje)"},
    "derived.b3_position.cumulative_return": {short: "Ret", long: "Retorno Acumulado (Valor Investido → Valor Total)"},
    "yahoo_chart.1mo": {short: "1M", long: "Último Mês"},
    "yahoo_chart.1y": {short: "1A", long: "Último Ano"},
    "yahoo_chart.5y": {short: "5A", long: "Últimos 5 Anos"},
    "derived.yahoo_chart.1mo": {short: "1M", long: "Último Mês (+ Cotação Hoje)"},
    "derived.forecast.min_pct": {short: "Min", long: "Previsão Mínima em %"},
    "derived.forecast.avg_pct": {short: "Méd", long: "Previsão Média em %"},
    "derived.forecast.max_pct": {short: "Máx", long: "Previsão Máxima em %"},
    "statusinvest.liquidez_media_diaria": {short: "LMD", long: "Liquidez Média Diária (Milhões)"},
    "derived.statusinvest.ey": {short: "EY", long: "Earning Yield (EBIT/EV)"},
    "derived.statusinvest.intrinsic_value": {short: "VI", long: "Valor Intrínseco (Fórmula de Graham)"},
}

const prefixLabels: Record<string, MetadataSource> = {

    // from a source other than scraper
    "yahoo_quote": {label: "Yahoo Finance API, tempo real", url: "https://github.com/gadicc/yahoo-finance2"},

    // derived from other keys
    "derived.b3_position": {label: "Posição Calculada", url: "Valores calculados a partir dos dados importados da B3"},
    "derived.forecast": {label: "Yahoo Finance %", url: "Calculado a partir de Yahoo Finance e cotação atual"},
    "derived.yahoo_chart": {label: "Yahoo Finance API", url: "Calculado a partir de Yahoo Finance e cotação atual"},
    "derived.statusinvest": {label: "Statusinvest, Calculado", url: "Valores calculados após extração"},
}

function generateLabel(path: string): Label {
    const label = titleize(getSuffix(path) ?? path);
    return { short: label, long: label };
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