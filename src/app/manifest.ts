import { SITE_NAME } from "@/constants/site";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    display: "standalone",
    start_url: "/",
    theme_color: "#5b9480",
    background_color: "#f8f9f9",
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
