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
import { EtrianRegistry } from "@/types/etrian";
import { ComponentProps, ReactElement, ReactNode } from "react";

type ExportDialogProps = {
  storedEtrianRegistry: EtrianRegistry;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function ExportDialog({
  storedEtrianRegistry,
  children,
  ...props
}: ExportDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={children as ReactElement} {...props} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>冒険者情報のエクスポート</DialogTitle>
          <DialogDescription>
            ブラウザ上に保存されている冒険者情報を表示します。
            <br />
            コピーして復元や端末間の移行にご利用ください。
          </DialogDescription>
        </DialogHeader>
        <Button
          onClick={() => {
            try {
              const json = JSON.stringify(storedEtrianRegistry, null, 2);
              void navigator.clipboard.writeText(json);
              toast.add({
                title: "冒険者情報をクリップボードにコピーしました",
                type: "success",
              });
            } catch (e) {
              toast.add({
                title: "冒険者情報をクリップボードにコピーしました",
                type: "error",
              });
            }
          }}
        >
          コピー
        </Button>
        <JsonDisplay
          data={storedEtrianRegistry}
          scrollAreaProps={{ className: "max-h-[60vh]" }}
        />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
