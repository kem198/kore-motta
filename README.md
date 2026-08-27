# Kore Motta?

[Kore Motta?](https://kore-motta.kem198.net) は、日頃の「これ持った？」を確認するためのシンプルな Todo アプリです。

- 日付をまたいだとき、すべての Todo を未完了へリセットします。
- カテゴリごとに Todo を管理します。
- 登録内容はブラウザの [localStorage](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) に保存します。

## 公開中の URL

- <https://kore-motta.kem198.net>

## 主な機能

- Todo の作成・編集・削除・並び替え
- Todo の一括未完了化 (自動)
- カテゴリの作成・編集・削除
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

### フレームワーク

- [Next.js](https://nextjs.org/)

### 言語

- [TypeScript](https://www.typescriptlang.org/)

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



### ドメイン管理・ホスティング

- [Xserver Domain](https://www.xdomain.ne.jp/)
- [Vercel](https://vercel.com/)
