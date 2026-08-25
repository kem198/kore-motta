import * as z from "zod";

export const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
  })
  .strict();

export type Category = z.infer<typeof categorySchema>;
