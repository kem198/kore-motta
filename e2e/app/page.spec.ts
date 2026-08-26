import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_NAME,
  DEFAULT_CATEGORY_ORDER,
} from "@/constants/categories";
import { APP_STORAGE_KEY } from "@/lib/app-storage";
import { AppStorage } from "@/schemas/app-storage-schema";
import { Category } from "@/schemas/category-schema";
import { expect, Locator, Page, test } from "@playwright/test";

test.describe("Todo ページのテスト", () => {
  /** テストの Assert 範囲 */
  let assertScope: Locator;

  /**デフォルトのテスト実行日時 */
  const DEFAULT_CLOCK_TIME = new Date("2026-08-24T12:00:00");

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
    options: { storage?: AppStorage; clockTime?: Date } = {},
  ) => {
    await page.clock.install({
      time: options.clockTime ?? DEFAULT_CLOCK_TIME,
    });
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
    test.describe("初期表示のテスト", () => {
      test("Todo が登録済みの状態で、画面が初期表示された時、登録済み Todo の各種情報が表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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

      test("日付が変わる前にページを更新すると、完了済みの Todo が完了のままであること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const lastMarkedAllIncompleteAt = new Date("2026-08-24T00:00:00+09:00");
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
        // 更新する
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

      test("日付が変わってからページを更新すると、完了済みの Todo が未完了になること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
        // 更新する
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

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
        expect(persisted.version).toBe(1);
        expect(persisted.data.todos[0].name).toBe("カギ");
      });

      test("未完了 Todo の完了ボタンを押したとき、完了済みにできること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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

        expect(persisted.version).toBe(1);
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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

        expect(persisted.version).toBe(1);
        expect(persisted.data.todos[0]).toEqual(
          expect.objectContaining({
            id: "dummy-todo",
            name: "資料作成",
            completed: false,
          }),
        );
      });

      test("Todo の編集画面に現在のカテゴリ名が表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });
        await page.getByRole("button", { name: "仕事" }).click();

        // Act
        await page.getByRole("button", { name: "編集: 資料作成" }).click();

        // Assert
        await expect(
          page.getByRole("combobox", { name: "カテゴリ" }),
        ).toContainText("仕事");
      });

      test("Todo を別のカテゴリへ移動できること", async ({ page }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
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

      test("Todo を下へ移動する操作を行ったら、対象の Todo が移動先 Todo よりも下に表示されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
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
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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
    test.describe("初期表示時のテスト", () => {
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

      test.describe("表示時のテスト", () => {
        test("ページを開いたとき、最後に選択していたカテゴリが表示されること", async ({
          page,
        }) => {
          // Arrange
          const appStorage: AppStorage = {
            version: 1,
            data: {
              settings: {},
              todos: [],
              categories: [
                {
                  id: DEFAULT_CATEGORY_ID,
                  name: DEFAULT_CATEGORY_NAME,
                  order: DEFAULT_CATEGORY_ORDER,
                },
                {
                  id: "work",
                  name: "仕事",
                  order: 1,
                },
              ],
              lastMarkedAllIncompleteAt: new Date(
                "2026-08-24T00:00:00",
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
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
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

    test.describe("編集時のテスト", () => {
      test("カテゴリ名を変更すると、一覧表示とストレージが更新されること", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
            todos: [],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
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
    });

    test.describe("削除時のテスト", () => {
      test("カテゴリを削除できること", async ({ page }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
              {
                id: "personal",
                name: "個人",
                order: 2,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
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
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        // Act
        // 仕事カテゴリを選択
        await page.getByRole("button", { name: "仕事" }).click();
        await expect(
          page.getByRole("button", { name: "仕事" }),
        ).toHaveAttribute("aria-pressed", "true");

        // 編集モードを有効にする
        await page.getByRole("button", { name: "編集開始" }).click();
        // 仕事カテゴリを設定ダイアログから削除
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
          version: 1,
          data: {
            settings: {},
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
                order: DEFAULT_CATEGORY_ORDER,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
              },
            ],
            lastMarkedAllIncompleteAt: new Date(
              "2026-08-24T00:00:00",
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
        await page.getByRole("button", { name: DEFAULT_CATEGORY_NAME }).click();

        const todos = page.getByRole("listitem");
        await expect(todos).toHaveCount(3);
        await expect(todos.nth(0)).toHaveAccessibleName("Todo: 買い物");
        await expect(todos.nth(1)).toHaveAccessibleName("Todo: 掃除");
        await expect(todos.nth(2)).toHaveAccessibleName("Todo: 資料作成");
      });
    });
  });

  test.describe("共通操作", () => {
    test.describe("「更新する」ボタンのテスト", () => {
      test("日付が変わる前に「更新する」ボタンを押すと、完了済みの Todo が完了のままであること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const lastMarkedAllIncompleteAt = new Date("2026-08-24T00:00:00+09:00");
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
        await page.getByRole("menuitem", { name: "更新する" }).click();
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

      test("日付が変わってから「更新する」ボタンを押すと、完了済みの Todo が未完了になること", async ({
        page,
      }) => {
        // Arrange
        // 当日の未完了化がすでに実行済みの状態を再現する
        const beforeMidnight = new Date("2026-08-24T23:59:00+09:00");

        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
        await page.getByRole("menuitem", { name: "更新する" }).click();

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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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
        await expect(page.locator("body")).toContainText('"version": 1');
        await expect(page.locator("body")).toContainText(
          '"id": "test-todo-01"',
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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
        expect(persisted.version).toBe(1);
        expect(persisted.data.todos[0].id).toBe("import-todo");
        expect(persisted.data.todos[0].name).toBe("カギ");
      });

      test("不正な JSON 文字列をインポートした時、エラーメッセージが表示され、登録済み情報が更新されないこと", async ({
        page,
      }) => {
        // Arrange
        const appStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
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
            "アイテム情報の形式が不正なため、インポートできませんでした。",
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
          version: 1,
          data: {
            settings: {},
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
              "2026-08-24T00:00:00",
            ).toISOString(),
            lastSelectedCategoryId: DEFAULT_CATEGORY_ID,
          },
        };
        await navigateToTodoPage(page, { storage: appStorage });

        const corruptedAppStorage: unknown = {
          version: 1,
          data: {
            settings: {},
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
            "アイテム情報の形式が不正なため、インポートできませんでした。",
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

  test.describe("異常時のテスト", () => {
    test.describe("localStorage の破損", () => {
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
          version: 1,
          data: {
            settings: {},
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
          version: 1,
          data: {
            settings: {},
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
          version: 1,
          data: {
            settings: {},
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
          version: 1,
          data: {
            settings: {},
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
  });
});
