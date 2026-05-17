import express from "express";
import { getDepth } from "../controllers/marketController";
const router = express.Router();

router.post("/depth/:symbol", getDepth);

export default router;