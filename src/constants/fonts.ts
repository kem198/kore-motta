import { Noto_Sans_JP, Ubuntu_Sans, Ubuntu_Sans_Mono } from "next/font/google";

export const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

export const ubuntuSans = Ubuntu_Sans({
  variable: "--font-ubuntu-sans",
  subsets: ["latin"],
});

export const ubuntuSansMono = Ubuntu_Sans_Mono({
  variable: "--font-ubuntu-sans-mono",
  subsets: ["latin"],
});
