import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
  DEFAULT_CATEGORY_NAME,
  DEFAULT_CATEGORY_ORDER,
} from "@/constants/categories";
import { APP_STORAGE_KEY } from "@/lib/storage/app-storage";
import { AppStorage } from "@/types/app-storage";
import { Category } from "@/types/category";
import { expect, Locator, Page, test } from "@playwright/test";

test.describe("Todo ページのテスト", () => {
  /** テストの Assert 範囲 */
  let assertScope: Locator;

  /** テスト対象のページへ遷移する */
  const navigateToTodo = async (page: Page) => {
    await page.goto("/");
  };

  /** ダミーデータ */
  const DUMMY_APP_STORAGE: AppStorage = {
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
    },
  };

  /** localStorage の appStorage キーへ値をセットするヘルパー */
  const setAppStorage = async (
    page: Page,
    storage: AppStorage,
  ): Promise<void> => {
    await page.evaluate(
      ([key, value]) => {
        localStorage.setItem(key, value);
      },
      [APP_STORAGE_KEY, JSON.stringify(storage)],
    );
  };

  /** localStorage の appStorage キーの値を取得するヘルパー */
  const getAppStorage = async (page: Page): Promise<AppStorage> =>
    page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      APP_STORAGE_KEY,
    );

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    assertScope = page.locator('[data-testid="todo"]');
    await setAppStorage(page, DUMMY_APP_STORAGE);
  });

  test.describe("Todo の操作", () => {
    test.describe("初期表示のテスト", () => {
      test("Todo が登録済みの状態で、画面が初期表示された時、登録済み Todo の各種情報が表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
          },
        };

        await setAppStorage(page, todoStorage);

        // Act
        await navigateToTodo(page);

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
          },
        };
        await setAppStorage(page, storage);

        // Act
        await navigateToTodo(page);

        // Assert
        await expect(async () => await getAppStorage(page)).not.toBeNull();

        const raw = await page.evaluate(
          (key) => localStorage.getItem(key),
          APP_STORAGE_KEY,
        );
        const persisted: AppStorage = JSON.parse(raw!);
        const defaultCategory = persisted.data.categories.find(
          (category: Category) => category.id === DEFAULT_CATEGORY_ID,
        );
        expect(defaultCategory).toBeDefined();
        expect(defaultCategory?.name).toBe(DEFAULT_CATEGORY_NAME);
        expect(defaultCategory?.markAllIncompleteAt).toBe(
          DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
        );

        const legacyCategoriesKeyValue = await page.evaluate(() =>
          localStorage.getItem("categories"),
        );
        expect(legacyCategoriesKeyValue).toBeNull();
      });
    });

    test.describe("作成時のテスト", () => {
      test("Todo を登録できること", async ({ page }) => {
        // Arrange
        await navigateToTodo(page);
        const nameInput = page.getByRole("textbox", { name: "新しいアイテム" });

        // Act
        await nameInput.fill("カギ");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert (表示が正しいこと)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();

        // Assert (データストアへ登録されていること)
        const todoStorage: AppStorage = await getAppStorage(page);
        expect(todoStorage.data.todos[0].name).toBe("カギ");
      });

      test("Todo が登録されている状態で新規 Todo を登録した時、末尾へ追加されること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodo(page);
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
        await navigateToTodo(page);
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

      test("Todo の編集画面に現在のカテゴリ名が表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };
        await setAppStorage(page, todoStorage);

        await navigateToTodo(page);
        await page.getByRole("button", { name: "仕事" }).click();

        // Act
        await page.getByRole("button", { name: "編集: 資料作成" }).click();

        // Assert
        await expect(
          page.getByRole("combobox", { name: "カテゴリ" }),
        ).toContainText("仕事");
      });

      test("Todo を下へ移動する操作を行ったら、対象の Todo が移動先 Todo よりも下に表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };
        await setAppStorage(page, todoStorage);

        await navigateToTodo(page);
        await page.getByRole("button", { name: "仕事" }).click();

        // Act (なし)
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "下へ移動: 資料作成" }).click();

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
        await navigateToTodo(page);
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

    test.describe("初期化時のテスト", () => {
      test("Todo をすべて未完了に戻す操作を行うと、登録済み Todo が削除されず、完了状態が未完了に戻ること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
            todos: [
              {
                id: "mark-todo-01",
                name: "カギ",
                order: 0,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "家の鍵",
                completed: true,
              },
              {
                id: "mark-todo-02",
                name: "財布",
                order: 1,
                categoryId: DEFAULT_CATEGORY_ID,
                memo: "白い財布",
                completed: false,
              },
            ],
            categories: DEFAULT_CATEGORIES_STORAGE,
          },
        };
        await setAppStorage(page, todoStorage);

        await navigateToTodo(page);

        // Act
        await page.getByRole("button", { name: "カテゴリ設定" }).click();
        await page.getByRole("button", { name: "すべて未完了に戻す" }).click();
        await page.getByRole("button", { name: "すべて未完了に戻す" }).click();

        // Assert (表示が残ること)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("財布", { exact: true }),
        ).toBeVisible();

        // Assert (完了状態が未完了に戻ること)
        const persisted: AppStorage = await getAppStorage(page);
        expect(persisted.data.todos).toHaveLength(2);
        expect(
          persisted.data.todos.every((todo) => todo.completed === false),
        ).toBe(true);
      });
    });
  });

  test.describe("カテゴリの操作", () => {
    test.describe("初期表示時のテスト", () => {
      test("localStorage が空のときデフォルトカテゴリが作成されること", async ({
        page,
      }) => {
        // Arrange
        await page.evaluate(() => localStorage.clear());

        // Act
        await navigateToTodo(page);

        // Assert
        await expect(await getAppStorage(page)).not.toBeNull();

        const raw = await page.evaluate(
          (key) => localStorage.getItem(key),
          APP_STORAGE_KEY,
        );
        const persisted: AppStorage = JSON.parse(raw!);
        const defaultCategory = persisted.data.categories.find(
          (category) => category.id === DEFAULT_CATEGORY_ID,
        );
        expect(defaultCategory).toBeDefined();
        expect(defaultCategory?.name).toBe(DEFAULT_CATEGORY_NAME);
        expect(defaultCategory?.markAllIncompleteAt).toBe(
          DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
        );
      });
    });

    test.describe("作成時のテスト", () => {
      test("カテゴリを追加すると、そのカテゴリが保存されること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodo(page);

        // Act
        await page.getByRole("button", { name: "カテゴリ作成" }).click();
        await page.getByRole("textbox", { name: "カテゴリ名" }).fill("朝活");
        await page.getByRole("button", { name: "追加" }).click();

        // Assert
        const todoStorage: AppStorage = await await getAppStorage(page);

        const createdCategory = todoStorage.data.categories.find(
          (category) => category.name === "朝活",
        );
        expect(createdCategory).toBeDefined();
        expect(createdCategory?.id).toBeTruthy();
        expect(createdCategory?.markAllIncompleteAt).toBe(
          DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
        );
        expect(todoStorage.data.categories.at(-1)?.name).toBe("朝活");
      });

      test("カテゴリを追加すると、そのカテゴリが選択状態になること", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodo(page);

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
        await navigateToTodo(page);

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
        const todoStorage: AppStorage = await getAppStorage(page);
        const createdCategory = todoStorage.data.categories.find(
          (category) => category.name === "朝活",
        );
        const createdTodo = todoStorage.data.todos.find(
          (todo) => todo.name === "ランニング",
        );
        expect(createdCategory).toBeDefined();
        expect(createdTodo).toBeDefined();
        expect(createdTodo?.categoryId).toBe(createdCategory?.id);
      });
    });

    test("カテゴリを追加した時、カテゴリの名前順 -> 未分類 の順で並ぶこと", async ({
      page,
    }) => {
      // Arrange
      await navigateToTodo(page);

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

    test.describe("表示時のテスト", () => {
      test("選択中のカテゴリに属する Todo だけが表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };
        await setAppStorage(page, todoStorage);
        await navigateToTodo(page);

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
        const todoStorage: AppStorage = {
          version: 1,
          data: {
            settings: {},
            todos: [],
            categories: [
              {
                id: DEFAULT_CATEGORY_ID,
                name: DEFAULT_CATEGORY_NAME,
                order: DEFAULT_CATEGORY_ORDER,
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };
        await setAppStorage(page, todoStorage);
        await navigateToTodo(page);

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
        expect(updatedCategory?.markAllIncompleteAt).toBe("09:00");
      });
    });

    test.describe("削除時のテスト", () => {
      test("カテゴリを削除できること", async ({ page }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
              {
                id: "personal",
                name: "個人",
                order: 2,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };
        await setAppStorage(page, todoStorage);
        await navigateToTodo(page);

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
        const todoStorage: AppStorage = {
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
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };
        await setAppStorage(page, todoStorage);
        await navigateToTodo(page);

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
        expect(defaultCategory?.markAllIncompleteAt).toBe(
          DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
        );
      });

      test("カテゴリを削除したとき、登録済み Todo が未分類カテゴリの末尾に登録されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
                markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
              },
              {
                id: "work",
                name: "仕事",
                order: 1,
                markAllIncompleteAt: "09:00",
              },
            ],
          },
        };

        await setAppStorage(page, todoStorage);
        await navigateToTodo(page);

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
    test.describe("エクスポート時のテスト", () => {
      test("Todo が登録済みの状態で、「エクスポート」ボタンをクリックした時、登録内容のエクスポート用テキストが表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: AppStorage = {
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
          },
        };
        await setAppStorage(page, todoStorage);
        await navigateToTodo(page);

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
        const backupTodoStorage: AppStorage = {
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
          },
        };
        const backupText = JSON.stringify(backupTodoStorage, null, 2);

        await navigateToTodo(page);
        await page.getByRole("button", { name: "編集開始" }).click();

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
        const corruptedText = "JSON ではない文字列";

        await navigateToTodo(page);
        await page.getByRole("button", { name: "グローバルメニュー" }).click();
        await page.getByRole("menuitem", { name: "インポート" }).click();

        // Act
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

        await navigateToTodo(page);
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
});
