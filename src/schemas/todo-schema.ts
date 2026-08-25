import * as z from "zod";

export const todoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    categoryId: z.string(),
    memo: z.string().optional(),
    completed: z.boolean(),
  })
  .strict();
