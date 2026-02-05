const hoverColor = "color-mix(in srgb, var(--ring) 20%, transparent)"
const hoveredBgCss = `{ background-image: linear-gradient(${hoverColor}, ${hoverColor}); }`

export function useHoveredCellHighlight(colKeys: string[]) {
    function colClass(key: string) {
        const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_");
        return `dg-col-${safe}`;
    }

    const hoverColClasses = colKeys.map((k) => {
        const cls = colClass(k);
        return `.rdg:has(.${cls}:hover) .${cls} ${hoveredBgCss}`;
    }).join("\n");

    const hoveredCellCss = `.rdg-row:hover .rdg-cell ${hoveredBgCss}
                            ${hoverColClasses}`

    return {hoveredCellCss, colClass}
}