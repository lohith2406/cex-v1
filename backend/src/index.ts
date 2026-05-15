import "dotenv/config"
import express from "express"
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import marketRoutes from "./routes/marketRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(express.json());

app.use("/", authRoutes);

// --- Orders ---
app.use(orderRoutes);

// --- Market data ---
app.use("/", marketRoutes);

// --- User data ---
app.use("/", userRoutes);

app.listen(3000, () => console.log("CEX running on :3000"));