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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
import { AlertCircleIcon } from "lucide-react";
import { ComponentProps, ReactElement, useState } from "react";

type ImportDialogProps = {
  onImport: (data: string) => boolean;
  children: React.ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function ImportDialog({
  onImport,
  children,
  ...props
}: ImportDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    const ok = onImport(value);

    if (ok) {
      setOpen(false);
      setValue("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} {...props} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.dialogs.import.title}</DialogTitle>
          <DialogDescription>
            {MESSAGES.dialogs.import.description
              .split("\n")
              .map((line: string, i: number) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
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
