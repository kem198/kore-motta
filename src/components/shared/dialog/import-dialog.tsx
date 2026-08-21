"use client";

import { ReactElement, useState } from "react";

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
import { AlertCircleIcon } from "lucide-react";

type ImportDialogProps = {
  onImport: (data: string) => boolean;
  children: React.ReactNode;
};

export function ImportDialog({ onImport, children }: ImportDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    const success = onImport(value);
    setError(!success);
    if (success) {
      setOpen(false);
      setValue("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>冒険者情報のインポート</DialogTitle>
          <DialogDescription>
            冒険者情報を復元します。
            <br />
            「エクスポート」でコピーした文字列を貼り付けて「インポート」ボタンを押してください。
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
          <AlertTitle>
            現在の登録内容を上書きします。この操作は元に戻せません。
          </AlertTitle>
        </Alert>
        {error && (
          <p className="text-destructive text-sm">
            冒険者情報の形式が不正なため、インポートを中止しました。
          </p>
        )}

        <DialogFooter>
          <Button onClick={handleImport}>インポート</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
