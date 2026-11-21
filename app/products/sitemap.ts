import type {MetadataRoute} from "next";
import {connection} from "next/server";
import {getPublicCanonicalUrl} from "../../lib/site/url";
import {verifiedProductIndex} from "../../lib/products/public-catalog";

/** Conservative, bounded, request-time product discovery.
 * Only current public-admitted products, never all imported feed rows.
 * A larger paginated sitemap is a separate scale/reliability release gate. */
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 await connection();
 const records=await verifiedProductIndex(60);
 const base=getPublicCanonicalUrl();
 return records.filter(({product,offers})=>offers.length>0&&
  /^[a-z0-9][a-z0-9-]{2,159}$/.test(product.slug)).map(({product})=>({
  url:base+"/products/"+product.slug,
  changeFrequency:"daily",
  priority:0.7
 }));
}
