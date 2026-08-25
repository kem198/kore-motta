import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import * as z from "zod";

export const todoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    categoryId: z.string().default(DEFAULT_CATEGORY_ID),
    memo: z.string().optional(),
    completed: z.boolean(),
  })
  .strict();
