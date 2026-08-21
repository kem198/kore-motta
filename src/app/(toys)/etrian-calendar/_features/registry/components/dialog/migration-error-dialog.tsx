import { JsonDisplay } from "@/components/shared/json-display";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircleIcon } from "lucide-react";

export type MigrationErrorDialogProps = {
  open: boolean;
  originalData: string | null;
  onConfirm: () => void;
};

export function MigrationErrorDialog({
  open,
  originalData,
  onConfirm,
}: MigrationErrorDialogProps) {
  let parsedData: unknown = null;
  try {
    parsedData = originalData ? JSON.parse(originalData) : null;
  } catch {
    parsedData = originalData;
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>登録内容の初期化が必要です</AlertDialogTitle>
          <AlertDialogDescription>
            登録していた冒険者情報の読み込みまたは移行処理で問題が発生しました。
            <br />
            登録内容を初期化して新しく開始する必要があります。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            現在の登録内容を控えた上で、「初期化する」ボタンを選択してください。
          </p>

          {originalData && (
            <JsonDisplay
              data={parsedData}
              scrollAreaProps={{ className: "h-40" }}
            />
          )}

          <Alert variant="destructive">
            <AlertCircleIcon size={16} />
            <AlertTitle>現在の登録内容はすべて削除されます。</AlertTitle>
            <AlertDescription>
              お手数ですが、控えた内容を元に再登録をお願いします。
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircleIcon size={16} />
            <AlertTitle>現在の登録内容は再表示できません。</AlertTitle>
          </Alert>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onConfirm}>初期化する</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
