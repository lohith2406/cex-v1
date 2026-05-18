import type { Order } from "./order"
import type { PriceLevel } from "./priceLevel";

export type Orderbook = {
    bids: Record<string, PriceLevel>
    asks: Record<string, PriceLevel>
    lastTradedPrice: bigint;
}