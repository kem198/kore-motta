# Kore Motta?

Kore Motta? は、毎日の「これ持った？」を確認するためのシンプルな Todo アプリです。

- カテゴリごとに Todo を管理します。
- 設定した時刻にカテゴリに属するすべての Todo を未完了へリセットします。
- 登録データはブラウザの [localStorage](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) に保存します。

## 公開中の URL

- [Kore Motta?](https://kore-motta.kem198.net)

## 主な機能

- Todo の作成・編集・削除・並び替え
- カテゴリの作成・編集・削除
- カテゴリごとの Todo 一括未完了化 (自動・手動)
- JSON 形式によるエクスポート・インポート

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

### スタイリング

- [Tailwind CSS](https://tailwindcss.com/)

### フォント

- [Google Fonts](https://fonts.google.com/)
  - [Noto Sans Japanese](https://fonts.google.com/noto/specimen/Noto+Sans+JP)
  - [Ubuntu Sans](https://fonts.google.com/specimen/Ubuntu+Sans)
  - [Ubuntu Sans Mono](https://fonts.google.com/specimen/Ubuntu+Sans+Mono)

### アイコン

- [Lucide](https://lucide.dev/)

### テスティング

- [Playwright](https://playwright.dev/)

### ホスティング

- [Vercel](https://vercel.com/)

### ドメイン取得 / DNS 管理

- [Xserver Domain](https://www.xdomain.ne.jp/)
