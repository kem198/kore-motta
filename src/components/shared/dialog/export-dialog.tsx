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
import { MESSAGES } from "@/constants/messages";
import { AppStorage } from "@/types/app-storage";
import { ComponentProps, ReactElement, ReactNode } from "react";

type ExportDialogProps = {
  appStorage: AppStorage;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function ExportDialog({
  appStorage,
  children,
  ...props
}: ExportDialogProps) {
  const lines = MESSAGES.dialogs.export.description.split("\n");
  return (
    <Dialog>
      <DialogTrigger render={children as ReactElement} {...props} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.dialogs.export.title}</DialogTitle>
          <DialogDescription>
            {lines.map((line: string, i: number) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </DialogDescription>
        </DialogHeader>
        <Button
          onClick={() => {
            try {
              const json = JSON.stringify(appStorage, null, 2);
              void navigator.clipboard.writeText(json);
              toast.add({
                title: MESSAGES.toast.clipboardCopied,
                type: "success",
              });
            } catch {
              toast.add({
                title: MESSAGES.toast.clipboardCopied,
                type: "error",
              });
            }
          }}
        >
          {MESSAGES.actions.copy}
        </Button>
        <JsonDisplay
          data={appStorage}
          scrollAreaProps={{ className: "max-h-[60vh]" }}
        />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
