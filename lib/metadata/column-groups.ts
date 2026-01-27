import {getPrefix} from "@/lib/data";
import {indexByFields} from "@/lib/utils/collections";

// associates key prefixes to groups
const columnGroups: Record<string, string[]> = {
    "Perfil": ["ticker", "*cadastral", "*financeiro", "*listagem"],
    "Posição": ["*b3_position"],
    "Cotação": ["yahoo_quote", "*yahoo_chart", "*rentabilidade"],
    "Fundamentos": ["*fundamentos", "*statusinvest", "*fundamentus"],
    "Recomendação": ["*rating", "yahoo_recom"],
    "Previsão": ["*forecast", "yahoo_target"],
}
const othersGroup = "Outros"
export const allGroupNames = [...Object.keys(columnGroups), othersGroup]

export function columnGroupPerKey(keys: string[]): Map<string, string> {
    const patternsToGroups = indexByFields(columnGroups);
    const result: Map<string, string> = new Map();
    for (const key of keys) {
        const prefix = getPrefix(key);
        const group = patternsToGroups.get(key) || patternsToGroups.get(prefix) || matchWildcard(prefix, patternsToGroups);
        result.set(key, group ? group : othersGroup);
    }
    return result;
}

export function columnGroupPerPrefix(prefixes: string[]): Map<string, string> {
    const patternsToGroups = indexByFields(columnGroups);
    const result: Map<string, string> = new Map();
    for (const prefix of prefixes) {
        const group = patternsToGroups.get(prefix) || matchWildcard(prefix, patternsToGroups);
        result.set(prefix, group ? group : othersGroup);
    }
    return result;
}

function matchWildcard(keyPrefix: string, patternsToGroups: Map<string, string>): string | undefined {
    for (const [k, v] of patternsToGroups) {
        if (k.startsWith("*")) {
            const pattern = k.slice(1);
            if (keyPrefix.endsWith(pattern)) {
                return v;
            }
        }
    }
}
