import type {MetadataRoute} from "next";
import {getPublicCanonicalUrl} from "../lib/site/url";
import {PARTNERS} from "../lib/partners/advertiser-directory";
import {BROWSE_DEPARTMENTS} from "../lib/categories/browse-tree";

/** Public canonical editorial routes only: no search/filter URLs, admin,
 * private previews, fixture deals, or products without live release evidence. */
export default function sitemap():MetadataRoute.Sitemap{
 const base=getPublicCanonicalUrl();
 const routes=[
  "", "/explore-avuqo","/discover","/marketplace","/whos-who",
  "/products","/shop","/catalogue","/shopping","/mobile","/partners",
  "/groceries","/home","/tech","/travel","/motoring","/tyres","/tyres/sizes",
  "/insurance","/broadband","/services","/pets","/gifts","/beauty",
  "/christmas","/black-friday","/sales","/easter","/valentines",
  "/categories","/score","/reality-check","/about","/trust",
  "/affiliate-disclosure","/privacy-centre","/editorial-policy",
  "/accessibility","/cookies","/cookie-preferences","/privacy",
  "/terms","/contact","/advertise"
 ];
 const departmentRoutes=BROWSE_DEPARTMENTS.filter(d=>!d.landing).map(d=>"/categories/"+d.slug);
 const partnerRoutes=PARTNERS.filter(p=>p.links.length>0||
  ["496","77952","101445","736","31539"].includes(p.advertiserId??""))
  .map(p=>"/partners/"+p.slug);
 return [...new Set([...routes,...departmentRoutes,...partnerRoutes])].map(path=>({
  url:base+path,
  changeFrequency:path===""||path==="/discover"?"daily":"monthly",
  priority:path===""?1:path==="/categories"||path==="/partners"?0.8:0.6
 }));
}
