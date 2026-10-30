import {connection} from "next/server";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import styles from "./pilot.module.css";
type Pilot={id:string;slug:string;canonical_title:string;brand:string|null;status:string;category_id:string|null;metadata:unknown;specifications:unknown};
type Category={id:string;name:string};
const details=(x:unknown):Record<string,unknown>=>x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};
export default async function PilotProducts(){
 await connection();await requireControlCentreAccess();
 // The public products SELECT policy intentionally filters draft records.
 // Never relax that policy: authenticate and authorise BEFORE service-role reads.
 const db=createAdminClient();
 const productsR=await db.from("products")
  .select("id,slug,canonical_title,brand,status,category_id,metadata,specifications")
  .like("slug","pilot-%").eq("status","draft").order("canonical_title").limit(20);
 const products=(productsR.data??[]) as Pilot[];
 const categoryIds=[...new Set(products.map(row=>row.category_id).filter((id):id is string=>Boolean(id)))];
 const categoriesR=categoryIds.length
  ?await db.from("categories").select("id,name").in("id",categoryIds)
  :{data:[] as Category[],error:null};
 const names=new Map(((categoriesR.data??[]) as Category[]).map(c=>[c.id,c.name]));
 return <div className={styles.page}>
  <p className={styles.kicker}>Sources & Value / Product readiness</p>
  <h1>First eight product drafts</h1>
  <p>Real titles from the private merchant feed imports, shown as design and identity-review samples. They have no public offers or approved product photographs.</p>
  <div className={styles.warning}><b>Draft only · No public sale</b>
   <span>Source permissions unverified · Image rights unverified · Exact identity matching pending · Merchant prices deliberately hidden.</span>
  </div>
  {(productsR.error||categoriesR.error)&&<p role="alert" className={styles.loadError}>The product draft database could not be read. Contact the site administrator; no product has been published.</p>}
  {!productsR.error&&<p className={styles.visibleCount} role="status">{products.length} private draft {products.length===1?"product":"products"} loaded</p>}
  <div className={styles.grid}>
   {products.map((p,index)=>{
    const info=details(p.metadata),spec=details(p.specifications);
    return <article className={styles.card} key={p.id}>
     <div className={styles.image} data-tone={index%4} aria-label="Illustrative placeholder, not merchant photography"><span>Q</span><small>IMAGE RIGHTS PENDING</small></div>
     <div className={styles.copy}>
      <span className={styles.tag}>Private product draft</span>
      <p className={styles.brand}>{p.brand??"Brand unconfirmed"} · {names.get(p.category_id??"")??"Category mapping pending"}</p>
      <h2>{p.canonical_title}</h2>
      <p>Product identity and source matching require review before any price, stock or comparison can be shown.</p>
      <dl>
       <div><dt>Record state</dt><dd>{p.status}</dd></div>
       <div><dt>Feed record</dt><dd>{String(info.source_record_id??"Not linked")}</dd></div>
       <div><dt>Merchant SKU</dt><dd>{String(spec.merchant_sku??"Missing")}</dd></div>
       <div><dt>Published price</dt><dd>Not available</dd></div>
      </dl>
     </div>
    </article>;
   })}
  </div>
  {!products.length&&!productsR.error&&<p className={styles.empty}>No private pilot drafts were found. The page can now read draft records, so check the production seed if this is unexpected.</p>}
  <div className={styles.next}>
   <h2>Before public publication</h2>
   <p>Approve source and image rights, verify exact models and packaging, confirm current offer totals and stock, then publish through the reviewed product pipeline.</p>
   <div><Link href="/control-centre/feed-imports">Review the imported records</Link><Link href="/control-centre/product-readiness">Check product readiness</Link><Link href="/control-centre/product-previews">See the larger design gallery</Link></div>
  </div>
 </div>;
}
