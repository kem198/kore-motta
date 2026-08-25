import { JsonDisplay } from "@/components/shared/json-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MESSAGES } from "@/constants/messages";
import { AppStorage } from "@/schemas/app-storage-schema";
import { toast } from "sonner";

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appStorage: AppStorage;
};

export function ExportDialog({
  appStorage,
  open,
  onOpenChange,
}: ExportDialogProps) {
  const handleCopy = () => {
    try {
      const json = JSON.stringify(appStorage, null, 2);
      void navigator.clipboard.writeText(json);

      toast.success(MESSAGES.toast.clipboardCopied);
    } catch {
      toast.error(MESSAGES.toast.clipboardCopied);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
