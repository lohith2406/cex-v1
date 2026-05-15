import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import type { User } from "../types/User";
import { USERS, BALANCES } from "../store/strore";
import { nextId } from "../utils/id";

export async function signup (req: Request, res: Response) {
    const { username, password } = req.body;
    const user = USERS.find((u) => u.username === username);
    
    if (user) {
        return res.json({
            message: "User with username already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: nextId(),
        username,
        password: hashedPassword
    }

    USERS.push(newUser);

    BALANCES[newUser.id] = {
        "INR": {
            "available": 0,
            "locked": 0
        }
    };

    res.json({
        message: "Signed up successfully"
    });
}

export async function login(req:Request, res: Response) {
    const { username, password } = req.body;

    const user = USERS.find((u) => u.username === username)

    if (!user) {
        return res.json({
            message: "User doesn't exist"
        })
    };

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.json({
            message: "Invalid credentials"
        });
    }

    const token = jwt.sign({
        userId: user.id,
        username
    }, process.env.JWT_SECRET!);
    
    res.json({
        token 
    });
}