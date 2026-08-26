import { DEFAULT_CATEGORIES_STORAGE } from "@/constants/categories";
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
  const newTodos = [...todos];
  const [removed] = newTodos.splice(startIndex, 1);

  newTodos.splice(endIndex, 0, removed);

  return newTodos.map((todo, index) => ({
    ...todo,
    order: index,
  }));
}
