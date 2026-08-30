import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";

type AppStorageV1 = {
  version: 1;
  data: {
    settings: Record<string, unknown>;
    categories: unknown[];
    todos: unknown[];
    lastMarkedAllIncompleteAt: string;
    lastSelectedCategoryId: string;
  };
};

export function migrateAppStorage(rawData: unknown): unknown {
  if (
    typeof rawData !== "object" ||
    rawData === null ||
    !("version" in rawData)
  ) {
    return rawData;
  }

  if (rawData.version === CURRENT_APP_STORAGE_VERSION) {
    return rawData;
  }

  if (rawData.version === 1) {
    const appStorageV1 = rawData as AppStorageV1;

    return {
      version: CURRENT_APP_STORAGE_VERSION,
      data: {
        settings: appStorageV1.data.settings,
        categories: appStorageV1.data.categories,
        todos: appStorageV1.data.todos,
        internal: {
          lastMarkedAllIncompleteAt:
            appStorageV1.data.lastMarkedAllIncompleteAt,
          lastSelectedCategoryId: appStorageV1.data.lastSelectedCategoryId,
        },
      },
    };
  }

  return rawData;
}
