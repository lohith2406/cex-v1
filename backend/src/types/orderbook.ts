import type { Order } from "./order"

export interface PriceLevel {
    totalQty: number;
    orders: Order[]
}

export type bookSide = Record<number, PriceLevel>

export interface OrderBookSide {
    bids: bookSide,
    asks: bookSide
}