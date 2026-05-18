export interface Fill {
    id: number;
    assetId: number;
    price: bigint;
    quantity: bigint;
    buyOrderId: number;
    sellOrderId: number;
    createdAt: number;
}