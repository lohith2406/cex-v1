import z from "zod";

export const assetBalanceSchema = z.object({
    asset: z.string()
})