import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export type TodoAppHeaderProps = ComponentPropsWithoutRef<"div">;

export function TodoAppHeader({
  className,
  children,
  ...props
}: TodoAppHeaderProps) {
  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground flex h-13 items-center justify-between gap-2 px-3 py-1 font-normal",
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
