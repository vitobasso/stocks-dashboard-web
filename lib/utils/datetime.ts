export function timeAgo(date: Date): string {
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
            return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(
                value,
                unit
            );
        }
    }
    return "";
}