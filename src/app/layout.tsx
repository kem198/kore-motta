import { Toaster } from "@/components/ui/toast";
import {
  geistMono,
  geistSans,
  notoSansJp,
  ubuntuSans,
} from "@/constants/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | ${SITE_DESCRIPTION}`,
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
        "font-sans",
        inter.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
