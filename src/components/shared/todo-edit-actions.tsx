import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { AppStorage } from "@/types/app-storage";
import { DownloadIcon, UploadIcon } from "lucide-react";

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
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="secondary">
              {MESSAGES.actions.markAllIncomplete}
            </Button>
          }
        />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {MESSAGES.dialogs.markAllIncomplete.title}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {MESSAGES.dialogs.markAllIncomplete.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{MESSAGES.actions.cancel}</AlertDialogCancel>

            <AlertDialogAction onClick={onReset}>
              {MESSAGES.actions.markAllIncomplete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
