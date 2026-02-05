import {getPrefix, getSuffix, MetadataSource} from "@/lib/data";
import {Rec} from "@/lib/utils/records";

export type Label = { short: string; long: string }
export type GroupLabel = { title: string, description?: string}

export function makeLabeler(metaKeyLabels: Record<string, Label>,
                            metaSources: Record<string, MetadataSource>): (path: string) => Label {
    const keys = {...metaKeyLabels, ...addedKeyLabels}
    const metaPrefixLabels = getGroupLabels(metaSources)
    const groupLabels = {...metaPrefixLabels, ...addedPrefixLabels}
    return (path: string) => keys[path] ?? getPrefixLabel(path, groupLabels) ?? generateLabel(path)
}

function getPrefixLabel(path: string, groupLabels: Record<string, GroupLabel>): Label | undefined {
    const source: GroupLabel = groupLabels[path] ?? groupLabels[getPrefix(path)] ?? getPrefixLabelByPrefix(path, groupLabels)
    return source && {short: source.title, long: source.description ?? ""}
}

function getPrefixLabelByPrefix(path: string, groupLabels: Record<string, GroupLabel>): GroupLabel | undefined {
    const key = Object.keys(groupLabels).find((prefix) => path.startsWith(prefix))
    return key ? groupLabels[key] : undefined;
}

const addedKeyLabels: Rec<Label> = {
    "ticker": {short: "Ativo", long: "Código do Ativo"},

    // from a source other than scraper
    "yahoo.quote.latest": {short: "Hoje", long: "Cotação Hoje"},
    "b3.position.quantity": {short: "Qtd", long: "Quantidade de Cotas"},
    "b3.position.average_price": {short: "PMed", long: "Preço Médio"},
    "b3.position.total_dividends": {short: "DivAc", long: "Dividendos Acumulados"},

    // derived from other keys
    "b3.derived.position.invested_value": {short: "VInves", long: "Valor Investido (Qtd × Preço Médio)"},
    "b3.derived.position.current_value": {short: "VAtual", long: "Valor Atual da Posição (Qtd × Cotação Hoje)"},
    "b3.derived.position.total_value": {short: "Total", long: "Valor Total (Qtd × Cotação + Dividendos)"},
    "b3.derived.position.price_variation": {short: "Var", long: "Variação (Preço Médio → Cotação Hoje)"},
    "b3.derived.position.cumulative_return": {short: "Ret", long: "Retorno Acumulado (Valor Investido → Valor Total)"},
    "yahoo.derived.chart.1mo": {short: "1M", long: "Último Mês (+ Cotação Hoje)"},
    "statusinvest.derived.ey": {short: "EY", long: "Earning Yield (EBIT/EV)"},
    "statusinvest.derived.intrinsic_value": {short: "VI", long: "Valor Intrínseco (Fórmula de Graham)"},
    "yahoo.derived.forecast.min_pct": {short: "Min", long: "Projeção Mínima em %"},
    "yahoo.derived.forecast.avg_pct": {short: "Méd", long: "Projeção Média em %"},
    "yahoo.derived.forecast.max_pct": {short: "Máx", long: "Projeção Máxima em %"},
    "investidor10.derived.cadastral.anos_desde_estreia_na_bolsa": {short: "AnoB", long: "Anos Desde a Estréia na Bolsa"},
    "investidor10.derived.cadastral.anos_desde_fundacao": {short: "Anos", long: "Anos Desde a Fundação"},
}

const addedPrefixLabels: Record<string, GroupLabel> = {

    // from a source other than scraper
    "b3.position": { title: "Posição", description: "Importado manualmente de https://investidor.b3.com.br"},
    "yahoo.quote": { title: "Cotação" },

    // derived from other keys
    "b3.derived": { title: "Derivados" },
    "yahoo.derived": { title: "Derivados" },
    "statusinvest.derived": { title: "Derivados" },
    "investidor10.derived": { title: "Derivados" },
    "derived": { title: "Derivados", description: "Valores calculados a partir de mais de uma fonte" },
}

function getGroupLabels(sources: Rec<MetadataSource>): Rec<GroupLabel> {
    const labels: Rec<GroupLabel> = {}
    for (const [sourceKey, source] of Object.entries(sources)) {
        labels[sourceKey] = { title: source.label, description: source.home_url }
        if (source.groups) {
            for (const [groupKey, group] of Object.entries(source.groups)) {
                labels[`${sourceKey}.${groupKey}`] = { title: group.label }
            }
        }
    }
    return labels;
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