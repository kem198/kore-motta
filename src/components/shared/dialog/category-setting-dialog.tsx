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
import { AlertCircleIcon, SaveCheckIcon } from "lucide-react";
import { useState } from "react";

export type CategorySettingDialogProps = {
  open: boolean;
  category: { id: string; name: string } | null;
  isDefaultCategory: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (category: { id: string; name: string }, name: string) => void;
  onDelete: (category: { id: string; name: string }) => void;
};

export function CategorySettingDialog({
  open,
  category,
  isDefaultCategory,
  onOpenChange,
  onRename,
  onDelete,
}: CategorySettingDialogProps) {
  const [categoryName, setCategoryName] = useState(category?.name ?? "");

  const handleSave = () => {
    if (!category || isDefaultCategory) return;

    const trimmedName = categoryName.trim();
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
            対象カテゴリ: {category?.name ?? ""}
          </DialogDescription>
        </DialogHeader>

        {category && (
          <>
            <div className="space-y-3">
              {!isDefaultCategory && (
                <Label className="flex flex-col items-start gap-2">
                  {MESSAGES.labels.title}
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    aria-label={MESSAGES.labels.title}
                    placeholder={category.name}
                  />
                </Label>
              )}

              <Label className="flex flex-col items-start gap-2">
                <p className="text-sm font-medium">リセット時刻の変更</p>
                <p className="text-muted-foreground text-sm">（将来対応）</p>
              </Label>

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

              <Button
                type="button"
                onClick={handleSave}
                disabled={isDefaultCategory || !categoryName.trim()}
              >
                <SaveCheckIcon /> {MESSAGES.actions.update}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
