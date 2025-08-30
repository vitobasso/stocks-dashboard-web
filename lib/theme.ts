export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "dark") el.classList.add("dark");
  else el.classList.remove("dark");
}

export function getStoredTheme(ls: Storage): Theme | null {
  try {
    const t = ls.getItem("theme");
    return t === "dark" || t === "light" ? t : null;
  } catch {
    return null;
  }
}

export function getAppliedTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Toggles the current applied theme and returns the new theme (does not persist)
export function toggleAppliedTheme(): Theme {
  const el = document.documentElement;
  const isDark = el.classList.toggle("dark");
  return isDark ? "dark" : "light";
}
