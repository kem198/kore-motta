import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import { AppStorage } from "@/schemas/app-storage-schema";
import { Todo } from "@/schemas/todo-schema";

/**
 * Todo の並び順を変更する。
 *
 * @param todos 対象の Todo
 * @param startIndex 移動元のインデックス
 * @param endIndex 移動先のインデックス
 * @returns 並び替え後の Todo
 */
export function reorderTodos(
  todos: Todo[],
  startIndex: number,
  endIndex: number,
): Todo[] {
  // 範囲外のインデックスでは splice が undefined を返すため、元の配列を返す
  if (
    startIndex < 0 ||
    startIndex >= todos.length ||
    endIndex < 0 ||
    endIndex >= todos.length
  ) {
    return todos;
  }

  const newTodos = [...todos];
  const [removed] = newTodos.splice(startIndex, 1);

  newTodos.splice(endIndex, 0, removed);

  return newTodos.map((todo, index) => ({
    ...todo,
    order: index,
  }));
}

/**
 * Todo を末尾に追加する際の order を返す。
 * 表示されているカテゴリ内の Todo を元に order を割り振る
 *
 * @param todos 対象の Todo
 * @returns 次に使用する order
 */
export function getNextTodoOrder(todos: Todo[]): number {
  return todos.reduce((max, todo) => Math.max(max, todo.order), -1) + 1;
}

/**
 * 指定したカテゴリを削除し、そのカテゴリに属する Todo をデフォルトカテゴリへ移動する。
 *
 * 移動した Todo には、デフォルトカテゴリ内の既存 Todo の末尾から
 * 連続した order を割り当てる。
 *
 * @param data 現在の AppStorage の data
 * @param categoryId 削除するカテゴリの ID
 * @returns カテゴリ削除後の AppStorage の data
 */
export function deleteCategory(
  data: AppStorage["data"],
  categoryId: string,
): AppStorage["data"] {
  if (categoryId === DEFAULT_CATEGORY_ID) {
    return data;
  }

  const defaultCategoryTodos = data.todos.filter(
    (todo) => todo.categoryId === DEFAULT_CATEGORY_ID,
  );

  const categoryTodos = data.todos
    .filter((todo) => todo.categoryId === categoryId)
    .toSorted((a, b) => a.order - b.order);

  const nextOrder = getNextTodoOrder(defaultCategoryTodos);

  const migratedTodoOrders = new Map(
    categoryTodos.map((todo, index) => [todo.id, nextOrder + index]),
  );

  return {
    ...data,
    todos: data.todos.map((todo) => {
      const order = migratedTodoOrders.get(todo.id);

      if (order === undefined) {
        return todo;
      }

      return {
        ...todo,
        categoryId: DEFAULT_CATEGORY_ID,
        order,
      };
    }),
    categories: data.categories.filter(
      (category) => category.id !== categoryId,
    ),
  };
}
