process.env.TZ = "Asia/Tokyo";
import { describe, expect, test } from "vitest";

import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import {
  createInitialAppStorage,
  markAllIncompleteIfDateChanged,
  repairAppStorage,
  validateIntegrity,
} from "@/lib/app-storage-utils";
import { AppStorage } from "@/schemas/app-storage-schema";

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

describe("repairAppStorage", () => {
  describe("問題ない場合", () => {
    test("整合性に問題がない場合はデータを変更せずにそのまま返すこと", () => {
      // Arrange
      const validStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [
            { id: DEFAULT_CATEGORY_ID, name: "未分類" },
            { id: "cat-1", name: "仕事" },
          ],
          todos: [
            {
              id: "todo-1",
              name: "タスク1",
              order: 0,
              categoryId: "cat-1",
              memo: "メモ1",
              completed: false,
            },
          ],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: "cat-1",
        },
      };

      // Act
      const result = repairAppStorage(validStorage);

      // Assert
      expect(result).toEqual(validStorage);
    });
  });

  describe("カテゴリ系の修復", () => {
    test("未分類カテゴリの名前が変更されている場合、カテゴリを初期化し Todo を未分類に変更すること", () => {
      // Arrange
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [
            { id: DEFAULT_CATEGORY_ID, name: "変更された名前" },
            { id: "cat-1", name: "旅行" },
          ],
          todos: [
            {
              id: "todo-1",
              name: "鍵",
              order: 0,
              categoryId: "cat-1",
              memo: "家の鍵",
              completed: true,
            },
          ],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: "cat-1",
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      expect(result.data.categories).toEqual(DEFAULT_CATEGORIES_STORAGE);
      expect(result.data.lastSelectedCategoryId).toBe(DEFAULT_CATEGORY_ID);
      expect(result.data.todos).toEqual([
        {
          id: "todo-1",
          name: "鍵",
          order: 0,
          categoryId: DEFAULT_CATEGORY_ID,
          memo: "家の鍵",
          completed: true,
        },
      ]);
    });

    test("未分類カテゴリが存在しない場合、カテゴリを初期化すること", () => {
      // Arrange
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [{ id: "cat-1", name: "プライベート" }],
          todos: [],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: "cat-1",
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      expect(result.data.categories).toEqual(DEFAULT_CATEGORIES_STORAGE);
      expect(result.data.lastSelectedCategoryId).toBe(DEFAULT_CATEGORY_ID);
    });

    test("Category.id に重複がある場合、カテゴリを初期化すること", () => {
      // Arrange
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [
            { id: DEFAULT_CATEGORY_ID, name: "未分類" },
            { id: "dup-cat", name: "カテゴリA" },
            { id: "dup-cat", name: "カテゴリB" },
          ],
          todos: [],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      expect(result.data.categories).toEqual(DEFAULT_CATEGORIES_STORAGE);
    });

    test("lastSelectedCategoryId が存在しないカテゴリを参照している場合、未分類に変更すること", () => {
      // Arrange
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
          todos: [],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: "ghost-category",
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      expect(result.data.categories).toEqual(DEFAULT_CATEGORIES_STORAGE);
      expect(result.data.lastSelectedCategoryId).toBe(DEFAULT_CATEGORY_ID);
    });

    test("Todo.categoryId が存在しないカテゴリを参照している場合、カテゴリを初期化し Todo を未分類にすること", () => {
      // Arrange
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
          todos: [
            {
              id: "todo-1",
              name: "パスポート",
              order: 0,
              categoryId: "non-existent-cat",
              memo: "",
              completed: false,
            },
          ],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      expect(result.data.categories).toEqual(DEFAULT_CATEGORIES_STORAGE);
      expect(result.data.todos[0].categoryId).toBe(DEFAULT_CATEGORY_ID);
      expect(result.data.todos[0].name).toBe("パスポート");
    });
  });

  describe("Todo ID 重複の修復", () => {
    test("Todo.id が重複している場合、1件目を維持し2件目以降の ID を再生成すること", () => {
      // Arrange
      const duplicateId = "shared-todo-id";
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
          todos: [
            {
              id: duplicateId,
              name: "1件目",
              order: 0,
              categoryId: DEFAULT_CATEGORY_ID,
              memo: "メモ1",
              completed: false,
            },
            {
              id: duplicateId,
              name: "2件目",
              order: 1,
              categoryId: DEFAULT_CATEGORY_ID,
              memo: "メモ2",
              completed: true,
            },
          ],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      const todos = result.data.todos;
      expect(todos[0].id).toBe(duplicateId);
      expect(todos[1].id).not.toBe(duplicateId);

      const ids = todos.map((t) => t.id);
      expect(new Set(ids).size).toBe(2);

      expect(todos[1].name).toBe("2件目");
      expect(todos[1].memo).toBe("メモ2");
      expect(todos[1].completed).toBe(true);
      expect(todos[1].categoryId).toBe(DEFAULT_CATEGORY_ID);
    });

    test("重複していない Todo.id は変更しないこと", () => {
      // Arrange
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
          todos: [
            {
              id: "unique-1",
              name: "タスク1",
              order: 0,
              categoryId: DEFAULT_CATEGORY_ID,
              memo: "",
              completed: false,
            },
            {
              id: "dup-id",
              name: "タスク2",
              order: 1,
              categoryId: DEFAULT_CATEGORY_ID,
              memo: "",
              completed: false,
            },
            {
              id: "dup-id",
              name: "タスク3",
              order: 2,
              categoryId: DEFAULT_CATEGORY_ID,
              memo: "",
              completed: false,
            },
          ],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      const todos = result.data.todos;
      expect(todos[0].id).toBe("unique-1");
      expect(todos[1].id).toBe("dup-id");
      expect(todos[2].id).not.toBe("dup-id");
    });
  });

  describe("複合不整合の修復", () => {
    test("カテゴリ系の不整合と Todo ID の重複が同時に発生している場合、一回の呼び出しでまとめて修復すること", () => {
      // Arrange
      const duplicateId = "dup-todo-id";
      const invalidStorage: AppStorage = {
        version: 2,
        data: {
          settings: { todoTogglePosition: "left" },
          categories: [
            { id: DEFAULT_CATEGORY_ID, name: "壊れた未分類名" },
            { id: "cat-1", name: "仕事" },
          ],
          todos: [
            {
              id: duplicateId,
              name: "資料作成",
              order: 0,
              categoryId: "cat-1",
              memo: "",
              completed: false,
            },
            {
              id: duplicateId,
              name: "メール送信",
              order: 1,
              categoryId: "non-existent-cat",
              memo: "",
              completed: true,
            },
          ],
          lastMarkedAllIncompleteAt: "2026-08-24T00:00:00.000+09:00",
          lastSelectedCategoryId: "cat-1",
        },
      };

      // Act
      const result = repairAppStorage(invalidStorage);

      // Assert
      expect(result.data.categories).toEqual(DEFAULT_CATEGORIES_STORAGE);
      expect(result.data.lastSelectedCategoryId).toBe(DEFAULT_CATEGORY_ID);

      const todos = result.data.todos;
      expect(todos[0].categoryId).toBe(DEFAULT_CATEGORY_ID);
      expect(todos[1].categoryId).toBe(DEFAULT_CATEGORY_ID);

      expect(todos[0].id).toBe(duplicateId);
      expect(todos[1].id).not.toBe(duplicateId);
      expect(new Set(todos.map((t) => t.id)).size).toBe(2);

      expect(todos[0].name).toBe("資料作成");
      expect(todos[1].name).toBe("メール送信");
      expect(todos[1].completed).toBe(true);
    });
  });
});
