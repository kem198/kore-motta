import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

export type TodoAppHeaderProps = React.HTMLAttributes<HTMLElement>;

export function TodoAppHeader({ className, ...props }: TodoAppHeaderProps) {
  // TODO: 現在パスが HOME のときは色々表示する
  // const pathname = usePathname();
  // const resolvedIsHome = pathname === "/";

  return (
    <header
      className={cn(
        `bg-primary flex items-center gap-2 px-6 py-3 font-normal text-white max-md:px-3`,
        className,
      )}
      {...props}
    >
      <Link href="/" className={cn("inline-flex w-auto items-center gap-2")}>
        {SITE_NAME}
      </Link>
    </header>
  );
}
