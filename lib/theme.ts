import {loadTheme, saveTheme} from "@/lib/local-storage/local-storage";

export type Theme = "light" | "dark";


export function getAppliedTheme(): Theme {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyStoredTheme() {
    const theme = loadTheme();
    if (theme) applyTheme(theme);
}

export function toggleTheme() {
    const t = toggleAppliedTheme();
    saveTheme(t);
}

function applyTheme(theme: Theme) {
    const el = document.documentElement;
    if (theme === "dark") el.classList.add("dark");
    else el.classList.remove("dark");
}

// Toggles the current applied theme and returns the new theme (does not persist)
function toggleAppliedTheme(): Theme {
    const el = document.documentElement;
    const isDark = el.classList.toggle("dark");
    return isDark ? "dark" : "light";
}
