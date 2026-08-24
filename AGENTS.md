<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Agent Instructions

## 基本方針

- 回答・説明は日本語で行う。
- 既存のコード・設計・命名規則を確認してから変更する。
- 既存の実装パターンを優先する。
- 必要最小限の変更を行う。
- 指示されていない変更やリファクタリングは行わない。
- 関係のないファイルやコードを変更しない。
- 推測で実装せず、必要な情報が不足している場合は確認する。
- 既存のコードで問題がない場合は、不要な変更を行わない。
- ルールが競合する場合は、より具体的なファイルの指示を優先する。
  例: テスト関連は testing.instructions.md を優先する。

## 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- Playwright

## TDD

機能追加や仕様変更では、原則としてテストファーストおよびテスト駆動開発 (TDD) で進める。

1. 関連する既存コードとテストを確認する。
2. 要求を受け入れ条件に分解する。
3. 受け入れ条件を表すテストを先に作成する。
4. テストを実行し、期待どおり FAIL することを確認する。
5. テストを PASS させるための最小限の実装を行う。
6. 関連するテストを実行する。
7. 必要な場合のみリファクタリングする。

### TDD の原則

- テストは仕様を表現するものとして扱う。
- テストタイトルは、検証する振る舞いを表現する。
- テストを PASS させることだけを目的として、Assert を弱めない。
- テストを削除して問題を解決しない。
- テストをスキップして問題を回避しない。
- 実装に合わせて仕様を勝手に変更しない。
- テストと仕様が一致していることを確認する。
- テストが失敗した場合は、失敗の原因を確認してから修正する。

### 既存テストが失敗した場合

既存テストが失敗した場合は、以下を確認する。

1. 仕様変更によってテストが古くなったのか。
2. 実装変更による回帰なのか。
3. テスト自体が誤っているのか。

原因を判断してから変更する。

## テストの使い分け

- 純粋なロジックや関数のテストには Vitest を使用する。
- ブラウザを必要とするユーザー操作や UI の振る舞いには Playwright を使用する。
- ブラウザを必要としない処理を Playwright だけでテストしない。
- Vitest と Playwright で同じ振る舞いを不必要に重複してテストしない。

## 実装方針

- TypeScript の型安全性を優先する。
- `any` は原則として使用しない。
- ファイルの編集後、TypeScript や Lint のエラーを確認して適宜修正すること。放置して次の実装に進まないこと。
- Server Component をデフォルトとする。
- Client Component が必要な場合のみ `"use client"` を使用する。
- 既存のコンポーネントを優先して再利用する。
- 新しいライブラリを追加する前に、既存のライブラリで実現できないか検討する。
- 新しい抽象化を導入する前に、既存の実装を再利用できないか検討する。

## 命名

- 既存コードの命名規則を優先する。
- 変数名・関数名は役割が明確になる名前にする。
- 略語は一般的なものを除いて使用しない。
- Boolean 値には `is`、`has`、`can` などを使用する。
- イベントハンドラには `handle` プレフィックスを使用する。

## 変更方針

- 変更は必要最小限にする。
- 既存 API やコンポーネントの仕様を不用意に変更しない。
- 指示されていない変更やリファクタリングを行わない。
- 関係のない既存コードを変更しない。
- 指示されていない変更を行った場合は、その箇所と理由を説明する。

## 完了時

変更後は以下を簡潔に説明する。

- 変更したファイル
- 変更内容
- 実行したテスト
- テスト結果

テストが失敗した場合は、失敗したテストと原因を説明する。

## コマンド実行

テスト実行などのコマンドを実行する場合、まずプロジェクトの `package.json` を確認し、定義済みであればそのスクリプトを優先して実行する。
