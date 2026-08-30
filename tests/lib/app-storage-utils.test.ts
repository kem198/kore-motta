process.env.TZ = "Asia/Tokyo";
import { describe, expect, test } from "vitest";

import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import {
  createInitialAppStorage,
  markAllIncompleteIfDateChanged,
  validateIntegrity,
} from "@/lib/app-storage-utils";

describe("markAllIncompleteIfDateChanged", () => {
  test("同日ではすべての Todo を未完了にしない", () => {
    // Arrange
    const appStorage = createInitialAppStorage();
    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      27,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 27, 12, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(false);
    expect(result.appStorage).toBe(appStorage);
  });

  test("日付が変わる直前ではすべての Todo を未完了にしない", () => {
    // Arrange
    const appStorage = createInitialAppStorage();
    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      26,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 26, 23, 59, 59, 999);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(false);
    expect(result.appStorage).toBe(appStorage);
  });

  test("日付が変わった瞬間にすべての Todo を未完了にする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "Todo 1",
        order: 0,
        categoryId: "uncategorized",
        completed: true,
      },
      {
        id: "todo-2",
        name: "Todo 2",
        order: 1,
        categoryId: "uncategorized",
        completed: false,
      },
    ];

    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      26,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 27, 0, 0, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(true);
    expect(result.appStorage.data.todos).toEqual([
      {
        id: "todo-1",
        name: "Todo 1",
        order: 0,
        categoryId: "uncategorized",
        completed: false,
      },
      {
        id: "todo-2",
        name: "Todo 2",
        order: 1,
        categoryId: "uncategorized",
        completed: false,
      },
    ]);
  });

  test("月が変わった場合はすべての Todo を未完了にする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "Todo",
        order: 0,
        categoryId: "uncategorized",
        completed: true,
      },
    ];

    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      31,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 8, 1, 0, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(true);
    expect(result.appStorage.data.todos[0].completed).toBe(false);
  });

  test("年が変わった場合はすべての Todo を未完了にする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "Todo",
        order: 0,
        categoryId: "uncategorized",
        completed: true,
      },
    ];

    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      11,
      31,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2027, 0, 1, 0, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(true);
    expect(result.appStorage.data.todos[0].completed).toBe(false);
  });

  test("完了と未完了が混在する複数の Todo をすべて未完了にする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "完了済み Todo",
        order: 0,
        categoryId: "uncategorized",
        completed: true,
      },
      {
        id: "todo-2",
        name: "未完了 Todo",
        order: 1,
        categoryId: "uncategorized",
        completed: false,
      },
      {
        id: "todo-3",
        name: "完了済み Todo",
        order: 2,
        categoryId: "uncategorized",
        completed: true,
      },
    ];

    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      26,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 27, 12, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(true);
    expect(result.appStorage.data.todos.every((todo) => !todo.completed)).toBe(
      true,
    );
  });
});

describe("validateIntegrity", () => {
  test("Category.id が重複している場合はエラーをスローする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.categories.push(
      {
        id: "category-1",
        name: "カテゴリ1",
      },
      {
        id: "category-1",
        name: "カテゴリ2",
      },
    );

    // Act / Assert
    expect(() => validateIntegrity(appStorage)).toThrow(
      "Duplicate Category IDs found",
    );
  });

  test("未分類カテゴリが存在しない場合はエラーをスローする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.categories = appStorage.data.categories.filter(
      (category) => category.id !== DEFAULT_CATEGORY_ID,
    );

    // Act / Assert
    expect(() => validateIntegrity(appStorage)).toThrow(
      "Invalid default category",
    );
  });

  test("未分類カテゴリの名前が変更されている場合はエラーをスローする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    const defaultCategory = appStorage.data.categories.find(
      (category) => category.id === DEFAULT_CATEGORY_ID,
    )!;

    defaultCategory.name = "変更されたカテゴリ";

    // Act / Assert
    expect(() => validateIntegrity(appStorage)).toThrow(
      "Invalid default category",
    );
  });

  test("lastSelectedCategoryId が存在しない場合はエラーをスローする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.lastSelectedCategoryId = "category-not-found";

    // Act / Assert
    expect(() => validateIntegrity(appStorage)).toThrow(
      "Invalid lastSelectedCategoryId",
    );
  });

  test("Todo.categoryId が存在しない場合はエラーをスローする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "Todo",
        order: 0,
        categoryId: "category-not-found",
        completed: false,
      },
    ];

    // Act / Assert
    expect(() => validateIntegrity(appStorage)).toThrow(
      "Todo todo-1 references non-existent category category-not-found",
    );
  });

  test("Todo.id が重複している場合はエラーをスローする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "Todo 1",
        order: 0,
        categoryId: DEFAULT_CATEGORY_ID,
        completed: false,
      },
      {
        id: "todo-1",
        name: "Todo 2",
        order: 1,
        categoryId: DEFAULT_CATEGORY_ID,
        completed: false,
      },
    ];

    // Act / Assert
    expect(() => validateIntegrity(appStorage)).toThrow(
      "Duplicate Todo IDs found",
    );
  });
});
