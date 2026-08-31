import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_NAME,
} from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { AppStorageV1 } from "@/lib/app-storage-migration";
import { APP_STORAGE_KEY } from "@/lib/app-storage-utils";
import { AppStorage } from "@/schemas/app-storage-schema";
import { Category } from "@/schemas/category-schema";
import { expect, Locator, Page, test } from "@playwright/test";

test.describe("Todo ページのテスト", () => {
  /** テストの Assert 範囲 */
  let assertScope: Locator;

  /**デフォルトのテスト実行日時 */
  const DEFAULT_CLOCK_TIME = new Date("2026-08-24T12:00:00+09:00");

  /**
   * Todo ページを初期状態を指定して表示するヘルパー。
   *
   * @param page - Playwright のページオブジェクト
   * @param options - ページ表示時に適用する初期設定
   * @param options.storage - ページ読み込み前に localStorage に設定するアプリケーションデータ
   * @param options.clockTime - ページ読み込み前に設定する仮想時刻
   */
  const navigateToTodoPage = async (
    page: Page,
    options: { storage?: AppStorage | AppStorageV1; clockTime?: Date } = {},
  ) => {
    const clockTime = options.clockTime ?? DEFAULT_CLOCK_TIME;
    await page.clock.install({
      time: clockTime,
    });
    // 現在時刻を固定して日時のストレージ保存確認を正確にする
    await page.clock.setFixedTime(clockTime);

    if (options.storage) {
      await page.addInitScript(
        ([key, value]) => {
          window.localStorage.setItem(key, value);
        },
        [APP_STORAGE_KEY, JSON.stringify(options.storage)],
      );
    }
    await page.goto("/");
  };

  /** localStorage の appStorage キーの値を取得するヘルパー */
  const getAppStorage = async (page: Page): Promise<AppStorage> =>
    page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      APP_STORAGE_KEY,
    );

  test.beforeEach(async ({ page }) => {
    // テスト対象の範囲を指定する
    assertScope = page.locator('[data-testid="todo"]');
  });

  test.describe("Todo の操作", () => {
    test.describe("表示時のテスト", () => {
      test("Todo が登録済みの状態で、画面が初期表示された時、登録済み Todo の各種情報が表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        // Act
        await navigateToTodoPage(page, { storage: appStorage });

        // Assert
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("家の鍵", { exact: true }),
        ).toBeVisible();
      });

      test("Todo とカテゴリが 1 つのストレージオブジェクトとして保存されること", async ({
        page,
      }) => {
        // Arrange
        const storage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "single-storage-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        // Act
        await navigateToTodoPage(page, { storage });

        // Assert
        const persisted = await getAppStorage(page);
        expect(persisted).not.toBeNull();

        const defaultCategory = persisted.data.categories.find(
          (category: Category) => category.id === DEFAULT_CATEGORY_ID,
        );
        expect(defaultCategory).toBeDefined();
        expect(defaultCategory?.name).toBe(DEFAULT_CATEGORY_NAME);

        const legacyCategoriesKeyValue = await page.evaluate(() =>
          localStorage.getItem("categories"),
        );
        expect(legacyCategoriesKeyValue).toBeNull();
      });

      test("日付が変わる前にページを再読み込みすると、完了済みの Todo が完了のままであること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const lastMarkedAllIncompleteAt = new Date("2026-08-24T00:00:00+09:00");
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            categories: DEFAULT_CATEGORIES_STORAGE,
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
            ],
            lastMarkedAllIncompleteAt: lastMarkedAllIncompleteAt.toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, {
          storage: appStorage,
          clockTime: beforeMidnight,
        });

        // Act
        // 当日にページを更新したことを再現する
        const afterMidnight = new Date("2026-08-24T23:59:59+09:00");
        await page.clock.setFixedTime(afterMidnight);
        // 再読み込みする
        await page.reload();

        // Assert: UI 上で Todo が完了のままであること
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: カギ",
          }),
        ).toHaveAttribute("aria-pressed", "true");

        // Assert: localStorage の completed が true のままであること
        const actualStorage = await getAppStorage(page);
        expect(actualStorage.data.todos).toEqual([
          {
            id: "test-todo",
            name: "カギ",
            order: 0,
            categoryId: DEFAULT_CATEGORY_ID,
            memo: "家の鍵",
            completed: true,
          },
        ]);

        // Assert: 最終未完了化日時が更新されていないこと
        expect(actualStorage.data.lastMarkedAllIncompleteAt).toBe(
          lastMarkedAllIncompleteAt.toISOString(),
        );
      });

      test("日付が変わってからページを再読み込みすると、完了済みの Todo が未完了になること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            categories: DEFAULT_CATEGORIES_STORAGE,
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, {
          storage: appStorage,
          clockTime: beforeMidnight,
        });

        // Act
        // 日付が変わった状態を再現する
        const afterMidnight = new Date("2026-08-25T00:00:00+09:00");
        await page.clock.setFixedTime(afterMidnight);
        // 再読み込みする
        await page.reload();

        // Assert: UI 上で Todo が未完了になっていること
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: カギ",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        // Assert: localStorage の completed が false になっていること
        const actualStorage = await getAppStorage(page);
        expect(actualStorage.data.todos).toEqual([
          {
            id: "test-todo",
            name: "カギ",
            order: 0,
            categoryId: DEFAULT_CATEGORY_ID,
            memo: "家の鍵",
            completed: false,
          },
        ]);

        // Assert: 最終未完了化日時が更新されていること
        expect(actualStorage.data.lastMarkedAllIncompleteAt).toBe(
          afterMidnight.toISOString(),
        );
      });

      // NOTE: バックグラウンド復帰時の日次未完了化を検証するテスト。
      // ブラウザのバックグラウンド復帰を Playwright で安定して再現できないため、意図的にスキップしている。
      // 代わりに打鍵テストでテストを実施済み。
      test.skip("日付が変わってからバックグラウンドから復帰すると、完了済みの Todo が未完了になること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");
        const lastMarkedAllIncompleteAt = new Date("2026-08-24T00:00:00+09:00");

        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            categories: DEFAULT_CATEGORIES_STORAGE,
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
            ],
            lastMarkedAllIncompleteAt: lastMarkedAllIncompleteAt.toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, {
          storage: appStorage,
          clockTime: beforeMidnight,
        });

        // Act
        // バックグラウンドに移行したことを再現する
        await page.evaluate(() => {
          Object.defineProperty(document, "visibilityState", {
            value: "hidden",
            writable: true,
            configurable: true,
          });
          document.dispatchEvent(new Event("visibilitychange"));
        });

        // 日付が変わった状態を再現する
        const afterMidnight = new Date("2026-08-25T00:00:00+09:00");
        await page.clock.setFixedTime(afterMidnight);

        // Assert
        // 日付が変わっただけでは未完了化されていないこと
        const storageWhileHidden = await getAppStorage(page);

        expect(storageWhileHidden.data.todos).toEqual(appStorage.data.todos);

        expect(storageWhileHidden.data.lastMarkedAllIncompleteAt).toBe(
          lastMarkedAllIncompleteAt.toISOString(),
        );

        // Act
        // バックグラウンドから復帰したことを再現する
        await page.evaluate(() => {
          Object.defineProperty(document, "visibilityState", {
            value: "visible",
            writable: true,
            configurable: true,
          });
          document.dispatchEvent(new Event("visibilitychange"));
        });

        // Assert
        // 復帰時に Todo が未完了になっていること
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: カギ",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        const actualStorage = await getAppStorage(page);

        expect(actualStorage.data.todos).toEqual([
          {
            id: "test-todo",
            name: "カギ",
            order: 0,
            categoryId: DEFAULT_CATEGORY_ID,
            memo: "家の鍵",
            completed: false,
          },
        ]);

        expect(actualStorage.data.lastMarkedAllIncompleteAt).toBe(
          afterMidnight.toISOString(),
        );
      });

      // NOTE: バックグラウンド復帰時の日次未完了化を検証するテスト。
      // ブラウザのバックグラウンド復帰を Playwright で安定して再現できないため、意図的にスキップしている。
      // 代わりに打鍵テストでテストを実施済み。
      test.skip("日付が変わる前にバックグラウンドから復帰すると、完了済みの Todo が完了のままであること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");
        const lastMarkedAllIncompleteAt = new Date("2026-08-24T00:00:00+09:00");

        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            categories: DEFAULT_CATEGORIES_STORAGE,
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
            ],
            lastMarkedAllIncompleteAt: lastMarkedAllIncompleteAt.toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, {
          storage: appStorage,
          clockTime: beforeMidnight,
        });

        // Act
        // バックグラウンドに移行したことを再現する
        await page.evaluate(() => {
          Object.defineProperty(document, "visibilityState", {
            value: "hidden",
            writable: true,
            configurable: true,
          });
          document.dispatchEvent(new Event("visibilitychange"));
        });

        // Assert: バックグラウンド移行後も Todo が完了のままであること
        const storageWhileHidden = await getAppStorage(page);
        expect(storageWhileHidden.data.todos).toEqual(appStorage.data.todos);

        // 当日にフォアグラウンドへ復帰したことを再現する
        await page.evaluate(() => {
          Object.defineProperty(document, "visibilityState", {
            value: "visible",
            writable: true,
            configurable: true,
          });
          document.dispatchEvent(new Event("visibilitychange"));
        });

        // Assert: UI 上で Todo が完了のままであること
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: カギ",
          }),
        ).toHaveAttribute("aria-pressed", "true");

        // Assert: localStorage の completed が true のままであること
        const actualStorage = await getAppStorage(page);
        expect(actualStorage.data.todos).toEqual(appStorage.data.todos);

        // Assert: 最終未完了化日時が更新されていないこと
        expect(actualStorage.data.lastMarkedAllIncompleteAt).toBe(
          lastMarkedAllIncompleteAt.toISOString(),
        );
      });

      test("v1 のデータが保存されている状態でアプリを起動すると、既存の Todo とカテゴリを引き継いで利用できること", async ({
        page,
      }) => {
        // Arrange
        const appStorageV1 = {
          version: 1,
          data: {
            settings: {},
            todos: [
              {
                id: "migration-todo",
                name: "カギ",
                order: 0,
                categoryId: "work",
                memo: "家の鍵",
                completed: false,
              },
            ],
            categories: [
              {
                id: "uncategorized",
                name: "未分類",
                order: 0,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-30T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: "work",
          },
        } satisfies AppStorageV1;

        // Act
        await navigateToTodoPage(page, { storage: appStorageV1 });

        // Assert (引き継ぐデータが表示されていること)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("家の鍵", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("仕事", { exact: true }),
        ).toBeVisible();

        // Assert (移行対象の情報が更新されていること)
        const actualStorage = await getAppStorage(page);
        expect(actualStorage.version).toBe(2);
        expect(actualStorage.data.settings.todoTogglePosition).toBe("left");
        expect(actualStorage.data.categories[0]).not.toHaveProperty("order");
      });
    });

    test.describe("作成時のテスト", () => {
      test("Todo を登録できること", async ({ page }) => {
        // Arrange
        await navigateToTodoPage(page);
        const nameInput = page.getByRole("textbox", { name: "新しいアイテム" });

        // Act
        await nameInput.fill("カギ");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert (表示が正しいこと)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();

        // Assert (データストアへ登録されていること)
        const appStorage: AppStorage = await getAppStorage(page);
        expect(appStorage.data.todos[0].name).toBe("カギ");
      });

      test("Todo が登録されている状態で新規 Todo を登録した時、末尾へ追加されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "dummy",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });
        const nameInput = page.getByRole("textbox", { name: "新しいアイテム" });

        // Act
        await nameInput.fill("カギ");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert (表示順が正しいこと)
        const todoItems = page.getByRole("listitem");
        await expect(todoItems).toHaveCount(2);
        await expect(todoItems.nth(0)).toHaveAccessibleName("Todo: dummy");
        await expect(todoItems.nth(1)).toHaveAccessibleName("Todo: カギ");
      });
    });

    test.describe("更新時のテスト", () => {
      test("Todo を編集できること", async ({ page }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "dummy",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "編集: dummy" }).click();
        await page.getByRole("textbox", { name: "タイトル *" }).fill("カギ");
        await page.getByRole("textbox", { name: "メモ" }).fill("家の鍵");

        // Act
        await page.getByRole("button", { name: "更新" }).click();

        // Assert (表示が正しいこと)
        await expect(assertScope.getByText("カギ").first()).toBeVisible();
        await expect(assertScope.getByText("家の鍵").first()).toBeVisible();

        // Assert (データストアへ登録されていること)
        const persisted: AppStorage = await getAppStorage(page);
        expect(persisted.version).toBe(2);
        expect(persisted.data.todos[0].name).toBe("カギ");
      });

      test("未完了 Todo の完了ボタンを押したとき、完了済みにできること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page
          .getByRole("button", {
            name: "完了状態を切り替え: 資料作成",
          })
          .click();

        // Assert (表示が正しいこと)
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: 資料作成",
          }),
        ).toHaveAttribute("aria-pressed", "true");

        // Assert (データストアへ登録されていること)
        const persisted = await getAppStorage(page);

        expect(persisted.version).toBe(2);
        expect(persisted.data.todos[0]).toEqual(
          expect.objectContaining({
            id: "dummy-todo",
            name: "資料作成",
            completed: true,
          }),
        );
      });

      test("完了済み Todo の完了ボタンを押したとき、未完了にできること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: true,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page
          .getByRole("button", {
            name: "完了状態を切り替え: 資料作成",
          })
          .click();

        // Assert (表示が正しいこと)
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: 資料作成",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        // Assert (データストアへ登録されていること)
        const persisted = await getAppStorage(page);

        expect(persisted.version).toBe(2);
        expect(persisted.data.todos[0]).toEqual(
          expect.objectContaining({
            id: "dummy-todo",
            name: "資料作成",
            completed: false,
          }),
        );
      });

      test("すべて未完了に戻す操作をしたとき、カテゴリをまたいですべての Todo を未完了にできること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "complete-todo-1",
                name: "メール確認",
                order: 1,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: true,
              },
              {
                id: "complete-todo-2",
                name: "会議資料確認",
                order: 2,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: true,
              },
              {
                id: "temporary-todo-1",
                name: "仮Todo 1",
                order: 0,
                categoryId: "temporary-category",
                completed: true,
              },
              {
                id: "temporary-todo-2",
                name: "仮Todo 2",
                order: 1,
                categoryId: "temporary-category",
                completed: false,
              },
            ],
            categories: [
              ...DEFAULT_CATEGORIES_STORAGE,
              {
                id: "temporary-category",
                name: "仮カテゴリ",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page
          .getByRole("menuitem", { name: "すべて未完了に戻す" })
          .click();

        // Assert (現在カテゴリの表示が正しいこと)
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: 資料作成",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: メール確認",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: 会議資料確認",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        // Assert (別カテゴリの表示が正しいこと)
        await assertScope.getByRole("button", { name: "仮カテゴリ" }).click();

        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: 仮Todo 1",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: 仮Todo 2",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        // Assert (データストアへ登録されていること)
        const persisted = await getAppStorage(page);

        expect(persisted.version).toBe(2);
        expect(persisted.data.todos).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "dummy-todo",
              completed: false,
            }),
            expect.objectContaining({
              id: "complete-todo-1",
              completed: false,
            }),
            expect.objectContaining({
              id: "complete-todo-2",
              completed: false,
            }),
            expect.objectContaining({
              id: "temporary-todo-1",
              completed: false,
            }),
            expect.objectContaining({
              id: "temporary-todo-2",
              completed: false,
            }),
          ]),
        );

        // 最終未完了日時が想定の日時で保存されていること
        expect(persisted.data.lastMarkedAllIncompleteAt).toBe(
          new Date("2026-08-24T03:00:00.000Z").toISOString(),
        );
      });

      test("Todo の編集画面に現在のカテゴリ名が表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "category-edit-todo",
                name: "資料作成",
                order: 0,
                categoryId: "work",
                memo: "資料の下書きを作る",
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });
        await page.getByRole("button", { name: "仕事" }).click();

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "編集: 資料作成" }).click();

        // Assert
        await expect(
          page.getByRole("combobox", { name: "カテゴリ" }),
        ).toContainText("仕事");
      });

      test("Todo の編集画面でカテゴリを変更すると、更新ボタンが有効になること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "test-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "編集: 資料作成" }).click();

        const categorySelect = page.getByRole("combobox", { name: "カテゴリ" });
        const updateButton = page.getByRole("button", { name: "更新" });

        // Act
        await categorySelect.click();
        await page.getByRole("option", { name: "仕事" }).click();

        // Assert
        await expect(updateButton).toBeEnabled();
      });

      test("Todo の編集画面で変更がなければ更新ボタンが無効であること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "test-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "編集: 資料作成" }).click();

        // Assert
        await expect(page.getByRole("button", { name: "更新" })).toBeDisabled();
      });

      test("Todo を別のカテゴリへ移動できること", async ({ page }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "move-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "編集: 資料作成" }).click();
        await page.getByRole("combobox", { name: "カテゴリ" }).click();
        await page.getByRole("option", { name: "仕事" }).click();
        await page.getByRole("button", { name: "更新" }).click();

        // Assert (移動元カテゴリに Todo が表示されていないこと)
        await expect(
          page.getByRole("button", { name: "編集: 資料作成" }),
        ).toHaveCount(0);

        // Assert (移動先カテゴリに Todo が表示されること)
        await page.getByRole("button", { name: "仕事" }).click();
        await expect(
          page.getByRole("button", { name: "編集: 資料作成" }),
        ).toBeVisible();

        // Assert (データストアへ登録されていること)
        const persisted: AppStorage = await getAppStorage(page);
        expect(persisted.data.todos[0].categoryId).toBe("work");
      });

      test("Todo を別のカテゴリへ移動したとき、移動先カテゴリの末尾に追加されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "move-todo",
                name: "資料作成",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "work-todo-1",
                name: "要件定義",
                order: 0,
                categoryId: "work",
                completed: false,
              },
              {
                id: "work-todo-2",
                name: "実装",
                order: 1,
                categoryId: "work",
                completed: false,
              },
              {
                id: "work-todo-3",
                name: "テスト",
                order: 2,
                categoryId: "work",
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "編集: 資料作成" }).click();
        await page.getByRole("combobox", { name: "カテゴリ" }).click();
        await page.getByRole("option", { name: "仕事" }).click();
        await page.getByRole("button", { name: "更新" }).click();

        // Assert (移動元カテゴリに Todo が表示されていないこと)
        await expect(
          page.getByRole("button", { name: "編集: 資料作成" }),
        ).toHaveCount(0);

        // Assert (移動先カテゴリに Todo が末尾に表示されること)
        await page.getByRole("button", { name: "仕事" }).click();

        const todos = page.getByRole("listitem");
        await expect(todos).toHaveCount(4);
        await expect(todos.nth(0)).toHaveAccessibleName("Todo: 要件定義");
        await expect(todos.nth(1)).toHaveAccessibleName("Todo: 実装");
        await expect(todos.nth(2)).toHaveAccessibleName("Todo: テスト");
        await expect(todos.nth(3)).toHaveAccessibleName("Todo: 資料作成");

        // Assert (データストア上でも移動先カテゴリの末尾の order になっていること)
        const persisted: AppStorage = await getAppStorage(page);

        const persistedTodos = persisted.data.todos;
        expect(
          persistedTodos.find((todo) => todo.id === "move-todo"),
        ).toMatchObject({
          categoryId: "work",
          order: 3,
        });

        expect(
          persistedTodos
            .filter((todo) => todo.categoryId === "work")
            .toSorted((a, b) => a.order - b.order)
            .map((todo) => todo.id),
        ).toEqual(["work-todo-1", "work-todo-2", "work-todo-3", "move-todo"]);
      });

      test("Todo を下へ移動する操作を行ったら、対象の Todo が移動先 Todo よりも下に表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "work-1",
                name: "資料作成",
                order: 0,
                categoryId: "work",
                completed: false,
              },
              {
                id: "daily-1",
                name: "歯磨き",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "work-2",
                name: "メール確認",
                order: 1,
                categoryId: "work",
                completed: false,
              },
              {
                id: "daily-2",
                name: "薬を飲む",
                order: 3,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });
        await page.getByRole("button", { name: "仕事" }).click();

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "下へ移動: 資料作成" }).click();

        // Assert (表示順が正しいこと)
        const todoItems = page.getByRole("listitem");
        await expect(todoItems).toHaveCount(2);
        await expect(todoItems.nth(0)).toHaveAccessibleName("Todo: メール確認");
        await expect(todoItems.nth(1)).toHaveAccessibleName("Todo: 資料作成");
      });

      test("Todo を上へ移動する操作を行ったら、対象の Todo が移動先 Todo よりも上に表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "work-1",
                name: "資料作成",
                order: 0,
                categoryId: "work",
                completed: false,
              },
              {
                id: "daily-1",
                name: "歯磨き",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "work-2",
                name: "メール確認",
                order: 1,
                categoryId: "work",
                completed: false,
              },
              {
                id: "daily-2",
                name: "薬を飲む",
                order: 3,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });
        await page.getByRole("button", { name: "仕事" }).click();

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page
          .getByRole("button", { name: "上へ移動: メール確認" })
          .click();

        // Assert (表示順が正しいこと)
        const todoItems = page.getByRole("listitem");
        await expect(todoItems).toHaveCount(2);
        await expect(todoItems.nth(0)).toHaveAccessibleName("Todo: メール確認");
        await expect(todoItems.nth(1)).toHaveAccessibleName("Todo: 資料作成");
      });
    });

    test.describe("削除時のテスト", () => {
      test("Todo を削除できること", async ({ page }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "dummy",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "削除: dummy" }).click();

        // Act
        await page.getByRole("button", { name: "削除" }).click();

        // Assert (表示が正しいこと)
        await expect(
          assertScope.getByText("dummy", { exact: true }),
        ).not.toBeVisible();

        // Assert (データストアへ登録されていないこと)
        const persisted: AppStorage = await getAppStorage(page);
        expect(persisted.data.todos).toHaveLength(0);
      });
    });

    test.describe("初期化時のテスト", () => {});
  });

  test.describe("カテゴリの操作", () => {
    test.describe("表示時のテスト", () => {
      test("初めて訪問したとき、デフォルトカテゴリが作成されること", async ({
        page,
      }) => {
        // Arrange
        // localStorage を空にして、まだ初回訪問されていないことを再現する
        await navigateToTodoPage(page);
        await page.evaluate(() => localStorage.clear());

        // Act
        await navigateToTodoPage(page);

        // Assert
        // localStorage からデータを取得できるまで繰り返す
        // localStorage にデータが書き込まれる前に getAppStorage() して null を取得してしまいテストが FAIL するため
        await expect
          .poll(async () => {
            const storage = await getAppStorage(page);
            return storage?.data.categories.some(
              (category) => category.id === DEFAULT_CATEGORY_ID,
            );
          })
          .toBe(true);

        const persisted = await getAppStorage(page);
        const defaultCategory = persisted.data.categories.find(
          (category) => category.id === DEFAULT_CATEGORY_ID,
        );
        expect(defaultCategory).toBeDefined();
        expect(defaultCategory?.name).toBe(DEFAULT_CATEGORY_NAME);
      });

      test("ページを開いたとき、最後に選択していたカテゴリが表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: "work",
          },
        };

        // Act
        await navigateToTodoPage(page, { storage: appStorage });

        // Assert
        await expect(
          page.getByRole("button", { name: "仕事" }),
        ).toHaveAttribute("aria-pressed", "true");
      });
    });

    test.describe("作成時のテスト", () => {
      test("カテゴリを追加すると、そのカテゴリが保存されること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);

        // Act
        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("朝活");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert
        const appStorage: AppStorage = await await getAppStorage(page);

        const createdCategory = appStorage.data.categories.find(
          (category) => category.name === "朝活",
        );
        expect(createdCategory).toBeDefined();
        expect(createdCategory?.id).toBeTruthy();
        expect(appStorage.data.categories.at(-1)?.name).toBe("朝活");
      });

      test("カテゴリを追加すると、そのカテゴリが選択状態になること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);

        // Act
        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("朝活");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert
        const categoryButton = page
          .getByLabel("カテゴリ一覧")
          .getByRole("button", { name: "朝活" });
        await expect(categoryButton).toHaveAttribute("aria-pressed", "true");
      });

      test("作成したカテゴリが選択された状態で Todo を作成すると、そのカテゴリに Todo が登録されること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);
        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("朝活");
        await page.getByRole("button", { name: "追加" }).click();

        const categoryButton = page
          .getByLabel("カテゴリ一覧")
          .getByRole("button", { name: "朝活" });
        await expect(categoryButton).toHaveAttribute("aria-pressed", "true");

        // Act
        await page
          .getByRole("textbox", { name: "新しいアイテム" })
          .fill("ランニング");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert (Todo が表示されていること)
        await expect(
          assertScope.getByText("ランニング", { exact: true }),
        ).toBeVisible();

        // Assert (Todo がカテゴリと紐づいた状態でデータストアに登録されていていること)
        const appStorage: AppStorage = await getAppStorage(page);
        const createdCategory = appStorage.data.categories.find(
          (category) => category.name === "朝活",
        );
        const createdTodo = appStorage.data.todos.find(
          (todo) => todo.name === "ランニング",
        );
        expect(createdCategory).toBeDefined();
        expect(createdTodo).toBeDefined();
        expect(createdTodo?.categoryId).toBe(createdCategory?.id);
      });

      test("カテゴリを追加した時、カテゴリの名前順 -> 未分類 の順で並ぶこと", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);

        // Act
        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("03_朝活");
        await page.getByRole("button", { name: "追加" }).click();

        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("01_仕事");
        await page.getByRole("button", { name: "追加" }).click();

        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("02_趣味");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert
        const categoryList = page.getByLabel("カテゴリ一覧");
        await expect(categoryList).toHaveText(
          /01_仕事.*02_趣味.*03_朝活.*未分類/,
        );
      });
    });

    test.describe("表示時のテスト", () => {
      test("選択中のカテゴリに属する Todo だけが表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "todo-unclassified",
                name: "財布",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "todo-work",
                name: "資料作成",
                order: 1,
                categoryId: "work",
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "仕事" }).click();

        // Assert
        await expect(
          assertScope.getByText("資料作成", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("財布", { exact: true }),
        ).not.toBeVisible();
      });
    });

    test.describe("更新時のテスト", () => {
      test("カテゴリ名を変更すると、一覧表示とストレージが更新されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "仕事" }).click();
        await page.getByRole("button", { name: "カテゴリ設定" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("営業");
        await page.getByRole("button", { name: "更新" }).click();

        // Assert
        await expect(page.getByRole("button", { name: "営業" })).toBeVisible();

        const persisted: AppStorage = await getAppStorage(page);
        const updatedCategory = persisted.data.categories.find(
          (category) => category.id === "work",
        );
        expect(updatedCategory).toBeDefined();
        expect(updatedCategory?.name).toBe("営業");
      });

      test("カテゴリ名に変更がなければ更新ボタンが無効であること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "仕事" }).click();
        await page.getByRole("button", { name: "カテゴリ設定" }).click();

        // Assert
        await expect(page.getByRole("button", { name: "更新" })).toBeDisabled();
      });
    });

    test.describe("削除時のテスト", () => {
      test("カテゴリを削除できること", async ({ page }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "todo-work",
                name: "資料作成",
                order: 0,
                categoryId: "work",
                completed: false,
              },
              {
                id: "todo-personal",
                name: "買い物",
                order: 1,
                categoryId: "personal",
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
              {
                id: "personal",
                name: "個人",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "個人" }).click();
        await page.getByRole("button", { name: "カテゴリ設定" }).click();
        await page.getByRole("button", { name: "カテゴリを削除" }).click();
        await page.getByRole("button", { name: "削除" }).click();

        // Assert
        // UI から削除されたカテゴリが消える
        await expect(
          page.getByRole("button", { name: "個人" }),
        ).not.toBeVisible();

        // localStorage から削除されたカテゴリが消える
        const persisted: AppStorage = await getAppStorage(page);
        const deletedCategory = persisted.data.categories.find(
          (category) => category.id === "personal",
        );
        expect(deletedCategory).toBeUndefined();

        // 削除されたカテゴリの Todo が未分類に移行される
        const migratedTodo = persisted.data.todos.find(
          (todo) => todo.id === "todo-personal",
        );
        expect(migratedTodo).toBeDefined();
        expect(migratedTodo?.categoryId).toBe(DEFAULT_CATEGORY_ID);
      });

      test("削除されたカテゴリが選択中だった場合、未分類カテゴリに切り替わること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "todo-work",
                name: "資料作成",
                order: 0,
                categoryId: "work",
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        // 仕事カテゴリを選択
        await page.getByRole("button", { name: "仕事" }).click();
        await page.getByRole("button", { name: "カテゴリ設定" }).click();
        await page.getByRole("button", { name: "カテゴリを削除" }).click();
        await page.getByRole("button", { name: "削除" }).click();

        // Assert
        // デフォルトカテゴリが選択状態になる
        await expect(
          page.getByRole("button", { name: DEFAULT_CATEGORY_NAME }),
        ).toHaveAttribute("aria-pressed", "true");

        // 削除されたカテゴリが localStorage から削除されていること
        const persisted: AppStorage = await getAppStorage(page);

        const deletedCategory = persisted.data.categories.find(
          (category) => category.id === "work",
        );
        expect(deletedCategory).toBeUndefined();

        // デフォルトカテゴリが localStorage に残っていること
        const defaultCategory = persisted.data.categories.find(
          (category) => category.id === DEFAULT_CATEGORY_ID,
        );
        expect(defaultCategory).toBeDefined();
        expect(defaultCategory?.name).toBe(DEFAULT_CATEGORY_NAME);
      });

      test("カテゴリを削除したとき、登録済み Todo が未分類カテゴリの末尾に登録されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "todo-shopping",
                name: "買い物",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "todo-cleaning",
                name: "掃除",
                order: 1,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
              {
                id: "todo-work",
                name: "資料作成",
                order: 0,
                categoryId: "work",
                completed: false,
              },
            ],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
              },
              {
                id: "work",
                name: "仕事",
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "仕事" }).click();
        await page.getByRole("button", { name: "カテゴリ設定" }).click();
        await page.getByRole("button", { name: "カテゴリを削除" }).click();
        await page.getByRole("button", { name: "削除" }).click();

        // Assert
        const todos = page.getByRole("listitem");
        await expect(todos).toHaveCount(3);
        await expect(todos.nth(0)).toHaveAccessibleName("Todo: 買い物");
        await expect(todos.nth(1)).toHaveAccessibleName("Todo: 掃除");
        await expect(todos.nth(2)).toHaveAccessibleName("Todo: 資料作成");
      });
    });
  });

  test.describe("共通操作", () => {
    test.describe("「再読み込みする」ボタンのテスト", () => {
      test("日付が変わる前に「再読み込みする」ボタンを押すと、完了済みの Todo が完了のままであること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const lastMarkedAllIncompleteAt = new Date("2026-08-24T00:00:00+09:00");
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            categories: DEFAULT_CATEGORIES_STORAGE,
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
            ],
            lastMarkedAllIncompleteAt: lastMarkedAllIncompleteAt.toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, {
          storage: appStorage,
          clockTime: beforeMidnight,
        });

        // Act
        // 当日にページを更新したことを再現する
        const afterMidnight = new Date("2026-08-24T23:59:59+09:00");
        await page.clock.setFixedTime(afterMidnight);
        // 更新ボタンを押す
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "再読み込みする" }).click();
        await page.reload();

        // Assert: UI 上で Todo が完了のままであること
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: カギ",
          }),
        ).toHaveAttribute("aria-pressed", "true");

        // Assert: localStorage の completed が true のままであること
        const actualStorage = await getAppStorage(page);
        expect(actualStorage.data.todos).toEqual([
          {
            id: "test-todo",
            name: "カギ",
            order: 0,
            categoryId: DEFAULT_CATEGORY_ID,
            memo: "家の鍵",
            completed: true,
          },
        ]);

        // Assert: 最終未完了化日時が更新されていないこと
        expect(actualStorage.data.lastMarkedAllIncompleteAt).toBe(
          lastMarkedAllIncompleteAt.toISOString(),
        );
      });

      test("日付が変わってから「再読み込みする」ボタンを押すと、完了済みの Todo が未完了になること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            categories: DEFAULT_CATEGORIES_STORAGE,
            todos: [
              {
                id: "test-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };

        await navigateToTodoPage(page, {
          storage: appStorage,
          clockTime: beforeMidnight,
        });

        // Act
        // 日付が変わった状態を再現する
        const afterMidnight = new Date("2026-08-25T00:00:00+09:00");
        await page.clock.setFixedTime(afterMidnight);
        // 更新ボタンを押す
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "再読み込みする" }).click();

        // Assert: UI 上で Todo が未完了になっていること
        await expect(
          assertScope.getByRole("button", {
            name: "完了状態を切り替え: カギ",
          }),
        ).toHaveAttribute("aria-pressed", "false");

        // Assert: localStorage の completed が false になっていること
        const actualStorage = await getAppStorage(page);
        expect(actualStorage.data.todos).toEqual([
          {
            id: "test-todo",
            name: "カギ",
            order: 0,
            categoryId: DEFAULT_CATEGORY_ID,
            memo: "家の鍵",
            completed: false,
          },
        ]);

        // Assert: 最終未完了化日時が更新されていること
        expect(actualStorage.data.lastMarkedAllIncompleteAt).toBe(
          afterMidnight.toISOString(),
        );
      });
    });

    test.describe("エクスポート時のテスト", () => {
      test("Todo が登録済みの状態で、「エクスポート」ボタンをクリックした時、登録内容のエクスポート用テキストが表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "test-todo-01",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: false,
              },
              {
                id: "test-todo-02",
                name: "財布",
                order: 1,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "白い財布",
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "エクスポート" }).click();

        // Assert
        // ダイアログは page の範囲外のためページ全体をテスト範囲にする
        await expect(page.locator("body")).toContainText('"version": 2');
        await expect(page.locator("body")).toContainText(
          '"id": "test-todo-01"',
        );
        await expect(page.locator("body")).toContainText(
          '"todoTogglePosition": "left"',
        );
        await expect(page.locator("body")).toContainText('"name": "カギ"');
        await expect(page.locator("body")).toContainText('"order": 0');
        await expect(page.locator("body")).toContainText('"memo": "家の鍵"');
        await expect(page.locator("body")).toContainText(
          '"id": "test-todo-02"',
        );
        await expect(page.locator("body")).toContainText('"name": "財布"');
        await expect(page.locator("body")).toContainText('"order": 1');
        await expect(page.locator("body")).toContainText('"memo": "白い財布"');
      });
    });

    test.describe("インポート時のテスト", () => {
      test("エクスポート用テキストをインポートした時、既存の登録情報が上書きされること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);

        const backupAppStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "import-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        const backupText = JSON.stringify(backupAppStorage, null, 2);

        // Act
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "インポート" }).click();
        await page
          .getByRole("textbox", { name: "インポート用テキストエリア" })
          .fill(backupText);
        await page.getByRole("button", { name: "インポート" }).click();

        // Assert (表示が復元されること)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("家の鍵", { exact: true }),
        ).toBeVisible();

        // Assert (データストアへ保存されていること)
        const persisted: AppStorage = await getAppStorage(page);
        expect(persisted.version).toBe(2);
        expect(persisted.data.todos[0].id).toBe("import-todo");
        expect(persisted.data.todos[0].name).toBe("カギ");
      });

      test("不正な JSON 文字列をインポートした時、エラーメッセージが表示され、登録済み情報が更新されないこと", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "dummy",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        const corruptedText = "JSON ではない文字列";

        // Act
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "インポート" }).click();
        await page.getByRole("textbox").fill(corruptedText);
        await page.getByRole("button", { name: "インポート" }).click();

        // Assert
        await expect(
          page.getByText(
            "データの形式が不正なため、インポートできませんでした。",
          ),
        ).toBeVisible();

        // Assert (表示がダミーデータのままであること)
        await expect(
          assertScope.getByText("dummy", { exact: true }),
        ).toBeVisible();

        // Assert (データストアが更新されていないこと)
        const persistedInvalidJson: AppStorage = await getAppStorage(page);
        expect(persistedInvalidJson.data.todos[0].id).toBe("dummy-todo");
      });

      test("AppStorage 型に一致しない JSON 文字列をインポートした時、エラーメッセージが表示され、登録済み情報が更新されないこと", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "dummy-todo",
                name: "dummy",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00+09:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        const corruptedAppStorage: unknown = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "import-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                undefinedKey: "★ AppStorage 型に一致しないキー",
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
          },
        };

        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "インポート" }).click();

        // Act
        await page
          .getByRole("textbox", { name: "インポート用テキストエリア" })
          .fill(JSON.stringify(corruptedAppStorage));
        await page.getByRole("button", { name: "インポート" }).click();

        // Assert
        await expect(
          page.getByText(
            "データの形式が不正なため、インポートできませんでした。",
          ),
        ).toBeVisible();

        // Assert (表示がダミーデータのままであること)
        await expect(
          assertScope.getByText("dummy", { exact: true }),
        ).toBeVisible();

        // Assert (データストアが更新されていないこと)
        const persistedCorrupted: AppStorage = await getAppStorage(page);
        expect(persistedCorrupted.data.todos[0].id).toBe("dummy-todo");
      });
    });
  });

  test.describe("設定のテスト", () => {
    test.describe("Todo トグルボタンの表示位置設定", () => {
      test("「位置切替」ボタンを押すと、Todo トグルボタンが右へ移動し、設定が「右」になること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);
        const nameInput = page.getByPlaceholder(MESSAGES.placeholders.newItem);
        await nameInput.fill("カギ");
        await page.getByRole("button", { name: MESSAGES.actions.add }).click();
        await page.getByRole("button", { name: "編集開始" }).click();

        // Act
        await page.getByRole("button", { name: "位置切替" }).click();

        // Assert (Todo の表示順が逆順になっていること)
        const toggle = page.getByRole("button", {
          name: "完了状態を切り替え: カギ",
        });
        const editButton = page.getByRole("button", {
          name: "編集: カギ",
        });
        const deleteButton = page.getByRole("button", {
          name: "削除: カギ",
        });
        const toggleBox = await toggle.boundingBox();
        const editBox = await editButton.boundingBox();
        const deleteBox = await deleteButton.boundingBox();
        expect(deleteBox!.x).toBeLessThan(editBox!.x);
        expect(editBox!.x).toBeLessThan(toggleBox!.x);

        // Assert (Todo の表示位置が「右」で保存されていること)
        const appStorage = await page.evaluate(() =>
          JSON.parse(localStorage.getItem("appStorage")!),
        );
        expect(appStorage.data.settings.todoTogglePosition).toBe("right");
      });

      test("「左へ」ボタンを押すと、Todo トグルボタンが左へ移動し、設定が「左」になること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodoPage(page);
        const nameInput = page.getByPlaceholder(MESSAGES.placeholders.newItem);
        await nameInput.fill("カギ");
        await page.getByRole("button", { name: MESSAGES.actions.add }).click();
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "位置切替" }).click();

        // Act
        await page.getByRole("button", { name: "位置切替" }).click();

        // Assert (Todo の表示順が正順になっていること)
        const toggle = page.getByRole("button", {
          name: "完了状態を切り替え: カギ",
        });
        const editButton = page.getByRole("button", {
          name: "編集: カギ",
        });
        const deleteButton = page.getByRole("button", {
          name: "削除: カギ",
        });
        const toggleBox = await toggle.boundingBox();
        const editBox = await editButton.boundingBox();
        const deleteBox = await deleteButton.boundingBox();
        expect(toggleBox!.x).toBeLessThan(editBox!.x);
        expect(editBox!.x).toBeLessThan(deleteBox!.x);

        // Assert (Todo の表示位置が「左」で保存されていること)
        const appStorage = await page.evaluate(() =>
          JSON.parse(localStorage.getItem("appStorage")!),
        );
        expect(appStorage.data.settings.todoTogglePosition).toBe("left");
      });
    });
  });

  test.describe("異常時のテスト", () => {
    test.describe("localStorage の破損 (正しい JSON や型ではない)", () => {
      test("AppStorage が不正な JSON の場合、元のデータが保持されていること", async ({
        page,
      }) => {
        // Arrange
        const corruptedText = "JSON ではない文字列";
        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [APP_STORAGE_KEY, corruptedText],
        );

        // Act
        await page.goto("/");

        // Assert (localStorage の元データが保持されていること)
        const persistedData = await page.evaluate(
          (key) => window.localStorage.getItem(key),
          APP_STORAGE_KEY,
        );

        expect(persistedData).toBe(corruptedText);
      });

      test("AppStorage が不正な JSON の場合、初期化用ダイアログに元のデータが表示されること", async ({
        page,
      }) => {
        // Arrange
        const corruptedText = "JSON ではない文字列";

        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [APP_STORAGE_KEY, corruptedText],
        );

        // Act
        await page.goto("/");

        // Assert
        const alertDialog = page.getByRole("alertdialog");
        await expect(alertDialog).toBeVisible();
        await expect(alertDialog).toContainText("JSON ではない文字列");
      });

      test("AppStorage が不正な JSON の場合、初期化用ダイアログで初期化するとデータが初期化されること", async ({
        page,
      }) => {
        // Arrange
        const corruptedAppStorage: unknown = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "import-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                undefinedKey: "★ AppStorage 型に一致しないキー",
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
          },
        };

        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [APP_STORAGE_KEY, JSON.stringify(corruptedAppStorage)],
        );

        await page.goto("/");

        // Act
        await page.getByRole("button", { name: "初期化" }).click();

        // Assert
        const persistedData = await getAppStorage(page);

        expect(persistedData.data.todos).toEqual([]);
        expect(persistedData.data.categories).toEqual(
          DEFAULT_CATEGORIES_STORAGE,
        );
        expect(persistedData.data.lastSelectedCategoryId).toBe(
          DEFAULT_CATEGORY_ID,
        );
      });

      test("AppStorage のスキーマが不正な場合、元のデータが保持されていること", async ({
        page,
      }) => {
        // Arrange
        const corruptedAppStorage: unknown = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "import-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                undefinedKey: "★ AppStorage 型に一致しないキー",
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
          },
        };

        const corruptedText = JSON.stringify(corruptedAppStorage);

        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [APP_STORAGE_KEY, corruptedText],
        );

        // Act
        await page.goto("/");

        // Assert (localStorage の元データが保持されていること)
        const persistedData = await page.evaluate(
          (key) => window.localStorage.getItem(key),
          APP_STORAGE_KEY,
        );

        expect(persistedData).toBe(corruptedText);
      });

      test("AppStorage のスキーマが不正な場合、初期化用ダイアログに元のデータが表示されること", async ({
        page,
      }) => {
        // Arrange
        const corruptedAppStorage: unknown = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "import-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                undefinedKey: "★ AppStorage 型に一致しないキー",
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
          },
        };

        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [APP_STORAGE_KEY, JSON.stringify(corruptedAppStorage)],
        );

        // Act
        await page.goto("/");

        // Assert
        const corruptedText = JSON.stringify(corruptedAppStorage);
        const alertDialog = page.getByRole("alertdialog");
        await expect(alertDialog).toContainText(corruptedText);
      });

      test("AppStorage のスキーマが不正な場合、初期化用ダイアログで初期化するとデータが初期化されること", async ({
        page,
      }) => {
        // Arrange
        const corruptedAppStorage: unknown = {
          version: 2,
          data: {
            settings: { todoTogglePosition: "left" },
            todos: [
              {
                id: "import-todo",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                undefinedKey: "★ AppStorage 型に一致しないキー",
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
          },
        };

        await page.addInitScript(
          ([key, value]) => {
            window.localStorage.setItem(key, value);
          },
          [APP_STORAGE_KEY, JSON.stringify(corruptedAppStorage)],
        );

        await page.goto("/");

        // Act
        await page.getByRole("button", { name: "初期化" }).click();

        // Assert
        const persistedData = await getAppStorage(page);

        expect(persistedData.data.todos).toEqual([]);
        expect(persistedData.data.categories).toEqual(
          DEFAULT_CATEGORIES_STORAGE,
        );
        expect(persistedData.data.lastSelectedCategoryId).toBe(
          DEFAULT_CATEGORY_ID,
        );
      });
    });

    test.describe("localStorage の破損 (整合性が取れていない)", () => {
      test.describe("カテゴリ系の不整合による修復", () => {
        test("未分類カテゴリの名前が変更されている場合、カテゴリを初期化し Todo を未分類に変更して復旧すること", async ({
          page,
        }) => {
          // Arrange
          const corruptedAppStorage: AppStorage = {
            version: 2,
            data: {
              settings: { todoTogglePosition: "left" },
              categories: [
                { id: DEFAULT_CATEGORY_ID, name: "変更されたカテゴリ名" },
                { id: "category-1", name: "旅行" },
              ],
              todos: [
                {
                  id: "todo-1",
                  name: "カギ",
                  order: 0,
                  categoryId: "category-1",
                  memo: "家の鍵",
                  completed: true,
                },
              ],
              lastMarkedAllIncompleteAt: new Date(
                "2026-08-24T00:00:00+09:00",
              ).toISOString(),
              lastSelectedCategoryId: "category-1",
            },
          };

          // Act
          await navigateToTodoPage(page, { storage: corruptedAppStorage });

          // Assert: 画面上に Todo が表示されていること
          await expect(page.locator("body")).toContainText("カギ");

          // Assert: localStorage の修復結果を確認
          const actualStorage = await getAppStorage(page);
          expect(actualStorage.data.categories).toEqual(
            DEFAULT_CATEGORIES_STORAGE,
          );
          expect(actualStorage.data.todos).toEqual([
            {
              id: "todo-1",
              name: "カギ",
              order: 0,
              categoryId: DEFAULT_CATEGORY_ID,
              memo: "家の鍵",
              completed: true,
            },
          ]);
          expect(actualStorage.data.lastSelectedCategoryId).toBe(
            DEFAULT_CATEGORY_ID,
          );

          // Act & Assert: 再読み込み後も永続化されていることを確認
          await page.reload();
          await expect(page.locator("body")).toContainText("カギ");

          const reloadedStorage = await getAppStorage(page);
          expect(reloadedStorage.data.categories).toEqual(
            DEFAULT_CATEGORIES_STORAGE,
          );
          expect(reloadedStorage.data.todos[0].categoryId).toBe(
            DEFAULT_CATEGORY_ID,
          );
        });

        test("存在しない categoryId を参照している Todo がある場合、カテゴリを初期化して復旧すること", async ({
          page,
        }) => {
          // Arrange
          const corruptedAppStorage: AppStorage = {
            version: 2,
            data: {
              settings: { todoTogglePosition: "left" },
              categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
              todos: [
                {
                  id: "todo-1",
                  name: "パスポート",
                  order: 0,
                  categoryId: "ghost-category", // 存在しないカテゴリID
                  memo: "有効期限確認",
                  completed: false,
                },
              ],
              lastMarkedAllIncompleteAt: new Date(
                "2026-08-24T00:00:00+09:00",
              ).toISOString(),
              lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
            },
          };

          // Act
          await navigateToTodoPage(page, { storage: corruptedAppStorage });

          // Assert
          await expect(page.locator("body")).toContainText("パスポート");

          const actualStorage = await getAppStorage(page);
          expect(actualStorage.data.categories).toEqual(
            DEFAULT_CATEGORIES_STORAGE,
          );
          expect(actualStorage.data.todos[0].categoryId).toBe(
            DEFAULT_CATEGORY_ID,
          );
        });

        test("lastSelectedCategoryId が存在しないカテゴリを参照している場合、カテゴリを初期化すること", async ({
          page,
        }) => {
          // Arrange
          const corruptedAppStorage: AppStorage = {
            version: 2,
            data: {
              settings: { todoTogglePosition: "left" },
              categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
              todos: [],
              lastMarkedAllIncompleteAt: new Date(
                "2026-08-24T00:00:00+09:00",
              ).toISOString(),
              lastSelectedCategoryId: "non-existent-category",
            },
          };

          // Act
          await navigateToTodoPage(page, { storage: corruptedAppStorage });

          // Assert
          const actualStorage = await getAppStorage(page);
          expect(actualStorage.data.categories).toEqual(
            DEFAULT_CATEGORIES_STORAGE,
          );
          expect(actualStorage.data.lastSelectedCategoryId).toBe(
            DEFAULT_CATEGORY_ID,
          );
        });
      });

      test.describe("Todo ID の重複による修復", () => {
        test("Todo.id が重複している場合、1件目を維持し2件目以降の ID を再生成して修復すること", async ({
          page,
        }) => {
          // Arrange
          const duplicateId = "duplicate-id-123";
          const corruptedAppStorage: AppStorage = {
            version: 2,
            data: {
              settings: { todoTogglePosition: "left" },
              categories: [{ id: DEFAULT_CATEGORY_ID, name: "未分類" }],
              todos: [
                {
                  id: duplicateId,
                  name: "1件目のタスク",
                  order: 0,
                  categoryId: DEFAULT_CATEGORY_ID,
                  memo: "メモ1",
                  completed: false,
                },
                {
                  id: duplicateId, // 重複
                  name: "2件目のタスク",
                  order: 1,
                  categoryId: DEFAULT_CATEGORY_ID,
                  memo: "メモ2",
                  completed: true,
                },
              ],
              lastMarkedAllIncompleteAt: new Date(
                "2026-08-24T00:00:00+09:00",
              ).toISOString(),
              lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
            },
          };

          // Act
          await navigateToTodoPage(page, { storage: corruptedAppStorage });

          // Assert: 両方の Todo が画面上に表示されていること
          await expect(page.locator("body")).toContainText("1件目のタスク");
          await expect(page.locator("body")).toContainText("2件目のタスク");

          // Assert: 1件目の ID は維持され、2件目の ID は変更されていること
          const actualStorage = await getAppStorage(page);
          const todos = actualStorage.data.todos;

          expect(todos.length).toBe(2);
          expect(todos[0].id).toBe(duplicateId);
          expect(todos[1].id).not.toBe(duplicateId);

          // ID の一意性を確認
          const todoIds = todos.map((t) => t.id);
          expect(new Set(todoIds).size).toBe(2);

          // ID 以外の属性（名前・メモ・完了フラグ等）が適切に保持されていること
          expect(todos[1].name).toBe("2件目のタスク");
          expect(todos[1].memo).toBe("メモ2");
          expect(todos[1].completed).toBe(true);
        });
      });

      test.describe("カテゴリ系と Todo ID 系の複合不整合", () => {
        test("カテゴリ不整合と Todo ID 重複が同時に存在する場合、両方を一括修復すること", async ({
          page,
        }) => {
          // Arrange
          const duplicateId = "shared-todo-id";
          const corruptedAppStorage: AppStorage = {
            version: 2,
            data: {
              settings: { todoTogglePosition: "left" },
              categories: [
                { id: DEFAULT_CATEGORY_ID, name: "壊れた未分類名" }, // カテゴリ不整合
                { id: "cat-1", name: "仕事" },
              ],
              todos: [
                {
                  id: duplicateId,
                  name: "資料作成",
                  order: 0,
                  categoryId: "cat-1",
                  memo: "重要",
                  completed: false,
                },
                {
                  id: duplicateId, // ID重複 & 存在しない参照
                  name: "メール送信",
                  order: 1,
                  categoryId: "cat-ghost",
                  memo: "",
                  completed: false,
                },
              ],
              lastMarkedAllIncompleteAt: new Date(
                "2026-08-24T00:00:00+09:00",
              ).toISOString(),
              lastSelectedCategoryId: "cat-1",
            },
          };

          // Act
          await navigateToTodoPage(page, { storage: corruptedAppStorage });

          // Assert: アプリ上に双方の Todo が表示されること
          await expect(page.locator("body")).toContainText("資料作成");
          await expect(page.locator("body")).toContainText("メール送信");

          // Assert: カテゴリ初期化および Todo ID の再生成が同時に行われていること
          const actualStorage = await getAppStorage(page);

          // カテゴリは初期化
          expect(actualStorage.data.categories).toEqual(
            DEFAULT_CATEGORIES_STORAGE,
          );
          expect(actualStorage.data.lastSelectedCategoryId).toBe(
            DEFAULT_CATEGORY_ID,
          );

          // Todo のカテゴリIDはどちらも未分類へ、ID は一意に修復される
          const todos = actualStorage.data.todos;
          expect(todos.length).toBe(2);
          expect(todos[0].categoryId).toBe(DEFAULT_CATEGORY_ID);
          expect(todos[1].categoryId).toBe(DEFAULT_CATEGORY_ID);

          expect(todos[0].id).toBe(duplicateId);
          expect(todos[1].id).not.toBe(duplicateId);
          expect(new Set(todos.map((t) => t.id)).size).toBe(2);
        });
      });
    });

    test.describe("セキュリティ対策", () => {
      test("悪意のある文字列を含む保存データから JavaScript が実行されないこと", async ({
        page,
      }) => {
        // Arrange
        const maliciousAppStorage: AppStorage = {
          version: 2,
          data: {
            settings: {
              todoTogglePosition: "left",
            },
            categories: [
              {
                id: "category-1",
                name: '<script>alert("settings")</script>',
              },
            ],
            todos: [
              {
                id: "todo-1",
                name: '<img src=x onerror=alert("todo-name")>',
                order: 0,
                categoryId: "category-1",
                memo: '<svg onload=alert("todo-memo")>',
                completed: false,
              },
            ],
            lastMarkedAllIncompleteAt: "2026-08-26T12:00:00.000Z",
            lastSelectedCategoryId: "category-1",
          },
        } as unknown as AppStorage;

        let dialogOpened = false;

        page.on("dialog", async (dialog) => {
          dialogOpened = true;
          await dialog.dismiss();
        });

        // Act
        await navigateToTodoPage(page, {
          storage: maliciousAppStorage,
        });

        // Assert (JavaScript が実行されないこと)
        expect(dialogOpened).toBe(false);

        // Assert (意味のある HTML 文字列が通常の文字列として表示されていること)
        await expect(
          page.getByText('<script>alert("settings")</script>'),
        ).toBeVisible();
        await expect(
          page.getByText('<img src=x onerror=alert("todo-name")>'),
        ).toBeVisible();
        await expect(
          page.getByText('<svg onload=alert("todo-memo")>'),
        ).toBeVisible();
      });
    });
  });
});
