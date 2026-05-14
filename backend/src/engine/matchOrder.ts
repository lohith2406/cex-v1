import { BALANCES, STOCKS, FILLS, ORDERBOOK } from "../store/strore";
import type { Order } from "../types/order";

export function matchOrder(order: Order) {
    const stock = STOCKS.find(stock => stock.id === order.stockId);

    if (!stock) {
        throw new Error("Stock not found");
    }

    const symbol = stock.symbol;

    const orderBook = ORDERBOOK[symbol];

    if (!orderBook) {
        throw new Error("Orderbook not found");
    }

    const oppositeSide = order.side === "BUY" ? orderBook.asks : orderBook.bids;
    const prices = Object.keys(oppositeSide).map((key) => Number(key));
    prices.sort((a, b) => order.side === "BUY" ? a - b : b- a);

    let remainingQty = order.qty - order.filledQty;

    for (const price of prices) {
        if (remainingQty <= 0) {
            break;
        }

        if (order.type === "LIMIT" && typeof order.price === "number") {

            if (order.side === "BUY" && price > order.price) {
                break;
            }

            if (order.side === "SELL" && price < order.price) {
                break;
            }
        }

        const priceLevel = oppositeSide[price];
        
        if (!priceLevel) {
            continue;
        }

        const ordersAtPrice = priceLevel.orders;

        for (const restingOrder of ordersAtPrice) {
            if (remainingQty <= 0) {
                break;
            }

            if (order.userId === restingOrder.userId) {
                continue;
            }

            const restingRemainingQty = restingOrder.qty - restingOrder.filledQty;
            
            const tradeQty = Math.min(restingRemainingQty, remainingQty);
            const tradeValue = tradeQty * price;

            const buyerId = order.side == "BUY" ? order.userId : restingOrder.userId;
            const sellerId = order.side === "SELL" ? order.userId : restingOrder.userId

            const buyerBalances = BALANCES[buyerId]!;
            const sellerBalances = BALANCES[sellerId]!;

            if (!buyerBalances[symbol]) {
                buyerBalances[symbol] = {
                    available: 0,
                    locked: 0
                };
            }

            buyerBalances[symbol]!.available += tradeQty;
            buyerBalances["INR"]!.locked -= tradeValue;

            if (order.side === "BUY" && order.type === "LIMIT" && typeof order.price === "number") {
                const refund = (order.price - price) * tradeQty;

                buyerBalances["INR"]!.available += refund;
                buyerBalances["INR"]!.locked -= refund;
            }

            sellerBalances["INR"]!.available += tradeValue;
            sellerBalances[symbol]!.locked -= tradeQty;

            order.filledQty += tradeQty;
            restingOrder.filledQty += tradeQty;
            remainingQty -= tradeQty;
            priceLevel.totalQty -= tradeQty;

            const buyOrderId = order.side === "BUY" ? order.id : restingOrder.id;
            const sellOrderId = order.side === "SELL" ? order.id : restingOrder.id;

            FILLS.push({
                id: Date.now(),
                stockId: order.stockId,
                price,
                qty: tradeQty,
                buyOrderId,
                sellOrderId,
                createdAt: Date.now()
            })

            if (restingOrder.qty === restingOrder.filledQty) {
                restingOrder.status = "FILLED";
            } else {
                restingOrder.status = "PARTIALLY_FILLED";
            }

            order.status = remainingQty === 0 ? "FILLED" : "PARTIALLY_FILLED";
        }

        priceLevel.orders = ordersAtPrice.filter((order) => order.status !== "FILLED");

        if (priceLevel.totalQty <= 0) {
            delete oppositeSide[price]; 
        }
    }
}

