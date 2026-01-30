export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export function timeAgo(date: Date): string | undefined {
    if (!date || isNaN(date.getTime())) return undefined

    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / 1000; // in seconds

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 60 * 60 * 24 * 365],
        ["month", 60 * 60 * 24 * 30],
        ["day", 60 * 60 * 24],
        ["hour", 60 * 60],
        ["minute", 60],
        ["second", 1],
    ];

    for (const [unit, secondsInUnit] of units) {
        if (Math.abs(diff) >= secondsInUnit || unit === "second") {
            const value = Math.round(diff / secondsInUnit);
            return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto", style: "long" }).format(
                value,
                unit
            );
        }
    }
    return "";
}