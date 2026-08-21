import { JsonDisplay } from "@/components/shared/json-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { TodoStorage } from "@/types/todo";
import { ComponentProps, ReactElement, ReactNode } from "react";

type ExportDialogProps = {
  todoStorage: TodoStorage;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function ExportDialog({
  todoStorage: todoStorage,
  children,
  ...props
}: ExportDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={children as ReactElement} {...props} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Todo 情報のエクスポート</DialogTitle>
          <DialogDescription>
            ブラウザ上に保存されている Todo 情報を表示します。
            <br />
            コピーして復元や端末間の移行にご利用ください。
          </DialogDescription>
        </DialogHeader>
        <Button
          onClick={() => {
            try {
              const json = JSON.stringify(todoStorage, null, 2);
              void navigator.clipboard.writeText(json);
              toast.add({
                title: "Todo 情報をクリップボードにコピーしました",
                type: "success",
              });
            } catch (e) {
              toast.add({
                title: "Todo 情報をクリップボードにコピーしました",
                type: "error",
              });
            }
          }}
        >
          コピー
        </Button>
        <JsonDisplay
          data={todoStorage}
          scrollAreaProps={{ className: "max-h-[60vh]" }}
        />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
