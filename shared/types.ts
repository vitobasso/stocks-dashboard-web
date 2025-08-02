export type Fundaments = { [key: string]: string | number };
export type Overview = { value: number; future: number; past: number; health: number; dividends: number };
export type AnalystRating = { strongBuy: number; buy: number; hold: number; underperform: number; sell: number };
export type PriceForecast = { min: number; avg: number; max: number };
export type TickerEntry = {
    fundaments?: Fundaments;
    overview?: Overview;
    analystRating?: AnalystRating;
    priceForecast?: PriceForecast;
};
export type TickerData = Record<string, TickerEntry>;

export type QuoteSeries = number[];
export type TimeInterval = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd";
export type IntervalQuotes = Record<TimeInterval, QuoteSeries>;
export type QuoteData = Record<string, IntervalQuotes>;