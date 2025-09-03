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
    "b3_position": {short: "B3, Posição", long: "Posição importada"},
    "b3_position.quantity": {short: "Qtd", long: "Quantidade"},
    "b3_position.average_price": {short: "PMed", long: "Preço Médio"},

    // derived from other keys
    "derived.b3_position.total_price": {short: "Total", long: "Valor Total"},
    "derived.b3_position.rendimento": {short: "Rend", long: "Rendimento em %"},
    "derived.forecast.min_pct": {short: "Min", long: "Previsão Mínima em %"},
    "derived.forecast.avg_pct": {short: "Méd", long: "Previsão Média em %"},
    "derived.forecast.max_pct": {short: "Máx", long: "Previsão Máxima em %"},
    "derived.statusinvest.liqmd_millions": {short: "LMD", long: "Liquidez Média Diária (Milhões)"},
    "derived.statusinvest.ey": {short: "EY", long: "Earning Yield (EBIT/EV)"},
}

const prefixLabels: Record<string, MetadataSource> = {

    // from a source other than scraper
    "yahoo_quote": {label: "Yahoo Finance API, tempo real", url: "https://github.com/gadicc/yahoo-finance2"},

    // derived from other keys
    "derived.b3_position": {label: "Posição Calculada", url: "Posição calculada com a cotação atual"},
    "derived.forecast": {label: "Yahoo Finance %", url: "Yahoo Finance e cotação atual"},
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