import { TODO_STORAGE_KEY } from "@/hooks/use-todos";
import { TodoStorage } from "@/types/todo";
import { expect, Locator, Page, test } from "@playwright/test";

test.describe("Todo ページのテスト", () => {
  /** テストの Assert 範囲 */
  let assertScope: Locator;

  /** テスト対象のページへ遷移する */
  const navigateToTodo = async (page: Page) => {
    const targetPath = "/";
    await page.goto(targetPath);
    await expect(page).toHaveURL(targetPath);
  };

  test.beforeEach(async ({ page }) => {
    // ルートへ移動しておく
    await page.goto("/");

    // テストの Assert 範囲を設定
    assertScope = page.locator('[data-testid="todo"]');
  });

  test.describe("TodoApp のテスト", () => {
    const DUMMY_TODO_STORAGE: TodoStorage = {
      version: 1,
      todos: [
        {
          id: "dummy-todo",
          name: "dummy",
          order: 0,
          completed: false,
        },
      ],
    };

    test.beforeEach(async ({ page }) => {
      // ダミーデータのセット
      await page.evaluate(
        ([key, value]) => {
          localStorage.setItem(key, value);
        },
        [TODO_STORAGE_KEY, JSON.stringify(DUMMY_TODO_STORAGE)],
      );
    });

    test.afterEach(async ({ page }) => {
      // ダミーデータで再度上書き
      await page.evaluate(
        ([key, value]) => {
          localStorage.setItem(key, value);
        },
        [TODO_STORAGE_KEY, JSON.stringify(DUMMY_TODO_STORAGE)],
      );
    });

    test.describe("初期表示のテスト", () => {
      test("Todo が登録済みの状態で、画面が初期表示された時、登録済み Todo の各種情報が表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: TodoStorage = {
          version: 1,
          todos: [
            {
              id: "test-todo",
              name: "カギ",
              order: 0,
              memo: "家の鍵",
              completed: false,
            },
          ],
        };
        await page.evaluate(
          ([key, value]) => {
            localStorage.setItem(key, value);
          },
          [TODO_STORAGE_KEY, JSON.stringify(todoStorage)],
        );

        // Act
        await navigateToTodo(page);

        // Assert
        await expect(assertScope.getByText("カギ")).toBeVisible();
        await expect(assertScope.getByText("家の鍵")).toBeVisible();
      });
    });

    test.describe("作成時のテスト", () => {
      test("Todo を登録できること", async ({ page }) => {
        // Arrange
        await navigateToTodo(page);
        await page.getByRole("textbox", { name: "財布" }).fill("カギ");

        // Act
        await page.getByRole("button", { name: "追加" }).click();

        // Assert (表示が正しいこと)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();

        // Assert (データストアへ登録されていること)
        const todoStorage: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(todoStorage.todos[0].name).toBe("カギ");
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
        const migrated: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(migrated.version).toBe(1);
        expect(migrated.todos[0].name).toBe("カギ");
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
        const migrated: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(migrated.todos[0].name).not.toBe("dummy");
      });
    });

    test.describe("初期化時のテスト", () => {
      test("Todo を初期化すると、登録済み Todo が削除されず、完了状態が未完了に戻ること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: TodoStorage = {
          version: 1,
          todos: [
            {
              id: "reset-todo-01",
              name: "カギ",
              order: 0,
              memo: "家の鍵",
              completed: true,
            },
            {
              id: "reset-todo-02",
              name: "財布",
              order: 1,
              memo: "白い財布",
              completed: false,
            },
          ],
        };

        await page.evaluate(
          ([key, value]) => {
            localStorage.setItem(key, value);
          },
          [TODO_STORAGE_KEY, JSON.stringify(todoStorage)],
        );
        await navigateToTodo(page);

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "初期化" }).click();
        await page.getByRole("button", { name: "初期化" }).click();

        // Assert (表示が残ること)
        await expect(
          assertScope.getByText("カギ", { exact: true }),
        ).toBeVisible();
        await expect(
          assertScope.getByText("財布", { exact: true }),
        ).toBeVisible();

        // Assert (完了状態が未完了に戻ること)
        const migrated: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(migrated.todos).toHaveLength(2);
        expect(migrated.todos.every((todo) => todo.completed === false)).toBe(
          true,
        );
      });
    });

    test.describe("エクスポート時のテスト", () => {
      test("Todo が登録済みの状態で、「エクスポート」ボタンをクリックした時、登録内容のエクスポート用テキストが表示されること", async ({
        page,
      }) => {
        // Arrange
        const todoStorage: TodoStorage = {
          version: 1,
          todos: [
            {
              id: "test-todo-01",
              name: "カギ",
              order: 0,
              memo: "家の鍵",
              completed: false,
            },
            {
              id: "test-todo-02",
              name: "財布",
              order: 1,
              memo: "白い財布",
              completed: false,
            },
          ],
        };

        await page.evaluate(
          ([key, value]) => {
            localStorage.setItem(key, value);
          },
          [TODO_STORAGE_KEY, JSON.stringify(todoStorage)],
        );

        await navigateToTodo(page);

        // Act
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "エクスポート" }).click();

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
        const todoStorage: TodoStorage = {
          version: 1,
          todos: [
            {
              id: "import-todo",
              name: "カギ",
              order: 0,
              memo: "家の鍵",
              completed: false,
            },
          ],
        };

        const backupText = JSON.stringify(todoStorage, null, 2);
        await navigateToTodo(page);
        await page.getByRole("button", { name: "編集開始" }).click();

        // Act
        await page.getByRole("button", { name: "インポート" }).click();
        await page.getByRole("textbox").fill(backupText);
        await page.getByRole("button", { name: "インポート" }).click();

        // Assert (表示が復元されること)
        await expect(assertScope.getByText("カギ")).toBeVisible();
        await expect(assertScope.getByText("家の鍵")).toBeVisible();

        // Assert (データストアへ保存されていること)
        const migrated: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(migrated.version).toBe(1);
        expect(migrated.todos[0].id).toBe("import-todo");
        expect(migrated.todos[0].name).toBe("カギ");
      });

      test("不正な JSON 文字列をインポートした時、エラーメッセージが表示され、登録済み情報が更新されないこと", async ({
        page,
      }) => {
        // Arrange
        await navigateToTodo(page);
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "インポート" }).click();

        // Act
        await page.getByRole("textbox").fill("JSON ではない文字列");
        await page.getByRole("button", { name: "インポート" }).click();

        // Assert
        await expect(
          page.getByText(
            "アイテム情報の形式が不正なため、インポートできませんでした。",
          ),
        ).toBeVisible();

        // Assert (表示がダミーデータのままであること)
        await expect(assertScope.getByText("dummy")).toBeVisible();

        // Assert (データストアが更新されていないこと)
        const migratedInvalidJson: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(migratedInvalidJson.todos[0].id).toBe("dummy-todo");
      });

      test("TodoStorage 型に一致しない JSON 文字列をインポートした時、エラーメッセージが表示され、登録済み情報が更新されないこと", async ({
        page,
      }) => {
        // Arrange
        const corruptedTodoStorage: unknown = {
          version: 1,
          todos: [
            {
              id: "import-todo",
              name: "カギ",
              order: 0,
              memo: "家の鍵",

              undefinedKey: "★ TodoStorage 型に一致しないキー",
            },
          ],
        };

        await navigateToTodo(page);
        await page.getByRole("button", { name: "編集開始" }).click();
        await page.getByRole("button", { name: "インポート" }).click();

        // Act
        await page
          .getByRole("textbox")
          .fill(JSON.stringify(corruptedTodoStorage));
        await page.getByRole("button", { name: "インポート" }).click();

        // Assert
        await expect(
          page.getByText(
            "アイテム情報の形式が不正なため、インポートできませんでした。",
          ),
        ).toBeVisible();

        // Assert (表示がダミーデータのままであること)
        await expect(assertScope.getByText("dummy")).toBeVisible();

        // Assert (データストアが更新されていないこと)
        const migratedCorrupted: TodoStorage = await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          TODO_STORAGE_KEY,
        );
        expect(migratedCorrupted.todos[0].id).toBe("dummy-todo");
      });
    });
  });
});
