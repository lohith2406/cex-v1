import type { Request, Response } from "express";
import { prisma } from "../../db";
import { authSchema } from "../schema/authSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!;

export async function signup(req: Request, res: Response) {
    const parsedBody = authSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid inputs",
            errors: parsedBody.error.issues
        })
    }

    const { username, password } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({
        where: {
            username
        }
    });

    if (existingUser) {
        return res.status(409).json({
            message: "User already exists"
        })
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword
        }
    });

    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET);

    return res.status(201).json({
        message: "Successfully signed up!",
        token
    });
}

export async function signin(req: Request, res: Response) {
    const parsedBody = authSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid inputs",
            errors: parsedBody.error.issues
        });
    }

    const { username, password } = parsedBody.data;

    
    const user = await prisma.user.findUnique({
        where: {
            username
        }
    });
    
    if (!user) {
        return res.status(404).json({
            message: "No user found"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET);

    return res.json({
        token
    })
}