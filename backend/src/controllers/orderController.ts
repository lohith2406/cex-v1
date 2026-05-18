import type { Request, Response } from "express";
import { prisma } from "../db";
import { orderIdSchema } from "../schema/orderSchema";


export async function placeOrder(req: Request, res: Response) {
    const userId = req.userId;
    
}

export async function getOrder(req: Request, res: Response) {
    const userId = req.userId;
    
    const parsedParams = orderIdSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return res.json({
            message: "Invalid inputs",
            errors: parsedParams.error.issues
        });
    }

    const { orderId } = parsedParams.data;

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId
        },
        include: {
            buyFills: true,
            sellFills: true
        }
    });

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    return res.json(order);
}

export async function cancelOrder(req: Request, res: Response) {
    const userId = req.userId;
    
}

export async function getOrders(req:Request, res: Response) {
    const userId = req.userId;

    const orders = await prisma.order.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return res.json(orders);
}