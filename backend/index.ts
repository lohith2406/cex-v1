import express from "express";
import authRoutes from "./src/routes/authRoutes";
const app = express();

app.use(express.json());

app.use("/", authRoutes);

/*
    body = {
        type:           "market" | "limit",
        price:          number | null,
        qty:            number,
        market_id:      string,
        side:           "buy" | "sell"
    }

    @returns {
        orderId: string,
        filledQty: number,
        averagePrice
    }
*/

// 50.01

// 500001
app.post("/order", (req, res) => {

})
/*
    returns the status of an order (partially filled, success, cancellled)
    ALSO RETURNS THE INDIVIDUAL FILLS OF THIS ORDER 
*/
app.get("/order/:orderId")
app.delete("/order/:orderId")
app.get("/depth/:symbol");
app.get("/orders");
app.get("/fills");

app.get("/balance/usd");

/*  
    Returns the balance of all stocks
*/
app.get("/balance")

app.listen(3000);