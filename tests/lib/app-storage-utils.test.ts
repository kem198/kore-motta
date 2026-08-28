process.env.TZ = "Asia/Tokyo";
import { describe, expect, test } from "vitest";

import {
  createInitialAppStorage,
  markAllIncompleteIfDateChanged,
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
