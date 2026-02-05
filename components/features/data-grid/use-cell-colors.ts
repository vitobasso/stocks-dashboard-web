import {getAsNumber} from "@/lib/metadata/formats";
import chroma from "chroma-js";
import {bgColor, colors, fgColor, green, red} from "@/lib/metadata/colors";
import {useCssVars} from "@/hooks/use-css-vars";
import Color from "colorjs.io";
import {DataValue} from "@/lib/data";

export function useCellColors(allColKeys: string[]) {

    const cssVars = useCssVars([bgColor, fgColor, red, green])

    const colorScales = mapColorScales(allColKeys);
    function mapColorScales(colKeys: string[]) {
        const map = new Map<string, (n: number) => string>();
        for (const key of colKeys) {
            const rule = colors[key];
            if (!rule) continue;
            const cssColors = rule.colors.map(c => multiplyAlpha(cssVars[c], rule.alpha));
            if (cssColors.some(c => !c)) continue;
            const scale = chroma.scale(cssColors).domain(rule.domain);
            map.set(key, (n: number) => scale(n).hex());
        }
        return map;
    }

    function getCellColor(key: string, data: DataValue): string {
        const number = getAsNumber(key, data);
        const toHex = colorScales.get(key);
        if (number == null || !toHex) return cssVars[bgColor];
        return toHex(number);
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
