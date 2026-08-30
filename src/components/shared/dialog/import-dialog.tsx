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
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: string) => boolean;
};

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
}: ImportDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleImport = () => {
    const ok = onImport(value);

    if (ok) {
      onOpenChange(false);
      setValue("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.dialogs.import.title}</DialogTitle>

          <DialogDescription>
            {MESSAGES.dialogs.import.description}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col gap-4",
            "-mx-4 max-h-[50dvh] overflow-y-auto px-4",
          )}
        >
          <Textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            className="bg-muted/50 border-border h-40 w-full cursor-text resize-none rounded-md border p-2 font-mono text-xs wrap-break-word whitespace-pre-wrap select-text max-sm:h-28"
            aria-label="インポート用テキストエリア"
          />

          <Alert variant="destructive">
            <AlertCircleIcon size={16} />
            <AlertTitle>{MESSAGES.warnings.overwrite}</AlertTitle>
          </Alert>

          {error && (
            <p className="text-destructive text-sm">
              {MESSAGES.toast.importError}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={handleImport}>
            {MESSAGES.actions.import}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
