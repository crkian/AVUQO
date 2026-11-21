import type {MetadataRoute} from "next";
import {getPublicCanonicalUrl} from "../lib/site/url";
export default function robots():MetadataRoute.Robots{
 // Vercel preview/staging should never compete with canonical production.
 if(process.env.VERCEL_ENV==="preview"||process.env.VERCEL_ENV==="development")
  return {rules:[{userAgent:"*",disallow:"/"}]};
 return {rules:[{userAgent:"*",allow:"/",disallow:[
  "/control-centre/","/preview/","/api/","/auth/","/go/",
  "/account/","/login","/reset-password","/forgot-password",
  "/saved","/lists/","/basket","/search?"
 ]}],sitemap:[getPublicCanonicalUrl()+"/sitemap.xml",getPublicCanonicalUrl()+"/products/sitemap.xml"]};
}
