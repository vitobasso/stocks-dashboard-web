export type Fundamentals = { [key: string]: string | number };
export type Overview = { value: number; future: number; past: number; health: number; dividends: number };
export type AnalystRating = { strongBuy: number; buy: number; hold: number; underperform: number; sell: number };
export type PriceForecast = { min: number; avg: number; max: number };
export type ScrapedEntry = {
    fundamentals?: Fundamentals;
    overview?: Overview;
    analystRating?: AnalystRating;
    priceForecast?: PriceForecast;
};
export type ScrapedData = Record<string, ScrapedEntry>;

export type QuoteSeries = number[];
export type TimeInterval = "1d" | "1mo" | "1y" | "5y" | "latest";
export type IntervalQuotes = Partial<Record<TimeInterval, QuoteSeries>>;
export type QuoteEntry = { quotes: IntervalQuotes };
export type QuoteData = Record<string, QuoteEntry>;