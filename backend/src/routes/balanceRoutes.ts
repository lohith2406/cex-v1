import express from "express";
import { getBalances } from "../controllers/balanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getBalances);
router.get("/:asset", authMiddleware, )

export default router;