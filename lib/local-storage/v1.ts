import type {ViewsAvailable} from "@/lib/views/views";
import {mapEntriesDepth3, mapValues, Rec} from "@/lib/utils/records";
import {defaultViews} from "@/lib/views/default-views";
import {readJson, setSchemaVersion, writeJson} from "@/lib/local-storage/shared";
import {Data} from "@/lib/data";

const V1_KEYS = {
    viewsAvailable: "viewsAvailable",
    positions: "positions"
} as const;

export function migrateV1ToV2() {
    migrateViewsAvailable();
    migratePositions();
    setSchemaVersion(2)
}

function migrateKey(key: string): string {
    const conversions = {
        "b3_position": "b3.position",
        "b3_listagem": "b3.listagem",
        "yahoo_quote": "yahoo.quote",
        "yahoo_target": "yahoo.target",
        "yahoo_recom": "yahoo.recom",
        "yahoo_chart": "yahoo.chart",
        "derived.yahoo_chart": "yahoo.derived.chart",
        "derived.forecast": "yahoo.derived.forecast",
        "derived.b3_position": "b3.derived.position",
        "derived.statusinvest": "statusinvest.derived",
    }
    for (const [before, after] of Object.entries(conversions)) {
        if (key.startsWith(before)) {
            return after + key.slice(before.length)
        }
    }
    return key
}

function migrateViewsAvailable() {
    const v1: Rec<ViewsAvailable> = loadViewsAvailable();
    const v2: Rec<ViewsAvailable> = mapValues(v1, v => ({
        ...v,
        colViews: v.colViews.map(v => ({
            ...v,
            items: v.items.map(migrateKey)
        })),
    }));
    saveViewsAvailable(v2);
}

function migratePositions() {
    const v1: Rec<Data> = loadPositions();
    const v2: Rec<Data> = mapEntriesDepth3(v1, (k) => migrateKey(k), (_, v) => v);
    savePositions(v2);
}

function loadViewsAvailable(): Rec<ViewsAvailable> {
    return readJson<Rec<ViewsAvailable>>(V1_KEYS.viewsAvailable) ?? defaultViews;
}

function saveViewsAvailable(v: Rec<ViewsAvailable>): void {
    writeJson(V1_KEYS.viewsAvailable, v);
}

function loadPositions(): Rec<Data> {
    return readJson<Rec<Data>>(V1_KEYS.positions) ?? {};
}

function savePositions(v: Rec<Data>): void {
    writeJson(V1_KEYS.positions, v);
}