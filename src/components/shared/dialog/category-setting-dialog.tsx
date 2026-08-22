"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MESSAGES } from "@/constants/messages";
import { AlertCircleIcon, PlusIcon, SaveCheckIcon } from "lucide-react";
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
}: CategorySettingDialogProps) {
  const [categoryName, setCategoryName] = useState(category?.name ?? "");
  const isCreateMode = mode === "create";
const inputLabel = MESSAGES.labels.categoryName;

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

  return (
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
              {(isCreateMode || !isDefaultCategory) && (
                <Label className="flex flex-col items-start gap-2">
                  {inputLabel}
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    aria-label={inputLabel}
                    placeholder={
                      isCreateMode
                        ? MESSAGES.placeholders.categoryName
                        : (category?.name ?? "")
                    }
                  />
                </Label>
              )}

              <Label className="flex flex-col items-start gap-2">
                <p className="text-sm font-medium">リセット時刻の変更</p>
                <p className="text-muted-foreground text-sm">（将来対応）</p>
              </Label>

              {!isCreateMode && isDefaultCategory && (
                <Alert variant="default">
                  <AlertCircleIcon size={16} />
                  <AlertTitle>
                    未分類カテゴリはタイトル変更・削除できません。
                  </AlertTitle>
                </Alert>
              )}
            </div>

            <DialogFooter>
              {!isCreateMode && !isDefaultCategory && category && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(category)}
                >
                  カテゴリを削除
                </Button>
              )}

              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  (!isCreateMode && isDefaultCategory) || !categoryName.trim()
                }
              >
                {isCreateMode ? <PlusIcon /> : <SaveCheckIcon />}
                {isCreateMode ? MESSAGES.actions.add : MESSAGES.actions.update}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
