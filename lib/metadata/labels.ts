import {getPrefix, getSuffix} from "@/lib/data";
import {MetadataSource} from "@/lib/data";

export type Label = { short: string; long: string }
export type Labels = Record<string, Label>;

export function makeLabelGetter(metadataKeys: Record<string, Label>,
                                metadataPrefixes: Record<string, MetadataSource>): (path: string) => Label {
    return (path: string) => metadataKeys[path] ?? getPrefixLabel(path, metadataPrefixes) ?? generateLabel(path)
}

function getPrefixLabel(path: string, metadata: Record<string, MetadataSource>): Label | undefined {
    const source: MetadataSource = metadata[path] ?? metadata[getPrefix(path)] ?? getPrefixLabelByPrefix(path, metadata)
    return source && {short: source.label, long: source.url}
}

function getPrefixLabelByPrefix(path: string, metadata: Record<string, MetadataSource>): MetadataSource | undefined {
    const key = Object.keys(metadata).find((prefix) => path.startsWith(prefix))
    return key ? metadata[key] : undefined;
}

const labels: Labels = {
    "ticker": {short: "Ação", long: "Código da Ação"},

    // from a source other than scraper
    "quotes.latest": {short: "Hoje", long: "Cotação Hoje"},
    "b3_position.quantity": {short: "Qtd", long: "Quantidade"},
    "b3_position.average_price": {short: "PMed", long: "Preço Médio"},

    // derived from other keys
    "derived.b3_position": {short: "Posição (derivada)", long: "Posição importada e cotação atual"},
    "derived.b3_position.total_price": {short: "Total", long: "Valor Total na cotação atual"},
    "derived.b3_position.rendimento": {short: "Rend", long: "Rendimento em %"},
    "derived.forecast": {short: "Yahoo Finance %", long: "Yahoo Finance e cotação atual"},
    "derived.forecast.min_pct": {short: "Min", long: "Previsão Mínima em %"},
    "derived.forecast.avg_pct": {short: "Méd", long: "Previsão Média em %"},
    "derived.forecast.max_pct": {short: "Máx", long: "Previsão Máxima em %"},
    "derived.statusinvest.liqmd_millions": {short: "LiqMD", long: "Liquidez Média Diária (Milhões)"},
    "derived.statusinvest.ey": {short: "EY", long: "Earning Yield"},
}

function generateLabel(path: string): Label {
    return labels[path] ?? {
        short: titleize(getSuffix(path) ?? path),
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