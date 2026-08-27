import { Toaster } from "@/components/ui/sonner";
import { notoSansJp, ubuntuSans, ubuntuSansMono } from "@/constants/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="jp"
      className={cn(
        "h-full",
        "antialiased",
        notoSansJp.variable,
        ubuntuSans.variable,
        ubuntuSansMono.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
