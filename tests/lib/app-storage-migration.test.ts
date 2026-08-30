import { describe, expect, test } from "vitest";

import { migrateAppStorage } from "@/lib/app-storage-migration";

describe("migrateAppStorage", () => {
  test("v1 の AppStorage を v2 に migration できる", () => {
    // Arrange
    const appStorageV1 = {
      version: 1,
      data: {
        settings: {},
        categories: [
          {
            id: "uncategorized",
            name: "未分類",
            order: 0,
          },
        ],
        todos: [
          {
            id: "todo-1",
            name: "Todo 1",
            order: 0,
            categoryId: "uncategorized",
            completed: true,
          },
        ],
        lastMarkedAllIncompleteAt: "2026-08-29T15:00:00.000Z",
        lastSelectedCategoryId: "uncategorized",
      },
    };

    // Act
    const result = migrateAppStorage(appStorageV1);

    // Assert
    expect(result).toEqual({
      version: 2,
      data: {
        settings: {
          todoTogglePosition: "left",
        },
        categories: [
          {
            id: "uncategorized",
            name: "未分類",
            order: 0,
          },
        ],
        todos: [
          {
            id: "todo-1",
            name: "Todo 1",
            order: 0,
            categoryId: "uncategorized",
            completed: true,
          },
        ],
        lastMarkedAllIncompleteAt: "2026-08-29T15:00:00.000Z",
        lastSelectedCategoryId: "uncategorized",
      },
    });
  });

  test("v1 の空の settings に todoTogglePosition のデフォルト値が追加される", () => {
    // Arrange
    const appStorageV1 = {
      version: 1,
      data: {
        settings: {},
        categories: [],
        todos: [],
        lastMarkedAllIncompleteAt: "2026-08-29T15:00:00.000Z",
        lastSelectedCategoryId: "uncategorized",
      },
    };

    // Act
    const result = migrateAppStorage(appStorageV1);

    // Assert
    expect(result.data.settings).toEqual({
      todoTogglePosition: "left",
    });
  });

  test("v2 の AppStorage は migration せずそのまま返す", () => {
    // Arrange
    const appStorageV2 = {
      version: 2,
      data: {
        settings: {
          todoTogglePosition: "right",
        },
        categories: [],
        todos: [],
        lastMarkedAllIncompleteAt: "2026-08-29T15:00:00.000Z",
        lastSelectedCategoryId: "uncategorized",
      },
    };

    // Act
    const result = migrateAppStorage(appStorageV2);

    // Assert
    expect(result).toEqual(appStorageV2);
  });
});
