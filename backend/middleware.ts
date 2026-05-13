import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    userId?: number
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.json({
            message: "Auth header missing"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof decoded !== "object" || decoded === null || typeof decoded.userId !== "number" || typeof decoded.username !== "string") {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.json({
            message: "Invalid token"
        })
    }
}