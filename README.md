# Kore Motta?

[Kore Motta?](https://kore-motta.kem198.net) は、日頃の「これ持った？」を確認するためのシンプルな Todo アプリです。

- 日付をまたいだとき、すべての Todo アイテムを未完了へ戻します。
- アイテムが期限切れとして溜まらないため、好みのタイミングで使えます。
- 登録内容はブラウザの [localStorage](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) に保存します。

## 公開中の URL

- <https://kore-motta.kem198.net>

## 主な機能

- Todo アイテムの作成・編集・削除・並び替え
- Todo アイテムの一括未完了化 (自動 / 手動)
- Todo アイテムのカテゴリ分類
- JSON 形式によるエクスポート・インポート

この他、詳細な仕様については [specification.md](docs/specification.md) をご確認ください。

## ローカル環境での実行

### 必須

- [Node.js](https://nodejs.org/ja) ^24.19.0

### 推奨

- [Volta](https://volta.sh/)
- Unix 系 OS (WSL / Linux / macOS)

### 実行までの手順

```shell
# リポジトリの Clone
git clone git@github.com:kem198/kore-motta.git
cd kore-motta

# パッケージのインストール
npm install

# ローカルサーバの起動 (開発用)
npm run dev

# ローカルサーバの起動 (本番用)
npm run build
npm run start
```

## 使用技術

### 言語

- [TypeScript](https://www.typescriptlang.org/)

### フレームワーク

- [Next.js](https://nextjs.org/)

### UI 構築

- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Fonts](https://fonts.google.com/)
- [Lucide](https://lucide.dev/)

### バリデーション

- [Zod](https://zod.dev/)

### テスト・CI

- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [GitHub Actions](https://github.com/features/actions)

### コードレビュー

- [Gemini Code Assist on GitHub](https://docs.cloud.google.com/gemini/docs/code-review/review-repo-code?hl=ja)

### ドメイン管理・ホスティング

- [Xserver Domain](https://www.xdomain.ne.jp/)
- [Vercel](https://vercel.com/)
