import { STOCKS } from "../store/strore";

export type StockSymbol = typeof STOCKS[number]["symbol"];

export interface Stock {
    id: number;
    title: string;
    symbol: StockSymbol
}
