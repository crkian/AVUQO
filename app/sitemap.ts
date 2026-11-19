import type { MetadataRoute } from "next";

import { getSiteUrl } from "../lib/site/url";
import {PARTNERS} from "../lib/partners/advertiser-directory";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const routes = [
    "",
    "/explore-avuqo", "/discover", "/marketplace", "/marketplace/compare", "/whos-who",
    "/products", "/shopping", "/mobile", "/partners", "/partners/ebay-uk", "/groceries", "/home", "/tech", "/travel", "/motoring", "/tyres", "/tyres/sizes", "/insurance", "/broadband", "/services", "/pets", "/gifts", "/beauty", "/christmas", "/black-friday", "/sales", "/easter", "/valentines",
    "/categories",
    "/search",
    "/score",
    "/reality-check",
    "/about",
    "/trust",
    "/affiliate-disclosure", "/privacy-centre", "/editorial-policy", "/accessibility", "/cookies", "/cookie-preferences",
    "/privacy",
    "/terms",
    "/contact", "/advertise",
  ];

  const indexablePartners=PARTNERS.filter(p=>p.links.length>0||["496","77952","101445","736","31539"].includes(p.advertiserId??""));
  return [...routes,...indexablePartners.map(p=>"/partners/"+p.slug)].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/discover" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/discover" ? 0.9 : 0.6,
  }));
}
