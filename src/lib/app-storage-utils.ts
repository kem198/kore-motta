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

  // 差異があれば完了にしたとみなす
  const hadCompletedTodos = appStorage.data.todos.some(
    (todo) => todo.completed,
  );

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
    didMarkAllIncomplete: hadCompletedTodos,
  };
}

/**
 * Category ID が重複しているか否か。
 */
function hasDuplicateCategoryIds(
  categories: AppStorage["data"]["categories"],
): boolean {
  const categoryIds = new Set(categories.map((category) => category.id));

  return categoryIds.size !== categories.length;
}

/**
 * デフォルト (未分類) カテゴリが存在しないか否か。
 */
function hasMissingDefaultCategory(
  categories: AppStorage["data"]["categories"],
): boolean {
  return !categories.some((category) => category.id === DEFAULT_CATEGORY_ID);
}

/**
 * デフォルト (未分類) カテゴリの名前が変更されているか否か。
 */
function hasChangedDefaultCategoryName(
  categories: AppStorage["data"]["categories"],
): boolean {
  const defaultCategory = categories.find(
    (category) => category.id === DEFAULT_CATEGORY_ID,
  );

  return (
    defaultCategory !== undefined &&
    defaultCategory.name !== DEFAULT_CATEGORY_NAME
  );
}

/**
 * Todo が存在しないカテゴリを参照しているか否か。
 */
function hasInvalidTodoCategoryReferences(
  todos: AppStorage["data"]["todos"],
  categoryIds: Set<string>,
): boolean {
  return todos.some((todo) => !categoryIds.has(todo.categoryId));
}

/**
 * 選択中のカテゴリ ID が存在しないカテゴリを参照しているか否か。
 */
function hasInvalidSelectedCategoryId(
  selectedCategoryId: string,
  categoryIds: Set<string>,
): boolean {
  return !categoryIds.has(selectedCategoryId);
}

/**
 * Todo ID が重複しているか否か。
 */
function hasDuplicateTodoIds(todos: AppStorage["data"]["todos"]): boolean {
  const seenIds = new Set<string>();

  for (const todo of todos) {
    if (seenIds.has(todo.id)) {
      return true;
    }

    seenIds.add(todo.id);
  }

  return false;
}

/**
 * AppStorage の整合性を検証する。
 *
 * 以下の項目を検証し、不整合がある場合はエラーをスローする。
 *
 * - Category.id が一意であること
 * - 未分類カテゴリが存在すること
 * - 未分類カテゴリの名前が変更されていないこと
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
  if (hasDuplicateCategoryIds(storage.data.categories)) {
    throw new Error("Duplicate Category IDs found");
  }

  // 未分類カテゴリが存在すること
  if (hasMissingDefaultCategory(storage.data.categories)) {
    throw new Error("Invalid default category");
  }

  // 未分類カテゴリの名前が変更されていないこと
  if (hasChangedDefaultCategoryName(storage.data.categories)) {
    throw new Error("Invalid default category");
  }

  // lastSelectedCategoryId が存在するカテゴリを参照していること
  if (
    hasInvalidSelectedCategoryId(
      storage.data.lastSelectedCategoryId,
      categoryIds,
    )
  ) {
    throw new Error("Invalid lastSelectedCategoryId");
  }

  // Todo のカテゴリ参照の整合性
  storage.data.todos.forEach((todo) => {
    if (!categoryIds.has(todo.categoryId)) {
      throw new Error(
        `Todo ${todo.id} references non-existent category ${todo.categoryId}`,
      );
    }
  });

  // Todo ID が一意であること
  if (hasDuplicateTodoIds(storage.data.todos)) {
    throw new Error("Duplicate Todo IDs found");
  }
}

/**
 * AppStorage の整合性を検証し、必要に応じて修復した新しい AppStorage を返す。
 *
 * - カテゴリが壊れている
 *     ⇒ カテゴリを初期化し、全 Todo を未分類に再割り当てする。
 * - Todo のカテゴリ参照が壊れている
 *     ⇒ Todo をデフォルトカテゴリに再割り当てする。
 * - ID が重複する Todo が存在する
 *     ⇒ 2 件目以降の ID を一意な UUID に再生成する。
 * - 選択中のカテゴリの ID が存在しない
 *     ⇒ 未分類カテゴリに再割り当てする。
 *
 * @param appStorage 修復対象の AppStorage オブジェクト
 * @returns 修復済みの新しい AppStorage オブジェクト
 */
export function repairAppStorage(appStorage: AppStorage): AppStorage {
  const data = { ...appStorage.data };
  const categoryIds = new Set(data.categories.map((category) => category.id));

  // カテゴリ構造が壊れていればカテゴリを初期化する
  if (
    hasDuplicateCategoryIds(data.categories) ||
    hasMissingDefaultCategory(data.categories) ||
    hasChangedDefaultCategoryName(data.categories)
  ) {
    data.categories = DEFAULT_CATEGORIES_STORAGE.map((category) => ({
      ...category,
    }));

    categoryIds.clear();
    data.categories.forEach((category) => {
      categoryIds.add(category.id);
    });
  }

  // 選択カテゴリ ID の整合性修復
  if (hasInvalidSelectedCategoryId(data.lastSelectedCategoryId, categoryIds)) {
    data.lastSelectedCategoryId = DEFAULT_CATEGORY_ID;
  }

  // Todo のカテゴリ参照の整合性修復
  if (hasInvalidTodoCategoryReferences(data.todos, categoryIds)) {
    data.todos = data.todos.map((todo) => {
      if (!categoryIds.has(todo.categoryId)) {
        return { ...todo, categoryId: DEFAULT_CATEGORY_ID };
      }

      return todo;
    });
  }

  // Todo ID の一意性修復
  if (hasDuplicateTodoIds(data.todos)) {
    const seenIds = new Set<string>();

    data.todos = data.todos.map((todo) => {
      if (seenIds.has(todo.id)) {
        const newId =
          typeof crypto !== "undefined" &&
          crypto &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              });

        seenIds.add(newId);

        return { ...todo, id: newId };
      }

      seenIds.add(todo.id);
      return todo;
    });
  }

  return {
    ...appStorage,
    data,
  };
}
