import type { Request, Response } from "express";
import { depthSchema } from "../schema/marketSchema";
import { ORDERBOOKS } from "../store/store";

export function getDepth(req: Request, res: Response) {
    const parsedParams = depthSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return res.status(400).json({
            message: "Invalid params",
            errors: parsedParams.error.issues
        });
    }

    const { symbol } = parsedParams.data;

    const orderbook = ORDERBOOKS[symbol];

    if (!orderbook) {
        return res.status(404).json({
            message: "Market not found"
        });
    }

    return res.json(orderbook);
}