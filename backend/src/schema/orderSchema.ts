import z from "zod";

export const orderIdSchema = z.object({
    orderId: z.coerce.number()
});

