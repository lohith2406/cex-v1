import { z } from "zod";

export const orderSchema = z.object({
    side: z.enum(["BUY", "SELL"]),
    type: z.enum(["MARKET", "LIMIT"]),
    stockId: z.number(),
    price: z.number().positive().optional(),
    qty: z.number().positive()
})