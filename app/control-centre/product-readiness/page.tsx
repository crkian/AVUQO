import {connection} from "next/server";
import Link from "next/link";
import {createClient} from "../../../lib/supabase/server";
import {verifiedProductIndex} from "../../../lib/products/public-catalog";
import styles from "../control-centre.module.css";
export const instant=false;
type Product={id:string;slug:string;canonical_title:string;brand:string|null;status:string;created_at:string};
type Offer={id:string;product_id:string;source_id:string;status:string;last_seen_at:string|null;match_confidence:number|null};
type Source={id:string;name:string;source_type:string;connector_key:string|null;status:string;metadata:unknown};
function rights(s:Source|undefined){const m=s?.metadata;if(!m||typeof m!=="object"||Array.isArray(m))return false;const x=m as Record<string,unknown>;return x.usage_rights_confirmed===true&&typeof x.rights_evidence_ref==="string"&&x.rights_evidence_ref.length>=5;}
export default async function ProductReadiness(){
 await connection();
 const db=await createClient();
 const [{data:p,error},{data:o,error:offersError},{data:sources,error:sourcesError},{data:published}]=await Promise.all([
  db.from("products").select("id,slug,canonical_title,brand,status,created_at").order("created_at",{ascending:false}).limit(70),
  db.from("offers").select("id,product_id,source_id,status,last_seen_at,match_confidence").limit(300),
  db.from("sources").select("id,name,source_type,connector_key,status,metadata").order("name").limit(200),
  db.from("published_deals").select("offer_id,product_id,status").eq("status","published").limit(300)
 ]);
 const catalog=(p??[]) as Product[],offers=(o??[]) as Offer[],sourceMap=new Map(((sources??[]) as Source[]).map(s=>[s.id,s]));
 const ready=await verifiedProductIndex(60);
 const eligible=new Set(ready.map(x=>x.product.id));
 return <><div className={styles.pageHead}><div><p className={styles.eyebrow}>Product catalogue &amp; publication gates</p><h1>Product readiness</h1><p className={styles.sub}>A private view of individual product identities and source eligibility. A product record, demo feed or admin checkmark alone is not a public product page.</p></div></div>
 <div className={styles.metrics}><div className={styles.metric}><span>Loaded product identities</span><strong>{catalog.length}</strong></div><div className={styles.metric}><span>Eligible public product pages</span><strong>{eligible.size}</strong></div><div className={styles.metric}><span>Offers reviewed here</span><strong>{offers.length}</strong></div><div className={styles.metric}><span>Ready for automatic publication?</span><strong>No</strong></div></div>
 <section className={styles.panel}><div className={styles.panelHead}><h2>Individual products</h2><span>Verified-only public links</span></div>
 {error||offersError||sourcesError?<p role="alert">Catalogue, offers or source registry could not be read. Treat results as unverified.</p>:catalog.length?<div style={{overflowX:"auto"}}><table className={styles.table}><thead><tr><th>Product</th><th>Record</th><th>Linked offers</th><th>Source assessment</th><th>Public page</th></tr></thead><tbody>{catalog.map(p=>{const os=offers.filter(x=>x.product_id===p.id);const sourceRows=os.map(x=>sourceMap.get(x.source_id));const demos=sourceRows.some(s=>s?.connector_key==="demo"||s?.source_type==="internal_test");const rightsMissing=sourceRows.some(s=>!rights(s));const ok=eligible.has(p.id);return <tr key={p.id}><td><b>{p.canonical_title}</b><br/><span>{p.brand??"Brand not recorded"}</span></td><td>{p.status}</td><td>{os.length} found<br/>{published?.filter(d=>d.product_id===p.id).length??0} marked published</td><td>{demos?"Demo source":rightsMissing?"Rights/evidence missing":os.length?"Verify match, freshness and terms":"No offers"}</td><td>{ok?<Link href={`/products/${p.slug}`}>View live page</Link>:<span>Not public</span>}</td></tr>})}</tbody></table></div>:<div className={styles.empty}>No product identities recorded. Start with an approved source or the private importer.</div>}</section>
 <div className={styles.callout}><b>New:</b> Eight real merchant product titles are saved as private drafts. <Link href="/control-centre/pilot-products">Inspect the first product drafts</Link> before verifying source rights or publishing offers.</div>
 <section className={styles.panel}><div className={styles.panelHead}><h2>Before an individual product page can go live</h2></div>
 <ol style={{display:"grid",gap:12,paddingLeft:23,color:"#6d6572",fontSize:13,lineHeight:1.7}}>
 <li>Receive a permitted feed, with explicit image rights and evidence reference.</li>
 <li>Match the exact product model, pack, variant and merchant correctly.</li>
 <li>Confirm the offer is recent, available, and in the intended market and currency.</li>
 <li>Have the offer published through a reviewed, auditable workflow, never directly from an unverified upload.</li>
 <li>Only then show the product page, merchant price, source information and outbound link.</li>
 </ol><p><Link href="/control-centre/feed-imports">Private feed imports</Link> · <Link href="/control-centre/source-readiness">Source readiness</Link> · <Link href="/products">Public product catalogue</Link></p></section>
 <div className={styles.callout}><b>Currently:</b> demo records can carry a published label in the historical pipeline, but the new public product pages also check real source permission, freshness, identity and matching gates. They are not displayed as genuine retailer offers.</div></>;
}
