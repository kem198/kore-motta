import { HelpDialog } from "@/components/shared/dialog/help-dialog";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

export type TodoAppHeaderProps = React.HTMLAttributes<HTMLElement>;

export function TodoAppHeader({ className, ...props }: TodoAppHeaderProps) {
  return (
    <header
      className={cn(
        "bg-primary flex items-center justify-between gap-2 px-6 py-3 font-normal text-white max-md:px-3",
        className,
      )}
      {...props}
    >
      <Link href="/" className="inline-flex w-auto items-center gap-2">
        {SITE_NAME}
      </Link>
      <HelpDialog />
    </header>
  );
}
