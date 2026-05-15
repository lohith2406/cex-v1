import type { Request, Response } from "express";
import { STOCKS, ORDERBOOK, BALANCES, ORDERS, FILLS } from "../store/strore";
import type { Order } from "../types/order";
import { orderSchema } from "../schemas/order";
import { matchOrder } from "../engine/matchOrder";
import { nextId } from "../utils/id";

export async function createOrder(req:Request, res: Response) {
    // body: { userId, side: "BUY"|"SELL", type: "LIMIT"|"MARKET", symbol, price?, qty }
    // 1. validate input + stock exists
    // 2. check + lock balance (INR for BUY, stock for SELL)
    // 3. run matching engine against opposite side of ORDERBOOK
    // 4. write fills to FILLS, update filledQty + status on ORDERS
    // 5. if leftover qty and LIMIT, rest on book; if MARKET, cancel remainder
    // 6. settle balances on each fill (move locked -> other asset's available)
    const userId = req.userId!;
    const parsedBody = orderSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsedBody.error.issues
        });    
    }

    const { side, type, stockId, price, qty } = parsedBody.data;

    const stock = STOCKS.find(stock => stock.id === stockId);

    if (!stock) {
        return res.status(404).json({
            message: "Stock not found"
        });
    }

    const symbol = stock.symbol;

    const orderBook = ORDERBOOK[symbol];

    if (!orderBook) {
        return res.json({
            message: "Orderbook not found"
        });
    }

    if (type === "LIMIT" && typeof price !== "number") {
        return res.status(400).json({
            message: "Price required for LIMIT order"
        });
    }

    let estimatedCost = 0;

    if (side === "BUY") {

        if (type === "LIMIT") {
            const inrBalance = BALANCES[userId]!["INR"];
    
            if (!inrBalance) {
                return res.status(400).json({
                    message: "INR balance not found"
                });
            }
    
            const requiredAmount = price! * qty;
    
            if (inrBalance.available < requiredAmount) {
                return res.status(400).json({
                    message: "Insufficient INR balance"
                });
            }
    
            inrBalance.available -= requiredAmount;
            inrBalance.locked += requiredAmount;
        }

        if (type === "MARKET") {
            let remainingQty = qty;

            const askPrices = Object.keys(orderBook.asks).map((price) => Number(price)).sort((a, b) => a - b);

            for (const askPrice of askPrices) {
                if (remainingQty <= 0) {
                    break;
                }

                const level = orderBook.asks[askPrice];

                if (!level) {
                    continue;
                }

                let othersQty = 0;
                for (const order of level.orders) {
                    if (order.userId !== userId) {
                        othersQty += order.qty - order.filledQty;
                    }
                }

                const executableQty = Math.min(othersQty, remainingQty);

                const executableCost = executableQty * askPrice;
                estimatedCost += executableCost;
                remainingQty -= executableQty;
            }
            
            const inrBalance = BALANCES[userId]!["INR"];
    
            if (!inrBalance) {
                return res.status(400).json({
                    message: "INR balance not found"
                });
            }

            if (inrBalance.available < estimatedCost) {
                return res.status(400).json({
                    message: "Insufficient INR balance"
                });
            }
    
            inrBalance.available -= estimatedCost;
            inrBalance.locked += estimatedCost;
        }

    }

    if (side === "SELL") {
        const stockBalance = BALANCES[userId]![symbol];

        if (!stockBalance) {
            return res.status(400).json({
                message: "No stock balance"
            });
        }

        if (stockBalance.available < qty) {
            return res.status(400).json({
                message: "Insufficient stock balance"
            });
        }

        stockBalance.available -= qty;
        stockBalance.locked += qty;
    }

    const order: Order = {
        id: nextId(),
        userId,
        side,
        type,
        stockId,
        price,
        qty,
        filledQty: 0,
        status: "OPEN",
        createdAt: Date.now()
    };

    
    const fillsStartIndex = FILLS.length;

    ORDERS.push(order);
    matchOrder(order);

    const remainingQty = order.qty - order.filledQty;

    if (type === "MARKET" && remainingQty > 0) {

        if (side === "SELL") {
            BALANCES[userId]![symbol]!.locked -= remainingQty;
            BALANCES[userId]![symbol]!.available += remainingQty;
        }

        if (side === "BUY") {
            let spent = 0;
            for (const fill of FILLS.slice(fillsStartIndex)) {
                spent += fill.qty * fill.price;
            }
            const unspent = estimatedCost - spent;

            const inrBalance = BALANCES[userId]!["INR"]!;
            inrBalance.locked -= unspent;
            inrBalance.available += unspent;
        }

        order.status = order.filledQty > 0 ? "PARTIALLY_FILLED" : "CANCELLED";
    }

    if (type === "LIMIT" && remainingQty > 0) {

        const limitOrderPrice = price!
        
        const bookSide = side === "BUY" ? orderBook.bids : orderBook.asks;

        if (!bookSide[limitOrderPrice]) {
            bookSide[limitOrderPrice] = {
                totalQty: 0,
                orders: []
            };
        }

        bookSide[limitOrderPrice].orders.push(order);

        bookSide[limitOrderPrice].totalQty += remainingQty;

        order.status = order.filledQty > 0 ? "PARTIALLY_FILLED" : "OPEN";
    }
    
    return res.status(201).json({
        message: "Order placed",
        order
    });

}

