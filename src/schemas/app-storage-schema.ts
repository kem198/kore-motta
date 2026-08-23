import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { AppStorage } from "@/types/app-storage";
import * as z from "zod";

const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    resetTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
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

const appStorageDataSchema = z
  .object({
    settings: z.record(z.string(), z.unknown()),
    categories: z.array(categorySchema),
    todos: z.array(todoSchema),
  })
  .strict();

const appStorageSchema = z
  .object({
    version: z.literal(CURRENT_APP_STORAGE_VERSION),
    data: appStorageDataSchema,
  })
  .strict();

export function parseAppStorage(data: unknown): AppStorage {
  return appStorageSchema.parse(data);
}
