import express from "express";
import authRoutes from "./routes/authRoutes";
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
app.get("/order/:orderId", (req, res) => {

})
app.delete("/order/:orderId", (req, res) => {
    
})
app.get("/depth/:symbol", (req, res) => {
    
});
app.get("/orders", (req, res) => {
    
});
app.get("/fills", (req, res) => {
    
});

app.get("/balance/usd", (req, res) => {
    
});

/*  
    Returns the balance of all stocks
*/
app.get("/balance", (req, res) => {
    
})

app.listen(3000, () => {
    console.log("Server running on 3000");
});