export function isBrowser(): boolean {
    return typeof window !== "undefined";
}

export function safeGetItem(key: string): string | null {
    if (!isBrowser()) return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function safeSetItem(key: string, value: string): void {
    if (!isBrowser()) return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
    }
}

export function safeRemoveItem(key: string): void {
    if (!isBrowser()) return;
    try {
        window.localStorage.removeItem(key);
    } catch {
    }
}

export function tryParseJson(raw: string | null): unknown {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function readJson<T>(key: string): T | null {
    return tryParseJson(safeGetItem(key)) as T | null;
}

export function writeJson<T>(key: string, value: T): void {
    safeSetItem(key, JSON.stringify(value));
}
