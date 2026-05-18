export interface Order {
    id: number;
    userId: number;
    side: "BUY" | "SELL";
    type: "LIMIT" | "MARKET";
    assetId: number;
    price: bigint | null;
    quantity: bigint;
    filledQuantity: bigint,
    remainingQuantity: bigint,
    status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
    createdAt: number
}