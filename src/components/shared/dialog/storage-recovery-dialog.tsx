import { JsonDisplay } from "@/components/shared/json-display";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";

type StorageRecoveryDialogProps = {
  open: boolean;
  corruptedStorage: string | null;
  onReset: () => void;
};

export function StorageRecoveryDialog({
  open,
  corruptedStorage,
  onReset,
}: StorageRecoveryDialogProps) {
  if (!corruptedStorage) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(corruptedStorage);

      toast.success(MESSAGES.toast.clipboardCopied);
    } catch {
      toast.error(MESSAGES.toast.clipboardCopyError);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>保存データを読み込めませんでした</AlertDialogTitle>

          <AlertDialogDescription>
            保存されているデータが壊れているため、アプリを使用できません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p>
          登録内容を初期化するとアプリを使用できるようになります。
          <br />
          現在の登録内容をバックアップした上で「初期化」ボタンを押してください。
        </p>

        <Button onClick={handleCopy}>コピー</Button>

        <JsonDisplay
          jsonString={corruptedStorage}
          scrollAreaProps={{
            className: "max-h-[50vh]",
          }}
        />

        <Alert variant="destructive">
          <AlertCircleIcon size={16} />
          <AlertTitle>{MESSAGES.warnings.overwrite}</AlertTitle>
        </Alert>

        <AlertDialogFooter>
          <AlertDialogAction variant="destructive" onClick={onReset}>
            初期化
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
