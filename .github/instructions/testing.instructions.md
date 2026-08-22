---
name: Testing Guidelines
description: Vitest と Playwright のテストコードに適用するルール
applyTo: "**/*.{spec,test}.{ts,tsx}"
---

# Testing Instructions

## 基本方針

- テストは実装詳細ではなく、期待される振る舞いを検証する。
- テストタイトルも仕様の一部として扱う。
- テストタイトルから、前提条件・操作・期待される結果が理解できるようにする。
- 既存のテストパターン・命名規則を優先する。
- テストコードも本番コードと同様に可読性を重視する。
- 1 テストの責務は 1 機能に絞る。肥大化や依存性を避ける。

## テストタイトル

テストタイトルは、実装ではなく振る舞いを表現する。

基本的には以下の形式を使用する。

- `〜すると、〜になる`
- `〜の場合、〜になる`
- `〜すると、〜できる`
- `〜の場合、〜できない`

### 良い例

```ts
it("Todo を完了すると、完了状態になる", () => {});

it("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});

it("リセット時刻前にアクセスすると、Todo の完了状態が維持される", () => {});

it("未入力で送信すると、エラーメッセージが表示される", () => {});
```

### 避ける例

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

## describe と it

`describe` はテスト対象となる機能や仕様を表す。

`it` は、その機能において保証する具体的な振る舞いを表す。

例:

```ts
describe("Todo のリセット", () => {
  it("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {
    // ...
  });

  it("リセット時刻前にアクセスすると、Todo の完了状態が維持される", () => {
    // ...
  });
});
```

必要に応じて `describe` をネストし、条件を明確にする。

```ts
describe("Todo のリセット", () => {
  describe("リセット時刻前の場合", () => {
    it("Todo の完了状態が維持される", () => {
      // ...
    });
  });

  describe("リセット時刻を過ぎた場合", () => {
    it("Todo が未完了に戻る", () => {
      // ...
    });
  });
});
```

## Given / When / Then

テストタイトルでは `Given`、`When`、`Then` を明示しなくてもよい。

自然な日本語で振る舞いを表現する。

```ts
it("リセット時刻を過ぎてアクセスすると、Todo が未完了に戻る", () => {});
```

このテストは以下の構造を持つ。

- Given: Todo が完了している
- When: リセット時刻を過ぎてアクセスする
- Then: Todo が未完了になる

## コメント

各テスト用の処理について、`// Arrange`、 `// Act`、`// Assert` のコメントをつけること。

```ts
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
    await expect(assertScope.getByText("カギ", { exact: true })).toBeVisible();
    await expect(
      assertScope.getByText("家の鍵", { exact: true }),
    ).toBeVisible();
  });
});
```

## Vitest

※現在の方針では Vitest は採用していない。テストが肥大化してきた際に環境構築を検討する。

<!-- 以下のテストには Vitest を使用する。

- 純粋な関数
- ユーティリティ
- データ変換
- バリデーション
- 状態変更ロジック
- 日付・時刻に関するロジック
- ブラウザを必要としない処理

実装詳細ではなく、入力と出力、または観測可能な振る舞いを検証する。

正常系だけでなく、必要に応じて境界値や異常系も検証する。

例:

```ts
describe("Todo のリセット判定", () => {
  it("リセット時刻を過ぎると、リセットが必要になる", () => {
    // ...
  });

  it("リセット時刻前の場合、リセットは必要にならない", () => {
    // ...
  });

  it("リセット時刻ちょうどの場合、リセットが必要になる", () => {
    // ...
  });
});
``` -->

## Playwright

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

## Locator

以下を優先する。

1. `getByRole`
2. `getByLabel`
3. `getByText`
4. その他の Locator

CSS セレクタや XPath は、上記で適切に対象を特定できない場合のみ使用する。

複数の要素が存在する場合は、適切な親要素でスコープを限定する。

`first()`、`last()`、`nth()` は、位置による選択が仕様上適切な場合にのみ使用する。

## Assert

- Assert の対象範囲を明確にする。
- ページ全体を対象にした曖昧な Assert を避ける。
- 同じテキストが複数箇所に存在する場合は、適切な Locator にスコープを限定する。
- Toast、Modal、Navigation など、テスト対象外の UI が Assert に影響しないようにする。
- 実装詳細ではなく、ユーザーが確認できる状態を Assert する。
- テストを PASS させるためだけに Assert を弱めない。

## Locator の命名

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

## テスト構造

- テスト対象ページへの共通の遷移処理は必要に応じて関数化する。
- テスト同士で状態を共有しない。
- テストの実行順序に依存しない。
- 既存のテスト構造を優先する。
