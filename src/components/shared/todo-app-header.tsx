import { HelpDialog } from "@/components/shared/dialog/help-dialog";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export type TodoAppHeaderProps = React.HTMLAttributes<HTMLElement>;

export function TodoAppHeader({ className, ...props }: TodoAppHeaderProps) {
  return (
    <header
      className={cn(
        "bg-primary flex items-center justify-between gap-2 px-3 py-1 font-normal text-white",
        className,
      )}
      {...props}
    >
      <Link
        href="/"
        className="font-ubuntu-sans inline-flex w-auto items-center gap-2 text-xl font-medium"
      >
        {SITE_NAME}
      </Link>
      <div className="flex gap-1">
        <HelpDialog />

        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="アプリの使い方・利用規約"
          className="rounded-full text-white hover:bg-white/10 hover:text-white"
        >
          <EllipsisVerticalIcon className="size-5" />
        </Button>
      </div>
    </header>
  );
}
