import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { HelpDialog } from "@/components/shared/dialog/help-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { TipsDialog } from "@/components/shared/dialog/tips-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MESSAGES } from "@/constants/messages";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { AppStorage } from "@/schemas/app-storage-schema";
import {
  CircleDashedIcon,
  CircleHelpIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  LightbulbIcon,
  RefreshCcwIcon,
  UploadIcon,
} from "lucide-react";
import * as React from "react";

export type TodoAppHeaderProps = {
  appStorage: AppStorage;
  onMarkAllIncomplete: () => void;
  onImport: (data: string) => boolean;
} & React.ComponentPropsWithoutRef<"div">;

export function TodoAppHeader({
  appStorage,
  onMarkAllIncomplete,
  onImport,
  className,
  ...props
}: TodoAppHeaderProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState(false);
  const [isTipsDialogOpen, setIsTipsDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);

  return (
    <>
      <div
        className={cn(
          "bg-primary flex items-center justify-between gap-2 px-3 py-1 font-normal text-white",
          className,
        )}
        {...props}
      >
        <h1 className="font-ubuntu-sans inline-flex w-auto cursor-default items-center gap-2 text-xl font-medium">
          {SITE_NAME}
        </h1>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="アプリの概要・利用規約"
            onClick={() => setIsHelpDialogOpen(true)}
            className="rounded-full text-white hover:bg-white/10 hover:text-white"
          >
            <CircleHelpIcon className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label="グローバルメニュー"
                  className="rounded-full text-white hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
                >
                  <EllipsisVerticalIcon className="size-5" />
                </Button>
              }
            />

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsTipsDialogOpen(true)}
                  aria-label="便利な使い方"
                >
                  <LightbulbIcon /> 便利な使い方
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onMarkAllIncomplete}
                aria-label="すべて未完了に戻す"
              >
                <CircleDashedIcon /> すべて未完了に戻す
              </DropdownMenuItem>

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => window.location.reload()}
                  aria-label="再読み込みする"
                >
                  <RefreshCcwIcon /> 再読み込みする
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
      </div>

      <HelpDialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen} />

      <TipsDialog open={isTipsDialogOpen} onOpenChange={setIsTipsDialogOpen} />

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
