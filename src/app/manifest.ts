import { SITE_NAME } from "@/constants/site";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    start_url: "/",
    theme_color: "#446c6b",
    background_color: "#fcfaf6",
    icons: [
      {
        src: "/assets/icons/icon-white-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/icons/icon-white-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
