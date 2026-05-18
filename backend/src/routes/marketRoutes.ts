import express from "express";
import { getDepth } from "../controllers/marketController";
const router = express.Router();

router.post("/depth/:assetId", getDepth);

export default router;