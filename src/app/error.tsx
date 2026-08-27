"use client";

import { StorageRecoveryDialog } from "@/components/shared/dialog/storage-recovery-dialog";
import { Button } from "@/components/ui/button";
import {
  APP_STORAGE_KEY,
  createInitialAppStorage,
  saveAppStorage,
} from "@/lib/app-storage";
import { useEffect, useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [storage, setStorage] = useState<string | null>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleOpenRecovery = () => {
    setStorage(window.localStorage.getItem(APP_STORAGE_KEY));
    setIsRecoveryOpen(true);
  };

  const handleReset = () => {
    saveAppStorage(createInitialAppStorage());
    window.location.reload();
  };

  return (
    <>
      <div className="typeset typeset-docs space-y-6 p-4">
        <h2>意図しないエラーが発生しました。</h2>

        <p>以下のボタンを押して、再試行してください。</p>

        <Button onClick={reset}>再試行</Button>

        <p>
          問題が解決しない場合、保存データのバックアップおよび初期化を行ってください。
        </p>

        <Button onClick={handleOpenRecovery}>バックアップして初期化</Button>
      </div>

      <StorageRecoveryDialog
        open={isRecoveryOpen}
        storage={storage}
        mode="error"
        onReset={handleReset}
      />
    </>
  );
}
