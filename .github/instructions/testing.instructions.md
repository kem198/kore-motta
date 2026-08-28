---
name: Testing Guidelines
description: テストコードに適用するルール
applyTo: "**/*.{spec,test}.{ts,tsx}"
---

**目次**

- [1. 基本方針](#1-基本方針)
- [2. テスト種別](#2-テスト種別)
  - [2.1. 単体テスト](#21-単体テスト)
  - [2.2. E2E テスト](#22-e2e-テスト)
  - [2.3. テストの配分](#23-テストの配分)
- [3. テスト構造](#3-テスト構造)
  - [3.1. describe と test](#31-describe-と-test)
  - [3.2. Arrange / Act / Assert](#32-arrange--act--assert)
  - [3.3. テストの独立性](#33-テストの独立性)
- [4. テストタイトル](#4-テストタイトル)
  - [4.1. 基本方針](#41-基本方針)
  - [4.2. Given / When / Then](#42-given--when--then)
  - [4.3. 良い例](#43-良い例)
  - [4.4. 避ける例](#44-避ける例)
- [5. Locator](#5-locator)
  - [5.2. Locator の命名](#52-locator-の命名)
- [6. Assert](#6-assert)
- [7. コメント](#7-コメント)
- [8. テストコードの実装ルール](#8-テストコードの実装ルール)

## 1. 基本方針

- テストは実装ではなく、ユーザーから観測できる期待される振る舞いを検証する。
- ひとつのテストの責務はひとつの機能に絞り、テストの肥大化やテスト間の依存を避ける。
- テストコードも本番コードと同様に可読性を重視し、既存のテストパターン・命名規則・構造を優先する。
- テストを PASS させることだけを目的として、Assert を弱めたり、テストを削除・スキップしたりしない。

## 2. テスト種別

### 2.1. 単体テスト

ブラウザを必要としない処理には [Vitest](https://vitest.dev/) を使用する。

対象:

- 純粋な関数
- ユーティリティ
- データ変換
- バリデーション
- 状態変更ロジック
- 日付・時刻に関するロジック
- その他、ブラウザを必要としない処理

単体テストでは、入力と出力、または観測可能な振る舞いを基準として検証する。

境界値検査など、一般的な単体テストのベストプラクティスに沿って検証する。

例:

```ts
describe("markAllIncompleteIfDateChanged", () => {
  test("同日ではすべての Todo を未完了にしない", () => {
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

  test("日付が変わる直前ではすべての Todo を未完了にしない", () => {
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

  test("日付が変わった瞬間にすべての Todo を未完了にする", () => {
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

### 2.2. E2E テスト

ユーザー操作やブラウザ上での振る舞いには [Playwright](https://playwright.dev/) を使用する。

対象:

- ユーザー操作
- ページ遷移
- フォーム操作
- UI の表示状態
- ブラウザ上での機能
- 複数のコンポーネントを組み合わせたユーザーシナリオ

E2E テストでは、ユーザーから見える振る舞いを検証する。

例:

```ts
test("Todo を完了すると、完了状態として表示される", async ({ page }) => {
  // ...
});
```

### 2.3. テストの配分

アプリケーションの規模に応じて、単体テストと E2E テストの網羅性を調整する。

- 小規模なアプリケーションでは、E2E テストに重点を置き、単体テストは重要なロジックに絞る。
- 大規模・または高い品質を求められるアプリケーションでは、単体テストに重点を置き、E2E テストでは単体テストで網羅した内容を重複して検証しない。

## 3. テスト構造

### 3.1. describe と test

`describe` はテスト対象となる機能や仕様を表す。

`test` は、その機能において保証する具体的な振る舞いを表す。

アプリケーションの仕様や CRUD などの分類に応じて、適切にカテゴライズする。

条件が異なる場合は、テストを分けてそれぞれの条件を明確にする。

例:

```ts
test.describe("Todo ページ", () => {
  test.describe("Todo の操作", () => {
    test.describe("初期表示", () => {
      test("Todo が登録済みの状態で、画面が初期表示されると、登録済み Todo の各種情報が表示される", async ({
        page,
      }) => {
        // ...
      });
    });

    test.describe("作成", () => {
      test("Todo を登録すると、登録した Todo が表示される", async ({
        page,
      }) => {
        // ...
      });
    });

    test.describe("更新", () => {
      // ...
    });

    test.describe("削除", () => {
      // ...
    });
  });
});
```

共通の分類が不要な場合は、無理に `describe` を追加しない。

### 3.2. Arrange / Act / Assert

各テストは、可能な限り以下の 3 段階に分ける。

1. **Arrange**: テストに必要な前提条件を準備する。
2. **Act**: 検証対象となる操作を実行する。
3. **Assert**: 期待される結果を検証する。

例:

```ts
test("Todo を登録すると、登録した Todo が表示される", async ({ page }) => {
  // Arrange
  await navigateToTodo(page);
  const nameInput = page.getByRole("textbox", { name: "新しいアイテム" });

  // Act
  await nameInput.fill("カギ");
  await page.getByRole("button", { name: "追加" }).click();

  // Assert
  await expect(assertScope.getByText("カギ", { exact: true })).toBeVisible();
});
```

### 3.3. テストの独立性

- テスト同士で状態を共有しない。
- テストの実行順序に依存しない。
- 各テストは単独で実行しても成立するようにする。
- テスト対象ページへの共通の遷移処理など、必要な処理は関数化する。

## 4. テストタイトル

### 4.1. 基本方針

テストタイトルは、実装ではなく振る舞いを表現する。

基本的には以下の形式を使用する。

- `〜すると、〜になる`
- `〜の場合、〜になる`
- `〜すると、〜できる`
- `〜の場合、〜できない`

タイトルだけで、何をすると何が起きるのか理解できるようにする。

テストタイトルでは、可能な限り以下を表現しない。

- 関数名
- 変数名
- 内部状態
- React Hook
- `localStorage` などの内部実装
- 使用しているライブラリ

### 4.2. Given / When / Then

テストタイトルでは、可能な限り `Given`、`When`、`Then` の構造を明示する。

ただし、タイトルが不自然に長くなる場合は、自然な日本語で振る舞いを表現する。

例えば、

```ts
test("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});
```

は以下の構造を持つ。

- **Given**: Todo が完了している
- **When**: リセット時刻を過ぎてアクセスする
- **Then**: Todo が未完了になる

### 4.3. 良い例

```ts
test("Todo を完了すると、完了状態になる", () => {});

test("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});

test("リセット時刻前にアクセスすると、Todo の完了状態が維持される", () => {});

test("未入力で送信すると、エラーメッセージが表示される", () => {});
```

### 4.4. 避ける例

```ts
test("setCompleted が true を設定する", () => {});

test("localStorage に false を保存する", () => {});

test("handleChange が呼ばれる", () => {});

test("useEffect が実行される", () => {});
```

特に E2E テストでは、利用者の視点での操作と期待する結果を表現したテストタイトルにする。

## 5. Locator

ユーザーが認識できる情報やアクセシビリティ属性を優先して Locator を取得する。

以下の優先順位で使用する。

1. `getByRole`
2. `getByLabel`
3. `getByText`
4. その他の Locator

テスト専用の属性 (`data-testid` など) は、可能な限り追加せず、`aria-label` などの既存のアクセシビリティ属性やユーザーが認識できる情報を利用する。

CSS セレクタや XPath は、上記の方法で適切に対象を特定できない場合のみ使用する。

### 5.2. Locator の命名

Locator は、対象の役割が分かる名前にする。

良い例:

```ts
let assertScope: Locator;
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

## 6. Assert

- Assert は検証対象を明確にし、適切な Locator にスコープを限定する。
- 実装詳細ではなく、ユーザーが確認できる状態を検証する。
- 必要に応じて、UI 上の状態とデータストアへの反映を検証する。
- テスト対象外の UI (Toast、Modal、Navigation など) が Assert に影響しないようにする。
- テストを PASS させることだけを目的として、Assert を弱めない。

例:

```ts
// Assert (表示が正しいこと)
await expect(assertScope.getByText("カギ", { exact: true })).toBeVisible();

// Assert (データストアへ登録されていること)
const todoStorage: AppStorage = await page.evaluate(
  (key) => JSON.parse(localStorage.getItem(key)),
  APP_STORAGE_KEY,
);

expect(todoStorage.data.todos[0].name).toBe("カギ");
```

## 7. コメント

各テストの処理は、可能な限り `// Arrange`、`// Act`、`// Assert` のコメントで区切る。

```ts
test("Todo を登録すると、登録した Todo が表示される", async ({ page }) => {
  // Arrange
  await navigateToTodo(page);
  const nameInput = page.getByRole("textbox", { name: "新しいアイテム" });

  // Act
  await nameInput.fill("カギ");
  await page.getByRole("button", { name: "追加" }).click();

  // Assert
  await expect(assertScope.getByText("カギ", { exact: true })).toBeVisible();
});
```

Assert が複数の観点に分かれる場合は、必要に応じて補足コメントを付ける。

```ts
// Assert (表示が正しいこと)
await expect(assertScope.getByText("カギ", { exact: true })).toBeVisible();

// Assert (データストアへ登録されていること)
const todoStorage: AppStorage = await page.evaluate(
  (key) => JSON.parse(localStorage.getItem(key)),
  APP_STORAGE_KEY,
);

expect(todoStorage.data.todos[0].name).toBe("カギ");
```

## 8. テストコードの実装ルール

- テストコードでは複雑なロジック (正規表現や条件分岐など) をなるべく使用せず、期待される結果を直接検証する。
- 本番コードと同じロジックをテストコード内に再実装しない。
- テストの可読性を優先し、何を検証しているのか明確にする。
- 既存のテスト構造・命名規則・ヘルパーを優先して利用する。
- 抽象化や共通化は、複数のテストで明確な重複がある場合に限定する。
