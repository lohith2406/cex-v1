import express from "express";
import authRoutes from "./routes/authRoutes";
import marketRoutes from "./routes/marketRoutes";
import balanceRoutes from "./routes/balanceRoutes";
import orderRoutes from "./routes/orderRoutes";
import fillRoutes from "./routes/fillRoutes";
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/orders", orderRoutes);

app.use("/market", marketRoutes);

app.use("/fills", fillRoutes);

app.use("/balance", balanceRoutes)

app.listen(3000, () => {
    console.log("Server running on 3000");
});