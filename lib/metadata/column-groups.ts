import {getPrefix} from "@/lib/data";
import {indexByFields} from "@/lib/utils/collections";

// associates key prefixes to groups
export const columnGroups: Record<string, string[]> = {
    "Perfil": ["ticker", "*cadastral", "*financeiro"],
    "Posição": ["b3_position"],
    "Preço": ["quotes", "yahoo_chart", "*rentabilidade"],
    "Fundamentos": ["*fundamentos", "statusinvest"],
    "Score": ["simplywall"],
    "Recomendação": ["*rating", "yahoo_recommendations"],
    "Previsão": ["*forecast"],
}

export function columnGroupPerKey(keys: string[]): Map<string, string> {
    let patternsToGroups = indexByFields(columnGroups);
    const result: Map<string, string> = new Map();
    for (const key of keys) {
        const prefix = getPrefix(key);
        let group = patternsToGroups.get(key) || patternsToGroups.get(prefix) || matchWildcard(prefix, patternsToGroups);
        if (group) result.set(key, group);
    }
    return result;
}

export function columnGroupPerPrefix(prefixes: string[]): Map<string, string> {
    let patternsToGroups = indexByFields(columnGroups);
    const result: Map<string, string> = new Map();
    for (const prefix of prefixes) {
        let group = patternsToGroups.get(prefix) || matchWildcard(prefix, patternsToGroups);
        if (group) result.set(prefix, group);
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
