import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { AppStorage } from "@/schemas/app-storage-schema";
import * as React from "react";

export type TodoAppHeaderProps = {
  appStorage: AppStorage;
  onMarkAllIncomplete: () => void;
  onImport: (data: string) => boolean;
} & React.ComponentPropsWithoutRef<"div">;

export function TodoAppHeader({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "bg-primary flex h-13 items-center justify-between gap-2 px-3 py-1 font-normal text-white",
        className,
      )}
      {...props}
    >
      <h1 className="font-ubuntu-sans inline-flex w-auto cursor-default items-center gap-2 text-xl font-medium">
        {SITE_NAME}
      </h1>

      {children}
    </div>
  );
}
