import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createOrder, deleteOrder, getOrders } from "../controllers/orderController";
const router = express.Router();

router.post("/order", authMiddleware, createOrder);
router.delete("/order/:orderId", authMiddleware, deleteOrder);
router.get("/orders", authMiddleware, getOrders);

export default router;