---
applyTo: "**/*.{js,jsx,ts,tsx}"
---

# Next.js 開発ルール

- Server Component をデフォルトとする。
- Client Component が必要な場合のみ `"use client"` を使用する。
- Next.js のバージョンや API に依存する実装を行う場合は、現在のプロジェクトで使用している Next.js のドキュメントを確認する。
- 非推奨となっている API や規約を使用しない。
