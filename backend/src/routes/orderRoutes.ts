import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { cancelOrder, getOrder, getOrders, placeOrder } from "../controllers/orderController";

const router = express.Router();

/*
    body = {
        type:           "market" | "limit",
        price:          number | null,
        qty:            number,
        market_id:      string,
        side:           "buy" | "sell"
    }

    @returns {
        orderId: string,
        filledQty: number,
        averagePrice
    }
*/

// 50.01

// 500001
router.post("/", authMiddleware, placeOrder);

/*
    returns the status of an order (partially filled, success, cancellled)
    ALSO RETURNS THE INDIVIDUAL FILLS OF THIS ORDER 
*/

router.get("/:orderId", authMiddleware, getOrder);

router.delete("/:orderId", authMiddleware, cancelOrder);

router.get("/", authMiddleware, getOrders);


export default router;