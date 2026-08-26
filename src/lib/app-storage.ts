import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";
import { Todo } from "@/schemas/todo-schema";

/**
 * AppStorage の localStorage キー。
 */
export const APP_STORAGE_KEY = "appStorage";

/**
 * AppStorage の初期値を作成する。
 *
 * - lastMarkedAllIncompleteAt には、実行日当日の 00:00:00.000 を設定する。
 *   -  * 例: "2026-08-24T15:00:00.000Z"
 *
 * @returns 初期状態の AppStorage
 */
export function createInitialAppStorage(): AppStorage {
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

type MarkAllIncompleteResult = {
  appStorage: AppStorage;
  didMarkAllIncomplete: boolean;
};

/**
 * 日付が変わっている場合、すべての Todo を未完了にする。
 *
 * 日付が変わっていない場合は、AppStorage を変更せずに返す。
 *
 * @param appStorage 対象の AppStorage
 * @param now 現在日時
 * @returns 未完了化後の AppStorage と、未完了化を実行したかどうか
 */
export function markAllIncompleteIfDateChanged(
  appStorage: AppStorage,
  now = new Date(),
): MarkAllIncompleteResult {
  const lastMarkedAllIncompleteAt = new Date(
    appStorage.data.lastMarkedAllIncompleteAt,
  );

  const isSameDate =
    now.getFullYear() === lastMarkedAllIncompleteAt.getFullYear() &&
    now.getMonth() === lastMarkedAllIncompleteAt.getMonth() &&
    now.getDate() === lastMarkedAllIncompleteAt.getDate();

  if (isSameDate) {
    return {
      appStorage,
      didMarkAllIncomplete: false,
    };
  }

  return {
    appStorage: {
      ...appStorage,
      data: {
        ...appStorage.data,
        todos: appStorage.data.todos.map((todo) => ({
          ...todo,
          completed: false,
        })),
        lastMarkedAllIncompleteAt: now.toISOString(),
      },
    },
    didMarkAllIncomplete: true,
  };
}

/**
 * AppStorage の読み込みに失敗したことを表すエラー。
 *
 * JSON の解析または AppStorage のバリデーションに失敗した場合に使用する。
 */
export class AppStorageLoadError extends Error {
  constructor(
    public readonly rawData: string,
    cause: unknown,
  ) {
    super("Failed to load AppStorage.", { cause });
    this.name = "AppStorageLoadError";
  }
}

type AppStorageLoadResult = {
  appStorage: AppStorage;
  didMarkAllIncomplete: boolean;
};

/**
 * localStorage から AppStorage を読み込む。
 *
 * - 保存データが存在しない場合は初期データを作成して保存する。
 * - 保存データの日付が前回の未完了化日時と異なる場合は、すべての Todo を未完了にする。
 *
 * @param storageKey localStorage に使用するキー
 * @returns 読み込んだ AppStorage と、Todo を未完了化したかどうか
 * @throws {AppStorageLoadError} 保存データの JSON 解析または AppStorage のバリデーションに失敗した場合
 */
export function loadAppStorage(
  storageKey = APP_STORAGE_KEY,
): AppStorageLoadResult {
  if (typeof window === "undefined") {
    return {
      appStorage: createInitialAppStorage(),
      didMarkAllIncomplete: false,
    };
  }

  const raw = window.localStorage.getItem(storageKey);

  // localStorage にデータがない場合は初期データを作成して返す
  if (!raw) {
    const initialStorage = createInitialAppStorage();
    saveAppStorage(initialStorage, storageKey);

    return {
      appStorage: initialStorage,
      didMarkAllIncomplete: false,
    };
  }

  // JSON として解釈できなければ例外をスローする
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new AppStorageLoadError(raw, error);
  }

  // AppStorage 型として解釈できなければ例外をスローする
  let appStorage: AppStorage;
  try {
    appStorage = parseAppStorage(parsed);
  } catch (error) {
    throw new AppStorageLoadError(raw, error);
  }

  return markAllIncompleteIfDateChanged(appStorage);
}

/**
 * AppStorage を localStorage に保存する。
 *
 * @param appStorage 保存する AppStorage
 * @param storageKey localStorage に使用するキー
 */
export function saveAppStorage(
  appStorage: AppStorage,
  storageKey = APP_STORAGE_KEY,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(appStorage));
}

/**
 * JSON 文字列を AppStorage として解析する。
 *
 * @param data AppStorage の JSON 文字列
 * @returns 解析済みの AppStorage
 * @throws JSON の解析または AppStorage のバリデーションに失敗した場合
 */
export function importAppStorage(data: string): AppStorage {
  return parseAppStorage(JSON.parse(data));
}

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
