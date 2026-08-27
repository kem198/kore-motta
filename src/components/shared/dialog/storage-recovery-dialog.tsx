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
  storage: string | null;
  mode: "corrupted" | "error";
  onReset: () => void;
};

export function StorageRecoveryDialog({
  open,
  storage,
  mode,
  onReset,
}: StorageRecoveryDialogProps) {
  const handleCopy = async () => {
    if (storage === null) {
      return;
    }

    try {
      await navigator.clipboard.writeText(storage);

      toast.success(MESSAGES.toast.clipboardCopied);
    } catch {
      toast.error(MESSAGES.toast.clipboardCopyError);
    }
  };

  const isCorrupted = mode === "corrupted";

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            アプリケーションで問題が発生しました
          </AlertDialogTitle>

          {isCorrupted ? (
            <AlertDialogDescription>
              保存されているデータに問題があるため、アプリを使用できません。{" "}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <p>
          現在の登録内容をバックアップしてから、 「初期化」を押してください。
        </p>

        {storage !== null ? (
          <>
            <Button onClick={handleCopy}>コピー</Button>

            <JsonDisplay
              jsonString={storage}
              scrollAreaProps={{
                className: "max-h-[50dvh]",
              }}
            />
          </>
        ) : (
          <JsonDisplay
            jsonString="保存データはありません。"
            scrollAreaProps={{
              className: "max-h-[50dvh]",
            }}
          />
        )}

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
