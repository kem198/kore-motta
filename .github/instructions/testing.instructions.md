---
name: Testing Guidelines
description: テストコードに適用するルール
applyTo: "**/*.{spec,test}.{ts,tsx}"
---

**目次**

- [1. 基本方針](#1-基本方針)
- [2. テストタイトル](#2-テストタイトル)
  - [2.1. 良い例](#21-良い例)
  - [2.2. 避ける例](#22-避ける例)
- [3. describe と it](#3-describe-と-it)
- [4. テストのタイトル](#4-テストのタイトル)
- [5. コメント](#5-コメント)
- [6. 単体テスト](#6-単体テスト)
- [7. E2E テスト](#7-e2e-テスト)
- [8. Locator](#8-locator)
- [9. Assert](#9-assert)
- [10. Locator の命名](#10-locator-の命名)
- [11. テスト構造](#11-テスト構造)

## 1. 基本方針

- テストは期待される振る舞いに重点を置き検証する。
- テストタイトルも仕様の一部として扱う。
- テストタイトルから、前提条件・操作・期待される結果が理解できるようにする。
- 既存のテストパターン・命名規則を優先する。
- テストコードも本番コードと同様に可読性を重視する。
- 1 テストの責務は 1 機能に絞る。肥大化や依存性を避ける。

## 2. テストタイトル

テストタイトルは、実装ではなく振る舞いを表現する。

基本的には以下の形式を使用する。

- `〜すると、〜になる`
- `〜の場合、〜になる`
- `〜すると、〜できる`
- `〜の場合、〜できない`

### 2.1. 良い例

```ts
it("Todo を完了すると、完了状態になる", () => {});

it("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});

it("リセット時刻前にアクセスすると、Todo の完了状態が維持される", () => {});

it("未入力で送信すると、エラーメッセージが表示される", () => {});
```

### 2.2. 避ける例

```ts
it("setCompleted が true を設定する", () => {});

it("localStorage に false を保存する", () => {});

it("handleChange が呼ばれる", () => {});

it("useEffect が実行される", () => {});
```

テストタイトルでは、可能な限り以下を表現しない。

- 関数名
- 変数名
- 内部状態
- React Hook
- localStorage などの内部実装
- 使用しているライブラリ

## 3. describe と it

`describe` はテスト対象となる機能や仕様を表す。

`test` は、その機能において保証する具体的な振る舞いを表す。

アプリケーションの仕様や CRUD の分類に応じて、適切にカテゴライズする。

例:

```ts
test.describe("Todo ページのテスト", () => {
  test.describe("Todo の操作", () => {
    test.describe("初期表示のテスト", () => {
      test("Todo が登録済みの状態で、画面が初期表示された時、登録済み Todo の各種情報が表示されること", async ({
        ...
      });
      ...
    });
    test.describe("作成時のテスト", () => {
      ...
    });
    test.describe("更新時のテスト", () => {
      ...
    });
    test.describe("削除時のテスト", () => {
      ...
    });
  });
});
```

アプリケーションの仕様や CRUD の分類に応じて、適切にカテゴライズし、条件を明確にする。

```ts
test.describe("Todo ページのテスト", () => {
  test.describe("Todo の操作", () => {
    test.describe("初期表示のテスト", () => {
      test("Todo が登録済みの状態で、画面が初期表示された時、登録済み Todo の各種情報が表示されること", async ({
        ...
      });
      ...
    });
    test.describe("作成時のテスト", () => {
      ...
    });
    test.describe("更新時のテスト", () => {
      ...
    });
    test.describe("削除時のテスト", () => {
      ...
    });
  });
});
```

## 4. テストのタイトル

テストタイトルでは `Given`、`When`、`Then` を可能な限り明示する。

タイトルが長くなる場合は、自然な日本語で振る舞いを表現する。

```ts
it("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});
```

このテストは以下の構造を持つ。

- Given: Todo が完了している
- When: リセット時刻を過ぎてアクセスする
- Then: Todo が未完了になる

## 5. コメント

各テスト用の処理について、`// Arrange`、 `// Act`、`// Assert` のコメントをつける。

```ts
test("Todo を登録できること", async ({ page }) => {
  // Arrange
  await navigateToTodo(page);
  const nameInput = page.getByRole("textbox", { name: "新しいアイテム" });

  // Act
  await nameInput.fill("カギ");
  await page.getByRole("button", { name: "追加" }).click();

  // Assert (表示が正しいこと)
  await expect(assertScope.getByText("カギ", { exact: true })).toBeVisible();

  // Assert (データストアへ登録されていること)
  const todoStorage: AppStorage = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    APP_STORAGE_KEY,
  );
  expect(todoStorage.data.todos[0].name).toBe("カギ");
});
```

## 6. 単体テスト

以下のテストには Vitest を使用する。

- 純粋な関数
- ユーティリティ
- データ変換
- バリデーション
- 状態変更ロジック
- 日付・時刻に関するロジック
- ブラウザを必要としない処理

方針は次のとおりとする。

- テスト名 (テストの方針) は入力と出力、または観測可能な振る舞いを基準とし、テスト内の Arrange で正確な検証を行う。
- 境界値検査など、一般的な単体テストのベストプラクティスに沿って検証を行う。
- アプリケーションの規模によって、後述の

例:

```ts
describe("markAllIncompleteIfDateChanged", () => {
  it("同日ではすべての Todo を未完了にしない", () => {
    // Arrange
    const appStorage = createInitialAppStorage();
    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      27,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 27, 12, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(false);
    expect(result.appStorage).toBe(appStorage);
  });

  it("日付が変わる直前ではすべての Todo を未完了にしない", () => {
    // Arrange
    const appStorage = createInitialAppStorage();
    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      26,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 26, 23, 59, 59, 999);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(false);
    expect(result.appStorage).toBe(appStorage);
  });

  it("日付が変わった瞬間にすべての Todo を未完了にする", () => {
    // Arrange
    const appStorage = createInitialAppStorage();

    appStorage.data.todos = [
      {
        id: "todo-1",
        name: "Todo 1",
        order: 0,
        categoryId: "uncategorized",
        completed: true,
      },
      {
        id: "todo-2",
        name: "Todo 2",
        order: 1,
        categoryId: "uncategorized",
        completed: false,
      },
    ];

    appStorage.data.lastMarkedAllIncompleteAt = new Date(
      2026,
      7,
      26,
      0,
      0,
      0,
    ).toISOString();

    const now = new Date(2026, 7, 27, 0, 0, 0, 0);

    // Act
    const result = markAllIncompleteIfDateChanged(appStorage, now);

    // Assert
    expect(result.didMarkAllIncomplete).toBe(true);
    expect(result.appStorage.data.todos).toEqual([
      {
        id: "todo-1",
        name: "Todo 1",
        order: 0,
        categoryId: "uncategorized",
        completed: false,
      },
      {
        id: "todo-2",
        name: "Todo 2",
        order: 1,
        categoryId: "uncategorized",
        completed: false,
      },
    ]);
  });
});
```

アプリケーションの規模によって、単体テストの網羅性を調整する。

- 例: 小規模なアプリケーションの場合、E2E テストに重点を置き、単体テストでは重要な機能のテストに絞る。
- 例: 大規模なアプリケーションのの場合、単体テストに重点を置き、E2E テストでは単体テストで網羅した内容は省略する。

## 7. E2E テスト

以下のテストには Playwright を使用する。

- ユーザー操作
- ページ遷移
- フォーム操作
- UI の表示状態
- ブラウザ上での機能
- 複数のコンポーネントを組み合わせたユーザーシナリオ

ユーザーから見える振る舞いを検証する。

例:

```ts
test("Todo を完了すると、完了状態として表示される", async ({ page }) => {
  // ...
});
```

## 8. Locator

以下を優先する。

1. `getByRole`
2. `getByLabel`
3. `getByText`
4. その他の Locator

CSS セレクタや XPath は、上記で適切に対象を特定できない場合のみ使用する。

複数の要素が存在する場合は、適切な親要素でスコープを限定する。

`first()`、`last()`、`nth()` は、位置による選択が仕様上適切な場合にのみ使用する。

## 9. Assert

- Assert の対象範囲を明確にする。
- ページ全体を対象にした曖昧な Assert を避ける。
- 同じテキストが複数箇所に存在する場合は、適切な Locator にスコープを限定する。
- Toast、Modal、Navigation など、テスト対象外の UI が Assert に影響しないようにする。
- 実装詳細ではなく、ユーザーが確認できる状態を Assert する。
- テストを PASS させるためだけに Assert を弱めない。

## 10. Locator の命名

Locator は、対象の役割が分かる名前にする。

良い例:

```ts
# 優先
let assertScope: Locator;

# その他の例
let calendarSection: Locator;
let resultArea: Locator;
```

避ける例:

```ts
let locator: Locator;
let element: Locator;
let area: Locator;
```

ただし、`area`、`section`、`panel` 自体を禁止するものではない。

## 11. テスト構造

- テスト対象ページへの共通の遷移処理は必要に応じて関数化する。
- テスト同士で状態を共有しない。
- テストの実行順序に依存しない。
- 既存のテスト構造を優先する。
- ロジック (正規表現や条件分岐など) はなるべく利用せず、手続き的に検証する。
