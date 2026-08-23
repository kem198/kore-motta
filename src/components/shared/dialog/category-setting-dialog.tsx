"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MESSAGES } from "@/constants/messages";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

export type CategoryDialogMode = "create" | "edit";

export type CategorySettingDialogProps = {
  open: boolean;
  mode: CategoryDialogMode;
  category: { id: string; name: string } | null;
  isDefaultCategory: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
  onRename: (category: { id: string; name: string }, name: string) => void;
  onDelete: (category: { id: string; name: string }) => void;
  onMarkAllIncomplete: () => void;
};

export function CategorySettingDialog({
  open,
  mode,
  category,
  isDefaultCategory,
  onOpenChange,
  onCreate,
  onRename,
  onDelete,
  onMarkAllIncomplete,
}: CategorySettingDialogProps) {
  const [categoryName, setCategoryName] = useState(category?.name ?? "");
  const [isMarkAllIncompleteConfirmOpen, setIsMarkAllIncompleteConfirmOpen] =
    useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isCreateMode = mode === "create";

  const handleSave = () => {
    const trimmedName = categoryName.trim();

    if (isCreateMode) {
      if (!trimmedName) return;

      onCreate(trimmedName);
      onOpenChange(false);
      return;
    }

    if (!category || isDefaultCategory) return;
    if (!trimmedName || trimmedName === category.name) return;

    onRename(category, trimmedName);
    onOpenChange(false);
  };

  const handleMarkAllIncompleteConfirm = () => {
    onMarkAllIncomplete();
    setIsMarkAllIncompleteConfirmOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!category) return;

    onDelete(category);
    setIsDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリ設定</DialogTitle>

            <DialogDescription>
              {isCreateMode
                ? "新しいカテゴリを追加します。"
                : `対象カテゴリ: ${category?.name ?? ""}`}
            </DialogDescription>
          </DialogHeader>

          {(isCreateMode || category) && (
            <>
              <div className="space-y-3">
                <Label className="flex flex-col items-start gap-2">
                  {MESSAGES.labels.categoryName}

                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    aria-label={MESSAGES.labels.categoryName}
                    placeholder={
                      isCreateMode
                        ? MESSAGES.placeholders.categoryName
                        : (category?.name ?? "")
                    }
                    disabled={!isCreateMode && isDefaultCategory}
                  />
                </Label>

                <Label className="flex flex-col items-start gap-2">
                  <p className="text-sm font-medium">未完了に戻す時刻</p>
                  <p className="text-muted-foreground text-sm">（将来対応）</p>
                </Label>
              </div>

              <div className="flex gap-2">
                {!isCreateMode && category && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsMarkAllIncompleteConfirmOpen(true)}
                    >
                      {MESSAGES.actions.markAllIncomplete}
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      disabled={isDefaultCategory}
                    >
                      カテゴリを削除
                    </Button>
                  </div>
                )}
              </div>

              {!isCreateMode && isDefaultCategory && (
                <Alert variant="default">
                  <AlertCircleIcon size={16} />

                  <AlertTitle>
                    未分類カテゴリはタイトル変更・削除できません。
                  </AlertTitle>
                </Alert>
              )}

              <DialogFooter>
                <DialogClose
                  render={
                    <Button type="button" variant="outline">
                      キャンセル
                    </Button>
                  }
                />

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    (!isCreateMode && isDefaultCategory) || !categoryName.trim()
                  }
                >
                  {isCreateMode
                    ? MESSAGES.actions.add
                    : MESSAGES.actions.update}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isMarkAllIncompleteConfirmOpen}
        onOpenChange={setIsMarkAllIncompleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              アイテムをすべて未完了に戻しますか？
            </AlertDialogTitle>

            <AlertDialogDescription>
              このカテゴリ内のアイテムをすべて未完了に戻します。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{MESSAGES.actions.cancel}</AlertDialogCancel>

            <AlertDialogAction onClick={handleMarkAllIncompleteConfirm}>
              {MESSAGES.actions.markAllIncomplete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              カテゴリ「{category?.name ?? ""}」を削除しますか？
            </AlertDialogTitle>

            <AlertDialogDescription>
              このカテゴリに属するアイテムは「未分類」カテゴリに移動します。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{MESSAGES.actions.cancel}</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {MESSAGES.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
