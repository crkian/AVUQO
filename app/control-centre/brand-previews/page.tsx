import type {Metadata} from "next";
import Link from "next/link";
import {connection} from "next/server";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {BRAND_PREVIEWS,privateBrandHref,productsForBrand} from "../../../lib/products/private-preview";
import styles from "../pilot-products/pilot.module.css";
export const metadata:Metadata={title:"Private company-area concepts | AVUQO",robots:{index:false,follow:false}};
export default async function BrandPreviews(){
 await connection();await requireControlCentreAccess();
 return <div className={styles.page}>
  <p className={styles.kicker}>Advertising &amp; Growth / Company-area concepts</p>
  <h1>Five company-themed design previews</h1>
  <p>These are illustrative editorial destinations built from eight private draft product records. No commercial partnership, brand trademark rights or live advertising is claimed.</p>
  <div className={styles.warning}><b>Not official stores or active paid campaigns</b>
   <span>Brand identity as text for review only. No company logos, authorised product photography, affiliate placements or public products.</span></div>
  <div className={styles.brandDirectory}>
   <div><h2>Explore possible company areas</h2><p>Each preview proposes a different content approach while keeping product comparisons independent.</p></div>
   <div className={styles.brandTiles}>{BRAND_PREVIEWS.map(brand=><Link href={privateBrandHref(brand.slug)} key={brand.slug}>
    <span>{brand.displayName}</span><strong>{brand.headline}</strong><small>{productsForBrand(brand.slug).length} draft example products · Open preview →</small>
   </Link>)}</div>
  </div>
  <div className={styles.next}><h2>Where official partner areas would live</h2><p>Approved brand imagery, promotional claims and sponsored stories require written rights, contract checks, clear disclosure and the separate Site Advertising workflow. These design experiments do not grant publication rights.</p>
   <div><Link href="/control-centre/site-advertising">Advertising workspace</Link><Link href="/control-centre/pilot-products">Individual product previews</Link></div>
  </div>
 </div>;
}
