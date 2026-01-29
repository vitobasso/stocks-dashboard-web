import type {ViewsAvailable, ViewSelection} from "@/lib/views/views";
import type {Rec} from "@/lib/utils/records";
import {defaultSelection, defaultViewsAvailable} from "@/lib/views/default-views";
import {readJson, safeRemoveItem} from "@/lib/local-storage/shared";

export type LegacyV0Rows = Rec<string[]>;
export type LegacyV0Cols = Rec<{ group: string; keys: string[] }[]>;

export const V0_KEYS = {
    rows: "rows",
    columns: "columns",
} as const;

export function migrateV0ToV1ViewsAvailable(rows: LegacyV0Rows, cols: LegacyV0Cols): Rec<ViewsAvailable> {
    const result: Rec<ViewsAvailable> = {...defaultViewsAvailable};

    for (const assetClass of Object.keys(rows)) {
        const rowItems = rows[assetClass] ?? [];
        const colGroups = cols[assetClass] ?? [];
        const colItems = colGroups.flatMap(g => g.keys ?? [])
            .filter(v => v != "ticker");

        result[assetClass] = {
            rowViews: [...result[assetClass].rowViews, {name: "Minhas Linhas", items: rowItems}],
            colViews: [...result[assetClass].colViews, {name: "Minhas Colunas", items: colItems}],
        };
    }

    return result;
}

export function migrateV0ToV1Selection(viewsAvailable: Rec<ViewsAvailable>): ViewSelection {
    const assetClasses = Object.keys(viewsAvailable);
    const assetClass = assetClasses.includes(defaultSelection.assetClass)
        ? defaultSelection.assetClass
        : (assetClasses[0] ?? defaultSelection.assetClass);

    const rowViewNames: Rec<string[]> = {};
    const colViewNames: Rec<string[]> = {};
    for (const ac of assetClasses) {
        rowViewNames[ac] = [viewsAvailable[ac].rowViews.at(-1)!.name];
        colViewNames[ac] = [viewsAvailable[ac].colViews.at(-1)!.name];
    }

    return {assetClass, rowViewNames, colViewNames};
}

export type V0MigrationResult = {
    viewsAvailable: Rec<ViewsAvailable>;
    viewSelection: ViewSelection;
};

export function migrateFromStorageV0(): V0MigrationResult | null {
    const legacyRows = readJson<LegacyV0Rows>(V0_KEYS.rows);
    const legacyCols = readJson<LegacyV0Cols>(V0_KEYS.columns);
    if (!legacyRows || !legacyCols) return null;

    const viewsAvailable = migrateV0ToV1ViewsAvailable(legacyRows, legacyCols);
    const viewSelection = migrateV0ToV1Selection(viewsAvailable);
    return {viewsAvailable, viewSelection};
}

export function cleanupStorageV0(): void {
    safeRemoveItem(V0_KEYS.rows);
    safeRemoveItem(V0_KEYS.columns);
}
