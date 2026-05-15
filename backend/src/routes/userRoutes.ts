import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getBalanace } from "../controllers/userController";

const router = express.Router();

router.get("/balance", authMiddleware, getBalanace);

export default router;