import * as z from "zod";

export const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    /** HH:MM であることを保証する */
    markAllIncompleteAt: z.iso.time({ precision: -1 }),
  })
  .strict();
