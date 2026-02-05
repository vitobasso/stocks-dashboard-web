import {getAsText, trimDigits} from './formats';
import { describe, test, expect } from '@jest/globals';

describe('trimDigits', () => {
    test('handles zero', () => {
        expect(trimDigits(0, 3)).toBe(0);
    });

    test('numbers >= 1', () => {
        expect(trimDigits(1.23456, 3)).toBe(1.23);
        expect(trimDigits(12.3456, 3)).toBe(12.3);
        expect(trimDigits(123.456, 3)).toBe(123);
        expect(trimDigits(1234.56, 3)).toBe(1235);
        expect(trimDigits(12345.6, 3)).toBe(12346);
    });

    test('numbers between 0 and 1', () => {
        expect(trimDigits(0.12345, 3)).toBe(0.12);
        expect(trimDigits(0.01234, 3)).toBe(0.01);
        expect(trimDigits(0.00123, 3)).toBe(0);
        expect(trimDigits(0.56789, 3)).toBe(0.57);
        expect(trimDigits(0.05678, 3)).toBe(0.06);
        expect(trimDigits(0.00567, 3)).toBe(0.01);
    });

    test('negative numbers', () => {
        expect(trimDigits(-1234.56, 3)).toBe(-1235);
        expect(trimDigits(-123.456, 3)).toBe(-123);
        expect(trimDigits(-12.3456, 3)).toBe(-12.3);
        expect(trimDigits(-1.23456, 3)).toBe(-1.23);
        expect(trimDigits(-0.12345, 3)).toBe(-0.12);
        expect(trimDigits(-0.01234, 3)).toBe(-0.01);
        expect(trimDigits(-0.00123, 3)).toBe(-0);
    });

    test('varying maxDigits', () => {
        expect(trimDigits(1.23456, 2)).toBe(1.2);
        expect(trimDigits(1.23456, 1)).toBe(1);
        expect(trimDigits(0.12345, 2)).toBe(0.1);
        expect(trimDigits(0.12345, 1)).toBe(0);
        expect(trimDigits(0.01234, 3)).toBe(0.01);
        expect(trimDigits(0.01234, 2)).toBe(0);
    });
});

describe('getAsText', () => {
    test('numbers', () => {
        expect(getAsText("", 123)).toBe("123");
        expect(getAsText("", 12.3)).toBe("12,3");
        expect(getAsText("", "123")).toBe("123");
        expect(getAsText("", "12.3")).toBe("12,3");
        expect(getAsText("", "12,3")).toBe("12,3");
        expect(getAsText("", "")).toBe("0");
    });
    test('strings', () => {
        expect(getAsText("", "abc")).toBe("abc");
        expect(getAsText("", "1/0")).toBe("1/0");
        expect(getAsText("", "NaN")).toBe("NaN");
    });
    test('percent', () => {
        expect(getAsText("percent", 123)).toBe("123%");
        expect(getAsText("percent", 12.3)).toBe("12%");
        expect(getAsText("percent", 1.2)).toBe("1,2%");
        expect(getAsText("percent", "1.2")).toBe("1,2%");
    });
    test('chart', () => {
        expect(getAsText("chart", { series: [], variation: 0.1 })).toBe("10%");
    });
    test('invalid', () => {
        expect(getAsText("", 1/0)).toBe("");
        expect(getAsText("", NaN)).toBe("");
        expect(getAsText("", null as any)).toBe("");
        expect(getAsText("", { series: [], variation: 123 })).toBe("");
        expect(getAsText("percent", 1/0)).toBe(undefined);
        expect(getAsText("percent", NaN)).toBe(undefined);
        expect(getAsText("percent", { series: [], variation: 123 })).toBe(undefined);
        expect(getAsText("chart", 123)).toBe(undefined);
        expect(getAsText("chart", "123")).toBe(undefined);
    });
});