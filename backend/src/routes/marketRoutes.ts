import express from "express";
import { getFills, getOrderBook, getStocks } from "../controllers/marketController";
const router = express.Router();

router.get("/orderbook/:symbol", getOrderBook)
router.get("/fills/:symbol", getFills);
router.get("/stocks", getStocks);

export default router;