import z from "zod";

export const depthSchema = z.object({
    symbol: z.string()
});