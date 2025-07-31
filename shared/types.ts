export type Fundaments = { [key: string]: string | number };
export type Overview = { value: number; future: number; past: number; health: number; dividends: number };
export type AnalystRating = { strongBuy: number; buy: number; hold: number; underperform: number; sell: number };
export type PriceForecast = { min: number; avg: number; max: number };
export type Price = { current: number; day: number; month: number; year: number };
export type TickerRow = {
    ticker: string;
    fundaments?: Fundaments;
    overview?: Overview;
    analystRating?: AnalystRating;
    priceForecast?: PriceForecast;
    price?: Price;
};
