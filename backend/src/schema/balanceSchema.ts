import z from "zod";

export const assetBalanceSchema = z.object({
    assetId: z.coerce.number()
})