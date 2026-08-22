"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircleIcon, SaveCheckIcon } from "lucide-react";

export type CategorySettingDialogProps = {
  open: boolean;
  category: { id: string; name: string } | null;
  isDefaultCategory: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (category: { id: string; name: string }) => void;
};

export function CategorySettingDialog({
  open,
  category,
  isDefaultCategory,
  onOpenChange,
  onDelete,
}: CategorySettingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カテゴリ設定</DialogTitle>
          <DialogDescription>
            対象カテゴリ: {category?.name ?? ""}
          </DialogDescription>
        </DialogHeader>

        {category && (
          <>
            <div className="space-y-3">
              {!isDefaultCategory && (
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">タイトルの変更</p>
                  <p className="text-muted-foreground text-sm">（将来対応）</p>
                </div>
              )}

              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">リセット時刻の変更</p>
                <p className="text-muted-foreground text-sm">（将来対応）</p>
              </div>

              {isDefaultCategory && (
                <Alert variant="default">
                  <AlertCircleIcon size={16} />
                  <AlertTitle>
                    未分類カテゴリはタイトル変更・削除できません。
                  </AlertTitle>
                </Alert>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between gap-y-2">
              {!isDefaultCategory && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(category)}
                  className="mr-auto"
                >
                  カテゴリを削除
                </Button>
              )}

              <DialogClose
                render={
                  <Button type="button">
                    <SaveCheckIcon /> 更新
                  </Button>
                }
              />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
