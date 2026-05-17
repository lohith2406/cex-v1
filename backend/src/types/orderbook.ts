import type { Order } from "./order"


export type Orderbook = {
    bids: Order[];
    asks: Order[];
    lastTradedPrice: bigint;
}