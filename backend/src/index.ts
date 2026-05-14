import "dotenv/config"
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware/middleware";
import type { User } from "./types/User";
import type { Order } from "./types/order";
import { orderSchema } from "./schemas/order";
import { matchOrder } from "./engine/matchOrder";
import { USERS, STOCKS, ORDERS, BALANCES, ORDERBOOK } from "./store/strore";

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find((u) => u.username === username);
    
    if (user) {
        return res.json({
            message: "User with username already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: Date.now(),
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
});

app.post("/login", async (req, res) => {
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
});

// --- Orders ---
app.post("/order", authMiddleware, (req, res) => {
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

    if (side === "BUY") {
        if (typeof price !== "number") {
            return res.status(400).json({
                message: "Price required for BUY order"
            });
        }

        const inrBalance = BALANCES[userId]!["INR"];

        if (!inrBalance) {
            return res.status(400).json({
                message: "INR balance not found"
            });
        }

        const requiredAmount = price * qty;

        if (inrBalance.available < requiredAmount) {
            return res.status(400).json({
                message: "Insufficient INR balance"
            });
        }

        inrBalance.available -= requiredAmount;
        inrBalance.locked += requiredAmount;
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
        id: Date.now(),
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

    
    ORDERS.push(order);
    matchOrder(order);

    const remainingQty = order.qty - order.filledQty;

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

});
  
app.delete("/order/:orderId", (req, res) => {
    // 1. find order, check ownership
    // 2. remove from ORDERBOOK price level
    // 3. unlock remaining reserved balance
    // 4. mark status = CANCELLED
});

app.get("/orders", (req, res) => {
    // query: ?status=OPEN  (or all)
    // return current user's orders
});

// --- Market data ---
app.get("/orderbook/:symbol", (req, res) => {
    // return aggregated depth — totalQty per price level for bids and asks
    // (don't expose individual userIds to other users)
    const symbol = req.params.symbol;

    if (!ORDERBOOK[symbol]) {
        return res.status(404).json({
            message:
                "Orderbook not found"
        });
    }

    const bids = Object.entries(ORDERBOOK[symbol].bids).map(([key, value]) => ({ 
        price: Number(key),
        qty: value.totalQty
    })).sort((a, b) => b.price - a.price)

    const asks = Object.entries(ORDERBOOK[symbol].asks).map(([key, value]) => ({
        price: Number(key),
        qty: value.totalQty
    })).sort((a, b) => a.price - b.price);

    res.json({
        bids,
        asks
    });
    
});

app.get("/fills/:symbol", (req, res) => {
    // recent trades for this stock — the "tape"
});

app.get("/stocks", (req, res) => {
    res.json(STOCKS);
});

// --- User data ---
app.get("/balance", authMiddleware, (req, res) => {
    // return BALANCES[userId] for the authed user
    const userId = req.userId!;
    res.json(BALANCES[userId]);
});

app.listen(3000, () => console.log("CEX running on :3000"));