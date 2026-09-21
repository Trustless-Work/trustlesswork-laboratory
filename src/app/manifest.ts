import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#006be4",
    categories: ["finance", "developer tools", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "248x217",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
