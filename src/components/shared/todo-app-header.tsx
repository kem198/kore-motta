import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { HelpDialog } from "@/components/shared/dialog/help-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURES } from "@/constants/features";
import { MESSAGES } from "@/constants/messages";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { AppStorage } from "@/schemas/app-storage-schema";
import {
  CircleDashedIcon,
  CircleHelpIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  RefreshCcwIcon,
  UploadIcon,
} from "lucide-react";
import * as React from "react";

export type TodoAppHeaderProps = {
  appStorage: AppStorage;
  onMarkAllIncomplete: () => void;
  onImport: (data: string) => boolean;
} & React.HTMLAttributes<HTMLElement>;

export function TodoAppHeader({
  appStorage,
  onMarkAllIncomplete,
  onImport,
  className,
  ...props
}: TodoAppHeaderProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);

  return (
    <>
      <header
        className={cn(
          "bg-primary wco-drag flex items-center justify-between gap-2 px-3 py-1 font-normal text-white",
          className,
        )}
        {...props}
      >
        <h1 className="font-ubuntu-sans inline-flex w-auto cursor-default items-center gap-2 text-xl font-medium">
          {SITE_NAME}
        </h1>
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label="グローバルメニュー"
                  className="wco-no-drag rounded-full text-white hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
                >
                  <EllipsisVerticalIcon className="size-5" />
                </Button>
              }
            />

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsHelpDialogOpen(true)}
                  aria-label="使い方・利用規約"
                >
                  <CircleHelpIcon /> 使い方・利用規約
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {FEATURES.markAllIncomplete && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={onMarkAllIncomplete}
                      aria-label="すべて未完了に戻す"
                    >
                      <CircleDashedIcon /> すべて未完了に戻す
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => window.location.reload()}
                  aria-label="更新する"
                >
                  <RefreshCcwIcon /> 更新する
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsExportDialogOpen(true)}
                  aria-label="エクスポート"
                >
                  <UploadIcon /> {MESSAGES.actions.export}
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setIsImportDialogOpen(true)}
                  aria-label="インポート"
                >
                  <DownloadIcon />
                  {MESSAGES.actions.import}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <HelpDialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen} />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={onImport}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        appStorage={appStorage}
      />
    </>
  );
}
