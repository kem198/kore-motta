import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import { APP_STORAGE_KEY } from "@/lib/app-storage-utils";
import { AppStorage } from "@/schemas/app-storage-schema";
import { expect, Page, test } from "@playwright/test";

const navigateToTodoPage = async (
  page: Page,
  storage: AppStorage,
) => {
  await page.clock.install({
    time: new Date("2026-08-24T12:00:00+09:00"),
  });
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [APP_STORAGE_KEY, JSON.stringify(storage)],
  );
  await page.goto("/");
};

test.describe("Todo アイテムの操作", () => {
  test("Todo 本体をクリックすると編集ダイアログが開き、完了状態は変わらないこと", async ({
    page,
  }) => {
    const storage: AppStorage = {
      version: 1,
      data: {
        settings: {},
        todos: [
          {
            id: "todo-item-click",
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

    await navigateToTodoPage(page, storage);

    await page.getByRole("button", { name: "編集: 資料作成" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "完了状態を切り替え: 資料作成",
      }),
    ).toHaveAttribute("aria-pressed", "false");

    const persisted = JSON.parse(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        APP_STORAGE_KEY,
      ),
    ) as AppStorage;
    expect(persisted.data.todos[0].completed).toBe(false);
  });

  test("編集モードにすると削除と並び替えの操作が表示されること", async ({
    page,
  }) => {
    const storage: AppStorage = {
      version: 1,
      data: {
        settings: {},
        todos: [
          {
            id: "todo-item-actions",
            name: "資料作成",
            order: 0,
            categoryId: DEFAULT_CATEGORY_ID,
            completed: false,
          },
          {
            id: "todo-item-actions-2",
            name: "メール確認",
            order: 1,
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

    await navigateToTodoPage(page, storage);

    await expect(
      page.getByRole("button", { name: "削除: 資料作成" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "編集: 資料作成" }),
    ).toHaveCount(1);

    await page.getByRole("button", { name: "編集開始" }).click();

    await expect(
      page.getByRole("button", { name: "削除: 資料作成" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "上へ移動: 資料作成" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "下へ移動: 資料作成" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "編集: 資料作成" }),
    ).toHaveCount(0);
  });
});
