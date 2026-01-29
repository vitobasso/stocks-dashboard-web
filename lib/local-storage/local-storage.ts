import {defaultSelection, defaultViewsAvailable} from "@/lib/metadata/defaults";
import type {Data} from "@/lib/data";
import type {Theme} from "@/lib/theme";
import type {ViewsAvailable, ViewSelection} from "@/lib/views";
import type {Rec} from "@/lib/utils/records";
import {isBrowser, readJson, safeGetItem, safeSetItem, writeJson} from "@/lib/local-storage/shared";
import {cleanupStorageV0, migrateFromStorageV0} from "@/lib/local-storage/v0";

const STORAGE_VERSION = 1 as const;

const STORAGE_KEYS = {
    schemaVersion: "version",
    viewsAvailable: "viewsAvailable",
    viewSelection: "viewSelection",
    positions: "positions",
    theme: "theme",
} as const;

function getSchemaVersion(): number | null {
    const raw = safeGetItem(STORAGE_KEYS.schemaVersion);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

function setSchemaVersion(v: number): void {
    safeSetItem(STORAGE_KEYS.schemaVersion, String(v));
}

export function migrateIfNeeded(): void {
    if (!isBrowser()) return;

    const v = getSchemaVersion();
    if (v === STORAGE_VERSION) return;

    if (v == null) {
        const migrated = migrateFromStorageV0();
        if (!migrated) {
            setSchemaVersion(STORAGE_VERSION);
            return;
        }

        writeJson(STORAGE_KEYS.viewsAvailable, migrated.viewsAvailable);
        writeJson(STORAGE_KEYS.viewSelection, migrated.viewSelection);
        cleanupStorageV0();
        setSchemaVersion(STORAGE_VERSION);
        return;
    }
}

export function loadViewsAvailable(): Rec<ViewsAvailable> {
    return readJson<Rec<ViewsAvailable>>(STORAGE_KEYS.viewsAvailable) ?? defaultViewsAvailable;
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
