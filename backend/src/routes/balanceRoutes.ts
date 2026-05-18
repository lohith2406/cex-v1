import express from "express";
import { getAssetBalance, getBalances } from "../controllers/balanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getBalances);
router.get("/:assetId", authMiddleware, getAssetBalance);

export default router;