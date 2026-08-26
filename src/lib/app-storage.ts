import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";
import { Todo } from "@/schemas/todo-schema";

export const APP_STORAGE_KEY = "appStorage";

export function createInitialAppStorage(): AppStorage {
  // 初期値は実行日当日の 00:00:00.000 とする
  // 例: "2026-08-24T15:00:00.000Z"
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return {
    version: CURRENT_APP_STORAGE_VERSION,
    data: {
      settings: {},
      categories: DEFAULT_CATEGORIES_STORAGE,
      todos: [],
      lastMarkedAllIncompleteAt: now.toISOString(),
      lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
    },
  };
}

/**
 * 前回リセット日時と現在のローカル日付を比較して、日付が変わっていなければ、そのまま返す。
 *
 * 日付が変わっていれば下記の処理を行われた AppStorage を返す。
 *
 * - todos を未完了にする
 * - lastMarkedAllIncompleteAt を現在日時にする
 * @param appStorage
 * @returns
 */
function markAllIncompleteIfNeeded(appStorage: AppStorage): AppStorage {
  const now = new Date();

  const lastMarkedAllIncompleteAt = new Date(
    appStorage.data.lastMarkedAllIncompleteAt,
  );

  const isSameDate =
    now.getFullYear() === lastMarkedAllIncompleteAt.getFullYear() &&
    now.getMonth() === lastMarkedAllIncompleteAt.getMonth() &&
    now.getDate() === lastMarkedAllIncompleteAt.getDate();

  if (isSameDate) {
    return appStorage;
  }

  return {
    ...appStorage,
    data: {
      ...appStorage.data,
      todos: appStorage.data.todos.map((todo) => ({
        ...todo,
        completed: false,
      })),
      lastMarkedAllIncompleteAt: now.toISOString(),
    },
  };
}

export function loadAppStorage(storageKey = APP_STORAGE_KEY): AppStorage {
  if (typeof window === "undefined") {
    return createInitialAppStorage();
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    const initialStorage = createInitialAppStorage();
    saveAppStorage(initialStorage, storageKey);
    return initialStorage;
  }

  const appStorage = parseAppStorage(JSON.parse(raw));
  return markAllIncompleteIfNeeded(appStorage);
}

export function saveAppStorage(
  appStorage: AppStorage,
  storageKey = APP_STORAGE_KEY,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(appStorage));
}

export function importAppStorage(data: string): AppStorage {
  return parseAppStorage(JSON.parse(data));
}

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
 * @param appStorage 現在の AppStorage
 * @param categoryId 削除するカテゴリの ID
 * @returns カテゴリ削除後の AppStorage
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
