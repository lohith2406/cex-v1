import express from "express";
import { getAssetBalance, getBalances } from "../controllers/balanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getBalances);
router.get("/:asset", authMiddleware, getAssetBalance);

export default router;