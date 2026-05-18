import type { Order } from "./order";

export type PriceLevel = {
    totalQuantity: bigint;
    orders: Order[]
}