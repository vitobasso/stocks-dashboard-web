import {defaultSelection, defaultViews} from "@/lib/views/default-views";
import type {Data} from "@/lib/data";
import type {Theme} from "@/lib/theme";
import type {ViewsAvailable, ViewSelection} from "@/lib/views/views";
import type {Rec} from "@/lib/utils/records";
import {
    getSchemaVersion,
    isBrowser,
    readJson,
    safeGetItem,
    safeSetItem,
    VERSION_KEY,
    writeJson
} from "@/lib/local-storage/shared";
import {migrateV0ToV1} from "@/lib/local-storage/v0";
import {migrateV1ToV2} from "@/lib/local-storage/v1";

const CURRENT_VERSION = 2 as const;

const STORAGE_KEYS = {
    schemaVersion: VERSION_KEY,
    viewsAvailable: "viewsAvailable",
    viewSelection: "viewSelection",
    positions: "positions",
    theme: "theme",
} as const;


export function migrateIfNeeded(): void {
    if (!isBrowser()) return;
    const v = getSchemaVersion();
    const migrations = [
        migrateV0ToV1,
        migrateV1ToV2,
    ]
    for (let i = v; i < CURRENT_VERSION; i++) {
        migrations[i]();
    }
}

export function loadViewsAvailable(): Rec<ViewsAvailable> {
    return readJson<Rec<ViewsAvailable>>(STORAGE_KEYS.viewsAvailable) ?? defaultViews;
}

export function saveViewsAvailable(v: Rec<ViewsAvailable>): void {
    writeJson(STORAGE_KEYS.viewsAvailable, v);
}

export function loadViewSelection(): ViewSelection {
    return readJson<ViewSelection>(STORAGE_KEYS.viewSelection) ?? defaultSelection;
}

export function saveViewSelection(v: ViewSelection): void {
    writeJson(STORAGE_KEYS.viewSelection, v);
}

export function loadPositions(): Rec<Data> {
    return readJson<Rec<Data>>(STORAGE_KEYS.positions) ?? {};
}

export function savePositions(v: Rec<Data>): void {
    writeJson(STORAGE_KEYS.positions, v);
}

export function loadTheme(): Theme | null {
    const t = safeGetItem(STORAGE_KEYS.theme);
    return t === "dark" || t === "light" ? t : null;
}

export function saveTheme(v: Theme): void {
    safeSetItem(STORAGE_KEYS.theme, v);
}
