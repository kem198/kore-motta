import { ConfirmDialog } from "@/components/shared/dialog/confirm-dialog";
import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { AppStorage } from "@/types/app-storage";
import { AlertCircleIcon, DownloadIcon, UploadIcon } from "lucide-react";

type TodoEditActionsProps = {
  appStorage: AppStorage;
  onReset: () => void;
  onImport: (data: string) => boolean;
};

export function TodoEditActions({
  appStorage,
  onReset,
  onImport,
}: TodoEditActionsProps) {
  return (
    <>
      <ConfirmDialog
        title={MESSAGES.dialogs.reset.title}
        description={MESSAGES.dialogs.reset.description}
        content={
          <Alert variant="destructive">
            <AlertCircleIcon size={16} />
            <AlertTitle>{MESSAGES.warnings.overwrite}</AlertTitle>
          </Alert>
        }
        confirmButtonLabel={MESSAGES.actions.reset}
        confirmButtonVariant="destructive"
        onConfirm={onReset}
        className="w-fit"
      >
        <Button variant="destructive" aria-label={MESSAGES.actions.reset}>
          {MESSAGES.actions.reset}
        </Button>
      </ConfirmDialog>

      <ExportDialog appStorage={appStorage} className="w-fit">
        <Button
          variant="secondary"
          aria-label={MESSAGES.actions.export}
          className="inline-flex items-center gap-2"
        >
          <UploadIcon className="sm:hidden" />
          <span className="hidden sm:inline">{MESSAGES.actions.export}</span>
        </Button>
      </ExportDialog>

      <ImportDialog onImport={onImport}>
        <Button
          variant="secondary"
          aria-label={MESSAGES.actions.import}
          className="inline-flex items-center gap-2"
        >
          <DownloadIcon className="sm:hidden" />
          <span className="hidden sm:inline">{MESSAGES.actions.import}</span>
        </Button>
      </ImportDialog>
    </>
  );
}
