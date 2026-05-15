import type { Request, Response } from "express";
import { ORDERBOOK, FILLS, STOCKS } from "../store/strore";

export function getOrderBook(req: Request<{ symbol: string }>, res: Response) {
    // return aggregated depth — totalQty per price level for bids and asks
    // (don't expose individual userIds to other users)
    const symbol = req.params.symbol;

    const orderBook = ORDERBOOK[symbol];

    if (!orderBook) {
        return res.status(404).json({
            message:
                "Orderbook not found"
        });
    }

    const bids = Object.entries(orderBook.bids).map(([key, value]) => ({ 
        price: Number(key),
        qty: value.totalQty
    })).sort((a, b) => b.price - a.price)

    const asks = Object.entries(orderBook.asks).map(([key, value]) => ({
        price: Number(key),
        qty: value.totalQty
    })).sort((a, b) => a.price - b.price);

    res.json({
        bids,
        asks
    });
}

export function getFills(req: Request, res: Response) {
    // recent trades for this stock — the "tape"
    const symbol = req.params.symbol;

    const stock = STOCKS.find((stock) => stock.symbol === symbol);

    if (!stock) {
        return res.status(404).json({
            message: "Stock not found"
        });
    }

    const fills = FILLS.filter((fill) => fill.stockId === stock.id).sort((a, b) => b.createdAt - a.createdAt);

    res.json(fills);
}

export function getStocks(req: Request, res: Response) {
    res.json(STOCKS);
}


