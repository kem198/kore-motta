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
- 指示されていない変更やリファクタリングを行わない。
- 関係のないファイルやコードを変更しない。
- 推測で実装せず、必要な情報が不足している場合は確認する。
- 既存の実装で問題がない場合は、不要な変更を行わない。

## 指示ファイル・ドキュメント

作業を開始する前に、作業に関連する以下のファイルを確認する。

- [コーディング規約](/docs/coding-conventions.md)
- [仕様書](/docs/specification.md)
- [.github/instructions/](/.github/instructions/)
- [.gemini/styleguide.md](/.gemini/styleguide.md)

各ファイルに記載されたルール・仕様を、対象となる作業やファイルに適用する。

複数の指示がある場合やルールが競合する場合は、より具体的に対象へ適用される指示を優先する。

## 変更

- 変更は必要最小限にする。
- 指示されていない機能追加やリファクタリングを行わない。
- 関係のないファイルやコードを変更しない。
- 既存 API や仕様を不用意に変更しない。
- 必要な変更と、それに伴う変更を区別する。
- 指示されていない変更を行った場合は、その箇所と理由を説明する。

## 調査・判断

- 実装前に、関連する既存コード・設定・テスト・ドキュメントを確認する。
- 既存の実装や設定を確認せずに推測で変更しない。
- 不明な仕様や挙動は、関連するコード・テスト・ドキュメントを確認する。
- 複数の実装方法がある場合は、既存の実装方針と整合する方法を優先する。
- 判断に必要な情報が不足している場合は、実装を進めず確認する。

## テストファースト

機能追加や仕様変更では、原則としてテストファーストで進める。

具体的な作業では、TDD (Red → Green → Refactor) のサイクルを使用する。

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

### 既存テストが失敗した場合

既存テストが失敗した場合は、以下を確認する。

1. 仕様変更によってテストが古くなったのか。
2. 実装変更による回帰なのか。
3. テスト自体が誤っているのか。

原因を判断してから変更する。

## エラー・検証

- エラーを無視したり、隠したりしない。
- 警告やエラーを解消せずに作業を完了しない。
- テストを PASS させることだけを目的として、検証内容を弱めない。
- テストを削除・スキップして問題を回避しない。
- 変更後は、変更による影響範囲を確認する。

## コマンド実行

- コマンドを実行する場合は、まずプロジェクトの設定ファイルやドキュメントを確認する。
- 定義済みのコマンドがある場合は、それを優先して実行する。

## 完了時

変更後は以下を簡潔に説明する。

- 変更したファイル
- 変更内容
- 実行したテスト
- テスト結果

テストが失敗した場合は、失敗したテストと原因を説明する。
