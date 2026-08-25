import * as z from "zod";

export const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    markAllIncompleteAt: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .strict();
