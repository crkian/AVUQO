import type { MetadataRoute } from "next";

import { getSiteUrl } from "../lib/site/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const routes = [
    "",
    "/discover", "/marketplace", "/marketplace/compare", "/whos-who",
    "/products", "/shopping", "/groceries", "/home", "/tech", "/travel", "/motoring", "/tyres", "/tyres/sizes", "/insurance", "/broadband", "/services", "/pets", "/gifts", "/beauty", "/christmas", "/black-friday", "/sales", "/easter", "/valentines",
    "/categories",
    "/search",
    "/score",
    "/reality-check",
    "/about",
    "/trust",
    "/affiliate-disclosure", "/privacy-centre", "/editorial-policy", "/accessibility", "/cookies", "/cookie-preferences",
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
