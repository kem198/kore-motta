import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";
import { categorySchema } from "@/schemas/category-schema";
import { todoSchema } from "@/schemas/todo-schema";
import * as z from "zod";

const appStorageV1Schema = z
  .object({
    version: z.literal(1),
    data: z
      .object({
        settings: z.record(z.string(), z.unknown()),
        categories: z.array(categorySchema),
        todos: z.array(todoSchema),
        lastMarkedAllIncompleteAt: z.iso.datetime(),
        lastSelectedCategoryId: z.string(),
      })
      .strict(),
  })
  .strict();

export type AppStorageV1 = z.infer<typeof appStorageV1Schema>;

/**
 * 値を v1 の AppStorage として検証・パースする。
 *
 * @param rawData - パース対象の未検証データ
 * @returns 検証済みの v1 AppStorage
 * @throws {z.ZodError} データが v1 の schema に適合しない場合
 */
function parseAppStorageV1(rawData: unknown): AppStorageV1 {
  return appStorageV1Schema.parse(rawData);
}

/**
 * AppStorage を現在のバージョンへ migration する。
 *
 * @param rawData - migration 対象の未検証データ
 * @returns 現在のバージョンへ migration された AppStorage
 */
export function migrateAppStorage(rawData: unknown): AppStorage {
  if (
    typeof rawData !== "object" ||
    rawData === null ||
    !("version" in rawData)
  ) {
    return parseAppStorage(rawData);
  }

  if (rawData.version === 1) {
    const appStorageV1 = parseAppStorageV1(rawData);

    const migratedAppStorage: AppStorage = {
      version: CURRENT_APP_STORAGE_VERSION,
      data: {
        ...appStorageV1.data,
        settings: {
          ...appStorageV1.data.settings,
          todoTogglePosition: "left",
        },
      },
    };

    return parseAppStorage(migratedAppStorage);
  }

  return parseAppStorage(rawData);
}
