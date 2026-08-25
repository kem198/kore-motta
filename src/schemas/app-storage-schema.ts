import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { categorySchema } from "@/schemas/category-schema";
import { todoSchema } from "@/schemas/todo-schema";
import { AppStorage } from "@/types/app-storage";
import z from "zod";

const appStorageDataSchema = z
  .object({
    settings: z.record(z.string(), z.unknown()),
    categories: z.array(categorySchema),
    todos: z.array(todoSchema),
  })
  .strict();

export const appStorageSchema = z
  .object({
    version: z.literal(CURRENT_APP_STORAGE_VERSION),
    data: appStorageDataSchema,
  })
  .strict();

/** アプリケーションの保存データを読み込んで AppStorage として取得する */
export function parseAppStorage(data: unknown): AppStorage {
  return appStorageSchema.parse(data);
}
