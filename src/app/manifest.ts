import {
  SITE_BACKGROUND_COLOR,
  SITE_NAME,
  SITE_THEME_COLOR,
} from "@/constants/site";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    display: "standalone",
    start_url: "/",
    theme_color: SITE_THEME_COLOR,
    background_color: SITE_BACKGROUND_COLOR,
    icons: [
      {
        src: "/assets/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
