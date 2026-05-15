import type { Request, Response } from "express";
import { BALANCES } from "../store/strore";

export async function getBalanace(req:Request, res: Response) {
    // return BALANCES[userId] for the authed user
    const userId = req.userId!;
    res.json(BALANCES[userId]);
}