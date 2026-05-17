export interface Order {
    id: number;
    userId: number;
    market: string;
    price: bigint | null;
    quantity: bigint;
    filledQuantity: bigint,
    remainingQuantity: bigint,
    type: "LIMIT" | "MARKET";
    side: "BUY" | "SELL";
    status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
    createdAt: number
}