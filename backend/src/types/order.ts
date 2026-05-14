type OrderSide = "BUY" | "SELL";
type OrderType =  "MARKET" | "LIMIT";
type OrderStatus = "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";

export interface Order {
    id: number;
    userId: number;
    side: OrderSide;
    type: OrderType;
    stockId: number;
    price?: number;
    qty: number;
    filledQty: number;
    status: OrderStatus;
    createdAt: number;
}