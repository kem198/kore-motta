import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { categorySchema } from "@/schemas/category-schema";
import { todoSchema } from "@/schemas/todo-schema";
import { AppStorage } from "@/types/app-storage";
import * as z from "zod";

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

export function parseAppStorage(rawData: unknown): AppStorage {
  return appStorageSchema.parse(rawData);
}
