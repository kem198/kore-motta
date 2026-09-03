export const MESSAGES = {
  actions: {
    yes: "はい",
    update: "更新",
    cancel: "キャンセル",
    copy: "コピー",
    add: "追加",
    createCategory: "カテゴリ作成",
    edit: "編集",
    editDone: "編集完了",
    editStart: "編集開始",
    done: "完了",
    reset: "初期化",
    import: "インポート",
    export: "エクスポート",
    delete: "削除",
    unset: "未設定",
  },

  dialogs: {
    editItem: "アイテム設定",
    deleteItem: {
      title: "アイテムの削除",
      description: "下記のアイテムを削除します。",
    },
    reset: {
      title: "登録内容の初期化",
      description: "登録内容を初期状態に戻します。",
    },
    export: {
      title: "登録内容のエクスポート",
      description:
        "ブラウザ上に保存されている登録内容を表示します。\nコピーして復元や端末間の移行にご利用ください。",
    },
    import: {
      title: "登録内容のインポート",
      description:
        "登録内容を復元します。\n「エクスポート」でコピーした文字列を貼り付けて「インポート」ボタンを押してください。",
    },
  },

  labels: {
    title: "タイトル",
    memo: "メモ",
    categoryName: "カテゴリ名",
    categoryList: "カテゴリ一覧",
  },

  placeholders: {
    title: "スマホ",
    memo: "充電しておく",
    newItem: "新しいアイテム",
    categoryName: "お出かけ",
  },

  validation: {
    requiredNote: "は必須項目です。",
    minName: "1 文字以上入力してください。",
    maxName: "50 文字以下で入力してください。",
    maxMemo: "100 文字以下で入力してください。",
  },

  warnings: {
    irreversible: "この操作は元に戻せません。",
    overwrite: "現在の登録内容を上書きします。この操作は元に戻せません。",
  },

  aria: {
    moveUp: "上へ移動",
    moveDown: "下へ移動",
  },

  toast: {
    created: "アイテムを登録しました",
    updated: "アイテムを更新しました",
    deleted: "アイテムを削除しました",
    imported: "アイテムをインポートしました",
    repaired: "保存済みの内容に問題があったため復旧しました",
    repairedDescription: "復旧できなかった内容は初期化されています。",
    categoryCreated: "カテゴリを追加しました",
    categoryUpdated: "カテゴリを更新しました",
    categoryDeleted: "カテゴリを削除しました",
    reordered: "並び順を更新しました",
    markedAllIncomplete: "すべてのアイテムを未完了に戻しました",
    markedAllCompletedInCategory: "カテゴリ内の全アイテムを完了しました！",
    reset: "登録内容を初期化しました",
    error: "エラー",
    importError: "データの形式が不正なため、インポートできませんでした。",
    clipboardCopied: "登録内容をクリップボードにコピーしました",
    clipboardCopyError: "登録内容をクリップボードにコピーできませんでした",
    changedTodoPosition: (position: "left" | "right") =>
      `チェックボタンの位置を ${position === "right" ? "右" : "左"} へ変更しました`,
  },
} as const;
