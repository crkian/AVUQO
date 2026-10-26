import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AVUQO",
    short_name: "AVUQO",
    description: "Find what's worth it.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#17142b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
