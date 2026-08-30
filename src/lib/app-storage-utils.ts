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
