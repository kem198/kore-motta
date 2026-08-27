import { describe, expect, it } from "vitest";

import { deleteCategory, reorderTodos } from "@/lib/todo-utils";
import { Todo } from "@/schemas/todo-schema";

const createTodo = (
  id: string,
  order: number,
  completed = false,
  categoryId = "uncategorized",
): Todo => ({
  id,
  name: `Todo ${id}`,
  order,
  categoryId,
  completed,
});

describe("reorderTodos", () => {
  it("Todoを前から後ろへ移動する", () => {
    // Arrange
    const todos = [
      createTodo("todo-1", 0),
      createTodo("todo-2", 1),
      createTodo("todo-3", 2),
    ];

    // Act
    const result = reorderTodos(todos, 0, 2);

    // Assert
    expect(result).toEqual([
      createTodo("todo-2", 0),
      createTodo("todo-3", 1),
      createTodo("todo-1", 2),
    ]);
  });

  it("Todoを後ろから前へ移動する", () => {
    // Arrange
    const todos = [
      createTodo("todo-1", 0),
      createTodo("todo-2", 1),
      createTodo("todo-3", 2),
    ];

    // Act
    const result = reorderTodos(todos, 2, 0);

    // Assert
    expect(result).toEqual([
      createTodo("todo-3", 0),
      createTodo("todo-1", 1),
      createTodo("todo-2", 2),
    ]);
  });

  it("範囲外のインデックスの場合は元の配列を返す", () => {
    // Arrange
    const todos = [
      createTodo("todo-1", 0),
      createTodo("todo-2", 1),
      createTodo("todo-3", 2),
    ];

    // Act
    const result = reorderTodos(todos, -1, 2);

    // Assert
    expect(result).toBe(todos);
  });
});

describe("deleteCategory", () => {
  it("指定したカテゴリを削除し、そのカテゴリのTodoを未分類へ移動する", () => {
    // Arrange
    const data = {
      settings: {},
      categories: [
        {
          id: "uncategorized",
          name: "未分類",
          order: 0,
        },
        {
          id: "category-1",
          name: "カテゴリ1",
          order: 1,
        },
      ],
      todos: [
        createTodo("todo-1", 0, false, "uncategorized"),
        createTodo("todo-2", 0, false, "category-1"),
        createTodo("todo-3", 1, false, "category-1"),
      ],
      lastMarkedAllIncompleteAt: new Date(2026, 7, 27).toISOString(),
      lastSelectedCategoryId: "category-1",
    };

    // Act
    const result = deleteCategory(data, "category-1");

    // Assert
    expect(result.categories).toEqual([
      {
        id: "uncategorized",
        name: "未分類",
        order: 0,
      },
    ]);

    expect(result.todos).toEqual([
      createTodo("todo-1", 0, false, "uncategorized"),
      createTodo("todo-2", 1, false, "uncategorized"),
      createTodo("todo-3", 2, false, "uncategorized"),
    ]);
  });

  it("未分類カテゴリを削除しようとした場合は変更しない", () => {
    // Arrange
    const data = {
      settings: {},
      categories: [
        {
          id: "uncategorized",
          name: "未分類",
          order: 0,
        },
      ],
      todos: [createTodo("todo-1", 0)],
      lastMarkedAllIncompleteAt: new Date(2026, 7, 27).toISOString(),
      lastSelectedCategoryId: "uncategorized",
    };

    // Act
    const result = deleteCategory(data, "uncategorized");

    // Assert
    expect(result).toBe(data);
  });
});
