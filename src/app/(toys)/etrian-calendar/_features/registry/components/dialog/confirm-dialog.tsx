import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ComponentProps, ReactNode } from "react";

type ConfirmDialogProps = {
  title: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  confirmButtonLabel?: ReactNode;
  confirmButtonVariant?: ComponentProps<typeof Button>["variant"];
  cancelButtonLabel?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
  children: ReactNode;
};

export function ConfirmDialog({
  title,
  description,
  content,
  confirmButtonLabel = "はい",
  confirmButtonVariant = "default",
  cancelButtonLabel = "キャンセル",
  onConfirm,
  onCancel,
  className,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger className={className} asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {content}

        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              {cancelButtonLabel}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant={confirmButtonVariant} onClick={onConfirm}>
              {confirmButtonLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
