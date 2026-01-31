import type {ViewsAvailable, ViewSelection} from "@/lib/views/views";
import type {Rec} from "@/lib/utils/records";
import {defaultSelection, defaultViews} from "@/lib/views/default-views";
import {readJson, safeRemoveItem, setSchemaVersion, writeJson} from "@/lib/local-storage/shared";

type V0Rows = Rec<string[]>;
type V0Cols = Rec<{ group: string; keys: string[] }[]>;

const V0_KEYS = {
    rows: "rows",
    columns: "columns",
} as const;

const V1_KEYS = {
    viewsAvailable: "viewsAvailable",
    viewSelection: "viewSelection",
} as const;

function migrateViewsAvailable(rows: V0Rows, cols: V0Cols): Rec<ViewsAvailable> {
    const result: Rec<ViewsAvailable> = {...defaultViews};

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

function migrateSelection(viewsAvailable: Rec<ViewsAvailable>): ViewSelection {
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

type V1Result = {
    viewsAvailable: Rec<ViewsAvailable>;
    viewSelection: ViewSelection;
};

function loadV0AndMigrate(): V1Result | null {
    const legacyRows = readJson<V0Rows>(V0_KEYS.rows);
    const legacyCols = readJson<V0Cols>(V0_KEYS.columns);
    if (!legacyRows || !legacyCols) return null;

    const viewsAvailable = migrateViewsAvailable(legacyRows, legacyCols);
    const viewSelection = migrateSelection(viewsAvailable);
    return {viewsAvailable, viewSelection};
}

function persistV1(result: V1Result): void {
    writeJson(V1_KEYS.viewsAvailable, result.viewsAvailable);
    writeJson(V1_KEYS.viewSelection, result.viewSelection);
}

function cleanupV0Fields(): void {
    safeRemoveItem(V0_KEYS.rows);
    safeRemoveItem(V0_KEYS.columns);
}

export function migrateV0ToV1() {
    const result = loadV0AndMigrate();
    if (result) {
        persistV1(result);
        cleanupV0Fields();
    }
    setSchemaVersion(1)
}