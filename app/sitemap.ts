import type { MetadataRoute } from "next";

import { getSiteUrl } from "../lib/site/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const routes = [
    "",
    "/discover",
    "/categories",
    "/search",
    "/score",
    "/reality-check",
    "/about",
    "/trust",
    "/affiliate-disclosure",
    "/privacy",
    "/terms",
    "/contact",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/discover" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/discover" ? 0.9 : 0.6,
  }));
}
