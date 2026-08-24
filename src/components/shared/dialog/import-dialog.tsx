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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
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

        <ScrollArea className="border-border max-h-[60vh] rounded-md border">
          <Textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            className="bg-muted/50 min-h-[160px] w-full cursor-text resize-none p-2 font-mono text-xs break-words whitespace-pre-wrap select-text"
            aria-label="インポート用テキストエリア"
          />
        </ScrollArea>

        <Alert variant="destructive">
          <AlertCircleIcon size={16} />
          <AlertTitle>{MESSAGES.warnings.overwrite}</AlertTitle>
        </Alert>

        {error && (
          <p className="text-destructive text-sm">
            {MESSAGES.toast.importError}
          </p>
        )}

        <DialogFooter>
          <Button onClick={handleImport}>{MESSAGES.actions.import}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
