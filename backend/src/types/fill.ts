export interface Fill {
    id: number;
    quantity: bigint;
    side: "BUY" | "SELL";
    type: "MAKER" | "TAKER";
    userId: number;
    price: bigint;
    market: string;
    orderId: number;
    createdAt: number;
}