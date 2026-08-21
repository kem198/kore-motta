"use client";

import { sampleEtrians } from "@/app/(toys)/etrian-calendar/_common/constants/sample";
import { Etrian } from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import { ConfirmDialog } from "@/app/(toys)/etrian-calendar/_features/registry/components/dialog/confirm-dialog";
import { ExportDialog } from "@/app/(toys)/etrian-calendar/_features/registry/components/dialog/export-dialog";
import { ImportDialog } from "@/app/(toys)/etrian-calendar/_features/registry/components/dialog/import-dialog";
import { EtrianRegistryForm } from "@/app/(toys)/etrian-calendar/_features/registry/components/etrian-registry-form";
import { EtrianRegistryItemList } from "@/app/(toys)/etrian-calendar/_features/registry/components/etrian-registry-list";
import { useEtrianRegistry } from "@/app/(toys)/etrian-calendar/_features/registry/hooks/use-etrian-registry";
import { RegistryFormValues } from "@/app/(toys)/etrian-calendar/_features/registry/schemas/registry-form-schema";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  AlertCircleIcon,
  DownloadIcon,
  UploadIcon,
  UserPen,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function EtrianRegistry() {
  const {
    storedEtrians,
    storedEtrianRegistry,
    isLoaded,
    migrationError,
    addEtrian,
    updateEtrian,
    updateEtrians,
    deleteEtrianById,
    resetEtrians,
    importEtrianRegistry,
    clearMigrationError,
  } = useEtrianRegistry();

  const [isEditing, setIsEditing] = useState(false);

  const handleCreate = useCallback(
    (values: RegistryFormValues) => {
      const trimmedName = values.name.trim();
      if (!trimmedName) {
        return;
      }

      const newEtrian: Etrian = {
        id: crypto.randomUUID(),
        name: trimmedName,
        order: 0,
        memo: values.memo?.trim() || undefined,
      };

      addEtrian(newEtrian);

      toast.add({
        title: "冒険者を登録しました！",
        description: `冒険者: ${trimmedName}`,
        type: "success",
      });
    },
    [addEtrian],
  );

  const handleDelete = useCallback(
    (target: Etrian) => {
      deleteEtrianById(target.id);

      toast.add({
        title: "冒険者を削除しました",
        description: `冒険者: ${target.name}`,
        type: "success",
      });
    },
    [deleteEtrianById],
  );

  const handleUpdate = useCallback(
    (updated: Etrian) => {
      updateEtrian(updated);

      toast.add({
        title: "冒険者情報を更新しました！",
        description: `冒険者: ${updated.name}`,
        type: "success",
      });
    },
    [updateEtrian],
  );

  const handleReset = useCallback(() => {
    resetEtrians();
    localStorage.removeItem("etrianRegistryInitialized");
    setIsEditing(false);
    toast.add({
      title: "登録内容を初期化しました",
      type: "success",
    });
  }, [resetEtrians]);

  const handleMigrationErrorConfirm = useCallback(() => {
    resetEtrians();
    localStorage.removeItem("etrianRegistryInitialized");
    clearMigrationError();
    toast.add({
      title: "登録内容を初期化しました",
      type: "success",
    });
  }, [resetEtrians, clearMigrationError]);

  function reorderEtrians(
    etrians: Etrian[],
    startIndex: number,
    endIndex: number,
  ): Etrian[] {
    const newEtrians = [...etrians];
    const [removed] = newEtrians.splice(startIndex, 1);
    newEtrians.splice(endIndex, 0, removed);
    return newEtrians.map((t, i) => ({ ...t, order: i }));
  }

  const handleReorder = useCallback(
    (startIndex: number, endIndex: number) => {
      if (!isLoaded) return;
      const reordered = reorderEtrians(storedEtrians, startIndex, endIndex);
      updateEtrians(reordered);
      toast.add({
        title: "並び順を更新しました",
        type: "success",
      });
    },
    [isLoaded, storedEtrians, updateEtrians],
  );

  const handleImport = useCallback(
    (data: string) => {
      try {
        const parsed = JSON.parse(data);
        toast.add({
          title: "インポートされた冒険者情報で更新しました",
          type: "success",
        });

        return true;
      } catch {
        return false;
      }
    },
    [updateEtrians],
  );

  // サンプルデータ投入
  useEffect(() => {
    const hasInitialized = localStorage.getItem("etrianRegistryInitialized");

    if (!hasInitialized && isLoaded && storedEtrians.length === 0) {
      const sortedSamples = [...sampleEtrians]
        .sort((a, b) => a.order - b.order)
        .reverse();
      sortedSamples.forEach(addEtrian);

      // 初期化しない限りサンプルデータが投入されないようにする
      localStorage.setItem("etrianRegistryInitialized", "true");
    }
  }, [isLoaded, storedEtrians, addEtrian]);

  return (
    <div className="flex flex-col gap-4">
      <div className="not-prose flex w-full flex-col gap-6">
        <EtrianRegistryForm onSubmit={handleCreate} isEditing={isEditing} />

        <EtrianRegistryItemList
          etrians={storedEtrians}
          isLoaded={isLoaded}
          isEditing={isEditing}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onReorder={handleReorder}
        />

        <div className="bg-background/70 sticky bottom-0 z-50 flex justify-between gap-2 border-t py-4">
          <div className="flex gap-2">
            {isEditing && (
              <>
                <ConfirmDialog
                  title="登録内容の初期化"
                  description="登録内容を初期状態に戻します。"
                  content={
                    <Alert variant="destructive">
                      <AlertCircleIcon size={16} />
                      <AlertTitle>この操作は元に戻せません。</AlertTitle>
                    </Alert>
                  }
                  confirmButtonLabel="初期化"
                  confirmButtonVariant="destructive"
                  onConfirm={handleReset}
                  className="w-fit"
                >
                  <Button variant="destructive" aria-label="初期化">
                    初期化
                  </Button>
                </ConfirmDialog>
                <ExportDialog
                  storedEtrianRegistry={storedEtrianRegistry}
                  className="w-fit"
                >
                  <Button
                    variant="secondary"
                    aria-label="エクスポート"
                    className="inline-flex items-center gap-2"
                  >
                    <UploadIcon className="sm:hidden" />
                    <span className="hidden sm:inline">エクスポート</span>
                  </Button>
                </ExportDialog>
                <ImportDialog onImport={handleImport}>
                  <Button
                    variant="secondary"
                    aria-label="インポート"
                    className="inline-flex items-center gap-2"
                  >
                    <DownloadIcon className="sm:hidden" />
                    <span className="hidden sm:inline">インポート</span>
                  </Button>
                </ImportDialog>
              </>
            )}
          </div>

          <Button
            variant={isEditing ? "default" : "secondary"}
            onClick={() => setIsEditing((prev) => !prev)}
            aria-label={isEditing ? "編集完了" : "編集開始"}
          >
            <UserPen />
            {isEditing ? "完了" : "編集"}
          </Button>
        </div>
      </div>
    </div>
  );
}
