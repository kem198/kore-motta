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
              const json = JSON.stringify(todoStorage, null, 2);
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
          data={todoStorage}
          scrollAreaProps={{ className: "max-h-[60vh]" }}
        />

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
