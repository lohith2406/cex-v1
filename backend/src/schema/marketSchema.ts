import z from "zod";

export const depthSchema = z.object({
    assetId: z.coerce.number()
});