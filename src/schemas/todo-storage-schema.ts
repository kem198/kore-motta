import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { TodoStorage } from "@/types/todo";
import * as z from "zod";

const categoryValueSchema = z
  .object({ name: z.string(), resetTime: z.string().regex(/^\d{2}:\d{2}$/) })
  .strict();

const todoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    categoryId: z.string().default(DEFAULT_CATEGORY_ID),
    memo: z.string().optional(),
    completed: z.boolean(),
  })
  .strict();

const todoStorageSchema = z
  .object({
    version: z.literal(CURRENT_TODO_STORAGE_VERSION),
    categories: z
      .record(z.string(), categoryValueSchema)
      .default(DEFAULT_CATEGORIES_STORAGE),
    todos: z.array(todoSchema),
  })
  .strict();

export function parseTodoStorage(data: unknown): TodoStorage {
  return todoStorageSchema.parse(data);
}
