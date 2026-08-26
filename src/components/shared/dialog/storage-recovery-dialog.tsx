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
import { MESSAGES } from "@/constants/messages";
import { AlertCircleIcon } from "lucide-react";

type StorageRecoveryDialogProps = {
  open: boolean;
  onReset: () => void;
};

export function StorageRecoveryDialog({
  open,
  onReset,
}: StorageRecoveryDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>保存データを読み込めませんでした</AlertDialogTitle>

          <AlertDialogDescription>
            <>
              <p>
                保存されているデータが壊れているため、アプリを使用できません。
              </p>
              <p>初期化するとアプリを使用できるようになります。</p>
            </>
          </AlertDialogDescription>
        </AlertDialogHeader>

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
