import { JsonDisplay } from "@/components/shared/json-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MESSAGES } from "@/constants/messages";
import { AppStorage } from "@/types/app-storage";
import { ComponentProps, ReactElement, ReactNode } from "react";
import { toast } from "sonner";

type ExportDialogProps = {
  appStorage: AppStorage;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function ExportDialog({
  appStorage,
  children,
  ...props
}: ExportDialogProps) {
  const handleCopy = () => {
    try {
      const json = JSON.stringify(appStorage, null, 2);
      void navigator.clipboard.writeText(json);

      toast.success(MESSAGES.toast.clipboardCopied);

      // toast.add({
      //   title: MESSAGES.toast.clipboardCopied,
      //   type: "success",
      // });
    } catch {
      toast.error(MESSAGES.toast.clipboardCopied);
      //   toast.add({
      //     title: MESSAGES.toast.clipboardCopied,
      //     type: "error",
      //   });
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={children as ReactElement} {...props} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.dialogs.export.title}</DialogTitle>

          <DialogDescription>
            {MESSAGES.dialogs.export.description}
          </DialogDescription>
        </DialogHeader>

        <Button onClick={handleCopy}>{MESSAGES.actions.copy}</Button>

        <JsonDisplay
          data={appStorage}
          scrollAreaProps={{
            className: "max-h-[60vh]",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
