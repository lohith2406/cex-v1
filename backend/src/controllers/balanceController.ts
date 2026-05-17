import type { Request, Response } from "express";
import { BALANCES } from "../store/store";
import { assetBalanceSchema } from "../schema/balanceSchema";


export function getBalances(req: Request, res: Response) {
    const userId = req.userId!;

    return res.json(BALANCES[userId]);
}

export function getAssetBalance(req: Request, res: Response) {
    const parsedParams = assetBalanceSchema.safeParse(req.params);
    
    if (!parsedParams.success) {
        return res.status(400).json({
            message: "Invalid params",
            errors: parsedParams.error.issues
        });
    } 
    
    const { asset } = parsedParams.data;
    
    const userId = req.userId!;

    const userBalances = BALANCES[userId];

    if (!userBalances) {
        return res.status(404).json({
            message: "No balances found"
        });
    }

    const balance = userBalances[asset];

    if (!balance) {
        return res.status(404).json({
            message: "No balance found for this asset"
        });
    }

    return res.json(balance)
}