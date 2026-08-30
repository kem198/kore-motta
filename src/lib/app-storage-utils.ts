import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_NAME,
} from "@/constants/categories";
import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { AppStorage } from "@/schemas/app-storage-schema";

/**
 * AppStorage の localStorage キー。
 */
export const APP_STORAGE_KEY = "appStorage";

/**
 * AppStorage の初期値を作成する。
 *
 * `lastMarkedAllIncompleteAt` には、実行日当日の 00:00:00.000 を設定する。
 * - 例: `"2026-08-24T15:00:00.000Z"`
 *
 * @returns 初期状態の AppStorage
 */
export function createInitialAppStorage(): AppStorage {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return {
    version: CURRENT_APP_STORAGE_VERSION,
    data: {
      settings: {
        todoTogglePosition: "left",
      },
      categories: DEFAULT_CATEGORIES_STORAGE.map((category) => ({
        ...category,
      })),
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
 * AppStorage のデータ間の整合性を検証する。
 *
 * 以下の項目を検証し、不整合がある場合はエラーをスローする。
 *
 * - Category.id が一意であること
 * - 未分類カテゴリが存在し、ID と名前が変更されていないこと
 * - `lastSelectedCategoryId` が存在するカテゴリを参照していること
 * - Todo の `categoryId` が存在するカテゴリを参照していること
 * - Todo.id が一意であること
 *
 * @param storage 検証対象の AppStorage
 * @throws {Error} AppStorage のデータに整合性の不備がある場合
 */
export function validateIntegrity(storage: AppStorage): void {
  const categoryIds = new Set(
    storage.data.categories.map((category) => category.id),
  );

  // Category.id が一意であること
  if (categoryIds.size !== storage.data.categories.length) {
    throw new Error("Duplicate Category IDs found");
  }

  // 未分類カテゴリが存在し、名前が変更されていないこと
  const defaultCategory = storage.data.categories.find(
    (category) => category.id === DEFAULT_CATEGORY_ID,
  );
  if (
    defaultCategory === undefined ||
    defaultCategory.name !== DEFAULT_CATEGORY_NAME
  ) {
    throw new Error("Invalid default category");
  }

  // lastSelectedCategoryId が存在するカテゴリを参照していること
  if (!categoryIds.has(storage.data.lastSelectedCategoryId)) {
    throw new Error("Invalid lastSelectedCategoryId");
  }

  // Todo.categoryId が存在するカテゴリを参照していること
  storage.data.todos.forEach((todo) => {
    if (!categoryIds.has(todo.categoryId)) {
      throw new Error(
        `Todo ${todo.id} references non-existent category ${todo.categoryId}`,
      );
    }
  });

  // Todo.id が一意であること
  const todoIds = new Set(storage.data.todos.map((todo) => todo.id));
  if (todoIds.size !== storage.data.todos.length) {
    throw new Error("Duplicate Todo IDs found");
  }
}

/**
 * AppStorage の整合性を検証し、必要に応じて修復した新しい AppStorage を返す。
 *
 * - カテゴリ系の不整合修復:
 *   - カテゴリの重複やデフォルトカテゴリの破損を検知し、カテゴリを初期化して全 Todo を未分類に再割り当てする。
 *   - 選択中のカテゴリIDが不正な場合はデフォルトカテゴリにリセットする。
 * - Todo のカテゴリ参照修復:
 *   - 存在しないカテゴリを参照している Todo をデフォルトカテゴリに再割り当てする。
 * - Todo ID の重複修復:
 *   - 重複する ID を持つ Todo を検知し、2件目以降の ID を一意な UUID に再生成する。
 *
 * @param storage 修復対象の AppStorage オブジェクト
 * @returns 修復済みの新しい AppStorage オブジェクト
 */
export function repairAppStorage(storage: AppStorage): AppStorage {
  const data = { ...storage.data };

  // 1. カテゴリ構造の検証と修復
  const categoryIds = new Set(data.categories.map((c) => c.id));
  const defaultCategory = data.categories.find(
    (c) => c.id === DEFAULT_CATEGORY_ID,
  );
  const hasDuplicateCategories = categoryIds.size !== data.categories.length;
  const isDefaultCategoryInvalid =
    !defaultCategory || defaultCategory.name !== DEFAULT_CATEGORY_NAME;

  if (hasDuplicateCategories || isDefaultCategoryInvalid) {
    data.categories = DEFAULT_CATEGORIES_STORAGE.map((c) => ({ ...c }));
    categoryIds.clear();
    categoryIds.add(DEFAULT_CATEGORY_ID);
  }

  // 2. 選択カテゴリIDの整合性修復
  if (!categoryIds.has(data.lastSelectedCategoryId)) {
    data.lastSelectedCategoryId = DEFAULT_CATEGORY_ID;
  }

  // 3. Todo のカテゴリ参照の整合性修復
  let hasTodoCategoryModified = false;
  const repairedTodos = data.todos.map((todo) => {
    if (!categoryIds.has(todo.categoryId)) {
      hasTodoCategoryModified = true;
      return { ...todo, categoryId: DEFAULT_CATEGORY_ID };
    }
    return todo;
  });
  if (hasTodoCategoryModified) {
    data.todos = repairedTodos;
  }

  // 4. Todo ID の一意性修復
  const seenIds = new Set<string>();
  data.todos = data.todos.map((todo) => {
    if (seenIds.has(todo.id)) {
      const newId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
      return { ...todo, id: newId };
    }
    seenIds.add(todo.id);
    return todo;
  });

  return {
    ...storage,
    data,
  };
}