export async function deleteOrder(req: Request, res: Response) {
    // 1. find order, check ownership
    // 2. remove from ORDERBOOK price level
    // 3. unlock remaining reserved balance
    // 4. mark status = CANCELLED
    const orderId = Number(req.params.orderId);
    const userId = req.userId;

    const order = ORDERS.find((order) => order.id === orderId);

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    if (order.userId !== userId) {
        return res.status(403).json({
            message: "Unauthorized"
        });
    }

    if (order.status === "FILLED" || order.status === "CANCELLED") {
        return res.status(400).json({
            message: "Order cannot be cancelled"
        });
    }

    if (order.type === "MARKET") {
        return res.status(400).json({
            message: "MARKET orders cannot be cancelled"
        });
    }

    const stock = STOCKS.find((stock) => stock.id === order.stockId);

    if (!stock) {
        return res.status(404).json({
            message: "Stock not found"
        });
    }

    const symbol = stock.symbol;

    const orderBook = ORDERBOOK[symbol];

    if (!orderBook) {
        return res.status(404).json({
            message: "Orderbook not found"
        });
    }

    const bookSide = order.side === "BUY" ? orderBook.bids : orderBook.asks;

    const remainingQty = order.qty - order.filledQty;

    const price = order.price!
    const priceLevel = bookSide[price];

    if (!priceLevel) {
        return res.status(404).json({
            message: "Price level not found"
        });
    }

    priceLevel.orders = priceLevel.orders.filter((o) => o.id !== order.id);

    priceLevel.totalQty -= remainingQty;

    if (priceLevel.totalQty <= 0) {
        delete bookSide[price];
    }

    if (order.side === "BUY") {
        const refundAmount = remainingQty * price;

        BALANCES[userId]!["INR"]!.locked -= refundAmount;
        BALANCES[userId]!["INR"]!.available += refundAmount;
    }

    if (order.side === "SELL") {
        BALANCES[userId]![symbol]!.locked -= remainingQty;
        BALANCES[userId]![symbol]!.available += remainingQty;
    }

    order.status = "CANCELLED";

    res.json({
        message: "Order cancelled",
        order
    });
    
}

export async function getOrders(req: Request, res: Response) {
    // query: ?status=OPEN  (or all)
    // return current user's orders
    const userId = req.userId;

    const status = req.query.status;

    let orders = ORDERS.filter((order) => order.userId === userId);

    if (typeof status === "string") {
        orders = orders.filter((order) => order.status === status);
    }

    res.json(orders);
}