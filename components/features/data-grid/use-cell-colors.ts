import {getAsNumber} from "@/lib/metadata/formats";
import chroma from "chroma-js";
import {bgColor, colors, fgColor, green, red} from "@/lib/metadata/colors";
import {useCssVars} from "@/hooks/use-css-vars";
import Color from "colorjs.io";
import {DataValue} from "@/lib/data";
import {toNorm} from "@/lib/utils/strings";

/**
 * Returns CSS color notation, e.g. "#ff0000" or "lab(100% 0 0 / 1)"
 */
type ColorMapper = (colKey: string, data: DataValue) => string

export function useCellColors(allColKeys: string[]) {

    const cssVars = useCssVars([bgColor, fgColor, red, green])

    function colorForNumber(domain: number[], colors: string[]) {
        return  (colKey: string, data: DataValue) => {
            const input = getAsNumber(colKey, data);
            if (!input) return cssVars[bgColor]
            const scale =  chroma.scale(colors).domain(domain);
            return scale(input).hex()
        }
    }

    function colorForString(domain: RegExp[], colors: string[]) {
        return (colKey: string, data: DataValue) => {
            if (typeof data !== "string") return cssVars[bgColor]
            const index = domain.findIndex(d => d.test(toNorm(data)));
            return index >= 0 ? colors[index] : cssVars[bgColor];
        }
    }

    function colorMapperFor(colKey: string): ColorMapper | undefined {
        const rule = colors[colKey];
        if (!rule) return;
        const cssColors = rule.colors.map(c => multiplyAlpha(cssVars[c.colorRef], c.alpha ?? 1));
        if (cssColors.some(c => !c)) throw new Error(`Invalid color for ${colKey}: ${rule.colors}`);
        if (rule.type === "number") return colorForNumber(rule.domain, cssColors)
        if (rule.type === "string") return colorForString(rule.domain, cssColors)
    }

    function createColorMappers(colKeys: string[]) {
        const map = new Map<string, ColorMapper>();
        for (const key of colKeys) {
            const fn = colorMapperFor(key)
            if (fn) map.set(key, fn);
        }
        return map;
    }

    const colorMappers = createColorMappers(allColKeys);

    function getCellColor(colKey: string, data: DataValue): string {
        const rule = colors[colKey];
        if (!rule) return cssVars[bgColor];
        const colorMapper = colorMappers.get(colKey);
        if (!colorMapper) return cssVars[bgColor]
        return colorMapper(colKey, data);
    }

    return getCellColor;
}

function multiplyAlpha(input: string, alpha?: number): string {
    if (!alpha) return input;
    const a = Math.max(0, Math.min(1, alpha));
    const color = new Color(input);
    const currentAlpha = color.alpha ?? 1;
    color.alpha = currentAlpha * a;
    return color.toString({ format: "css" });
}
