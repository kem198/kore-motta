"use client";

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
import { ComponentPropsWithoutRef, useState } from "react";

export type TodoAppHeaderMenuProps = {
  appStorage: AppStorage;
  onMarkAllIncomplete: () => void;
  onImport: (data: string) => boolean;
} & ComponentPropsWithoutRef<"div">;

export function TodoAppHeaderMenu({
  appStorage,
  onMarkAllIncomplete,
  onImport,
  className,
  ...props
}: TodoAppHeaderMenuProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isTipsDialogOpen, setIsTipsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <div className={cn("flex gap-1", className)} {...props}>
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
