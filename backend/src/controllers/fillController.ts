import type { Request, Response } from "express";
import { prisma } from "../db";

export async function getFills(req: Request, res: Response) {
    const userId = req.userId;

    const fills = await prisma.fill.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return res.json(fills);
}