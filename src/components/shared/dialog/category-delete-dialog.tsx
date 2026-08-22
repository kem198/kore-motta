"use client";

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
import { MESSAGES } from "@/constants/messages";

export type CategoryDeleteDialogProps = {
  open: boolean;
  category: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function CategoryDeleteDialog({
  open,
  category,
  onOpenChange,
  onConfirm,
}: CategoryDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            カテゴリ「{category?.name ?? ""}」を削除しますか？
          </DialogTitle>
          <DialogDescription>
            このカテゴリに属する Todo は未分類に移動します。
          </DialogDescription>
        </DialogHeader>

        {category && (
          <DialogFooter className="gap-y-2">
            <DialogClose
              render={
                <Button variant="outline">{MESSAGES.actions.cancel}</Button>
              }
            />
            <DialogClose
              render={
                <Button variant="destructive" onClick={onConfirm}>
                  {MESSAGES.actions.delete}
                </Button>
              }
            />
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
