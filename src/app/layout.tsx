import { Toaster } from "@/components/ui/sonner";
import {
  geistMono,
  geistSans,
  notoSansJp,
  ubuntuSans,
  ubuntuSansMono,
} from "@/constants/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="jp"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        notoSansJp.variable,
        ubuntuSans.variable,
        ubuntuSansMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
