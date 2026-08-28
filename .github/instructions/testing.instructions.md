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
  - [3.2. Arrange / Act / Assert とコメント](#32-arrange--act--assert-とコメント)
  - [3.3. テストの独立性](#33-テストの独立性)
- [4. テストタイトル](#4-テストタイトル)
  - [4.1. 基本方針](#41-基本方針)
  - [4.2. Given / When / Then 構造](#42-given--when--then-構造)
  - [4.3. 良い例と避ける例](#43-良い例と避ける例)
- [5. Locator](#5-locator)
  - [5.1. 取得の優先順位](#51-取得の優先順位)
  - [5.2. Locator の命名](#52-locator-の命名)
- [6. Assert](#6-assert)
- [7. テストコードの実装ルール](#7-テストコードの実装ルール)

## 1. 基本方針

- テストは内部実装ではなく、ユーザーから観測できる期待される振る舞いを検証する。
- 1 つのテストの責務は 1 つの機能に絞り、肥大化やテスト間の依存を避ける。
- 可読性を重視し、既存のテストパターン・命名規則・構造を優先する。
- テストを PASS させることだけを目的として、`Assert` を弱めたり、テストを削除・スキップしたりしない。

## 2. テスト種別

### 2.1. 単体テスト

ブラウザを必要としない処理には [Vitest](https://vitest.dev/) を使用する。

- 入力と出力、または観測可能な振る舞いを基準とする。

- 境界値検査などのベストプラクティスに沿って検証する。

**対象:**

- 純粋な関数 / ユーティリティ
- データ変換 / バリデーション
- 状態変更ロジック / 日付・時刻に関するロジック

**例:**

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

**対象:**

- ユーザー操作 / ページ遷移 / フォーム操作
- UI の表示状態 / ブラウザ上での機能
- 複数のコンポーネントを組み合わせたユーザーシナリオ

E2E テストでは、ユーザーから見える振る舞いを検証する。

**例:**

```ts
test("Todo を完了すると、完了状態として表示される", async ({ page }) => {
  // ...
});
```

### 2.3. テストの配分

- **小規模アプリ:**
  - E2E テストに重点を置き、ユーザー操作上考えられるケースを中心に構成する。
  - 単体テストは重要なロジックに絞る。
- **大規模アプリ・高品質を要求するアプリ:**
  - 単体テストに重点を置き、各関数や処理などに対して正確にテストする。
  - E2E テストではユーザー操作上考えられるケースの代表例を中心に構成する。

## 3. テスト構造

### 3.1. describe と test

- `describe`: テスト対象の機能・仕様・カテゴリ (CRUD など) を表す。共通分類が不要なら省略可。
- `test`: 保証する具体的な振る舞いを表す。条件が異なる場合はテストを分ける。

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

### 3.2. Arrange / Act / Assert とコメント

各テストは可能な限り以下の 3 段階に分けて構成し、対応する明示的なコメント `( // Arrange , // Act , // Assert )` を挿入する。

1. **Arrange**: 前提条件の準備。
2. **Act**: 検証対象の操作を実行。
3. **Assert**: 期待される結果を検証。`Assert` が複数観点に分かれる場合は補足コメントを追記する。

例:

```ts
test("Todo を登録すると、登録した Todo が表示される", async ({ page }) => {
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

### 3.3. テストの独立性

- テスト同士で状態を共有せず、実行順序に依存させない。
- 各テストは単独実行で成立させる。
- 共通のページ遷移処理などは関数化して再利用する。

## 4. テストタイトル

### 4.1. 基本方針

実装ではなく、利用者の視点での操作と期待する振る舞いを表現する。

**推奨形式:**

- `〜すると、〜になる`
- `〜の場合、〜になる`
- `〜すると、〜できる`
- `〜の場合、〜できない`

**タイトルに含めない要素:**

- 関数名 / 変数名 / 内部状態
- `React Hook` / `localStorage` などの内部実装や使用ライブラリ

### 4.2. Given / When / Then 構造

テストタイトルは可能な限り `Given` 、 `When` 、 `Then` の構造を意識する。

長くなりすぎる場合は自然な日本語表現を優先する。

構造例:

```ts
test("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});
```

上記の例では以下の構造を持つ。

- **Given**: Todo が完了している
- **When**: リセット時刻を過ぎてアクセスする
- **Then**: Todo が未完了になる

### 4.3. 良い例と避ける例

**良い例:**

```ts
test("Todo を完了すると、完了状態になる", () => {});
test("未入力で送信すると、エラーメッセージが表示される", () => {});
```

**避ける例:**

```ts
test("setCompleted が true を設定する", () => {});
test("localStorage に false を保存する", () => {});
test("handleChange が呼ばれる", () => {});
test("useEffect が実行される", () => {});
```

## 5. Locator

### 5.1. 取得の優先順位

ユーザーが認識できる情報やアクセシビリティ属性を優先する。

1. `getByRole`
2. `getByLabel`
3. `getByText`
4. その他の Locator

`aria-label` などの既存属性を活用し、テスト専用属性 (`data-testid`) や CSS セレクタ、`XPath` の使用は最小限にする。

### 5.2. Locator の命名

対象の役割が明確に伝わる命名にする。

- **良い例:** `assertScope` , `calendarSection` , `resultArea`
- **避ける例:** `locator` , `element` , `area`

## 6. Assert

- 検証対象を明確にし、適切な `Locator` にスコープを限定する。
- 内部実装ではなく、ユーザーが確認できる UI 上の状態を検証する。
- 必要に応じてデータストアへの反映を検証する。
- テスト対象外の UI (Toast , Modal , Navigation など) が `Assert` に影響しないように構成する。

## 7. テストコードの実装ルール

- 複雑なロジック (正規表現や条件分岐など) は避け、期待される結果を直接検証する。
- 本番コードと同じロジックをテストコード内で再実装しない。
- 既存の構造・命名規則・ヘルパーを優先利用する。
- 抽象化や共通化は、明確な重複がある場合に限定する。
