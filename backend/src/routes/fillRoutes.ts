import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getFills } from "../controllers/fillController";

const router = express.Router();

router.get("/", authMiddleware, getFills);

export default router;