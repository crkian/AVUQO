import {connection} from "next/server";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import {safePreviewSelection,stagedPrice,type StagedPreviewRow} from "../../../lib/feed-imports/preview-selection";
import styles from "./product-previews.module.css";

type ImportRun={id:string;merchant_id:string;merchant_name:string;total_count:number;permission_status:string;created_at:string};
type SampleGroup={run:ImportRun;samples:StagedPreviewRow[];error:string|null};
const date=(value:string)=>new Date(value).toLocaleDateString("en-GB");
const neutral=(value:string|null|undefined,fallback:string)=>(value?.trim()||fallback).slice(0,90);
export default async function ProductPreviews({
 searchParams
}:{searchParams:Promise<{merchant?:string;view?:string}>}){
 await connection();
 await requireControlCentreAccess();
 const {merchant,view}=await searchParams;
 const supabase=await createClient();
 const {data:runs,error:runError}=await supabase.from("feed_import_runs")
  .select("id,merchant_id,merchant_name,total_count,permission_status,created_at")
  .order("created_at",{ascending:false}).limit(20);
 const selectedRuns:ImportRun[]=[];
 const seen=new Set<string>();
 for(const run of (runs??[]) as ImportRun[]){
  const id=run.merchant_id||run.merchant_name;
  if(!seen.has(id)){seen.add(id);selectedRuns.push(run);}
  if(selectedRuns.length>=6)break;
 }
 const shownRuns=merchant&&selectedRuns.some(r=>r.merchant_id===merchant)?
  selectedRuns.filter(r=>r.merchant_id===merchant):selectedRuns;
 const groups:SampleGroup[]=await Promise.all(shownRuns.map(async run=>{
  const {data,error}=await supabase.from("feed_import_records")
   .select("id,merchant_product_id,title,price,currency,brand,category,status,review_decision,image_url")
   .eq("import_id",run.id).order("created_at",{ascending:true}).limit(120);
  return {run,samples:error?[]:safePreviewSelection((data??[]) as StagedPreviewRow[]),error:error?.message??null};
 }));
 const samples=groups.flatMap(g=>g.samples.map(p=>({p,merchant:g.run.merchant_name,permission:g.run.permission_status,runDate:g.run.created_at})));
 const compact=view==="compact";
 return <div className={styles.page}>
  <div className={styles.heading}>
   <p className={styles.kicker}>Sources &amp; Value / Private design testing</p>
   <h1>Product preview gallery</h1>
   <p>See how real staged import records would fit AVUQO&apos;s product cards. These are presentation tests only, not offers, verified prices, approved imagery or public catalogue pages.</p>
   <div className={styles.warning}><strong>PRIVATE PREVIEW · NEVER PUBLISHED</strong>
    <span>All images use placeholders because merchant image rights have not been verified. Prices below are labelled as staged feed values, not live prices. Compare buttons, affiliate links, checkout and publishing are disabled.</span></div>
  </div>
  <section className={styles.controls} aria-label="Preview controls">
    <div className={styles.filters}><strong>Merchant</strong>
     <Link aria-current={!merchant?"page":undefined} href="/control-centre/product-previews">All imports</Link>
     {selectedRuns.map(run=><Link key={run.id} aria-current={merchant===run.merchant_id?"page":undefined}
      href={"/control-centre/product-previews?merchant="+encodeURIComponent(run.merchant_id)}>{run.merchant_name}</Link>)}
    </div>
    <div className={styles.view}><strong>Layout</strong>
     <Link href={"/control-centre/product-previews?view=grid"+(merchant?"&merchant="+encodeURIComponent(merchant):"")}
       aria-current={!compact?"page":undefined}>Cards</Link>
     <Link href={"/control-centre/product-previews?view=compact"+(merchant?"&merchant="+encodeURIComponent(merchant):"")}
       aria-current={compact?"page":undefined}>Compact list</Link>
    </div>
  </section>
  {runError&&<p className={styles.error} role="alert">Import history unavailable. Gallery data was not loaded.</p>}
  {groups.some(g=>g.error)&&<p className={styles.error} role="alert">Some private product records are unavailable. The results shown may be incomplete.</p>}
  <div className={styles.summary}>
   <div><strong>{samples.length}</strong><span>Sample cards rendered</span></div>
   <div><strong>{groups.length}</strong><span>Merchant feed groups</span></div>
   <div><strong>{samples.filter(x=>x.p.price===null).length}</strong><span>Missing staged prices</span></div>
   <div><strong>{samples.filter(x=>x.p.status==="excluded").length}</strong><span>Excluded record examples</span></div>
  </div>
  <section className={styles.intro}>
    <h2>{compact?"Compact list preview":"Customer product-card preview"}</h2>
    <p>Try narrow screens and longer titles. The fields are real private input data; badges and layout are illustrative, and no source is being claimed as licensed.</p>
  </section>
  {samples.length?<div className={compact?styles.compact:styles.gallery}>
   {samples.map(({p,merchant:merchantName,permission,runDate})=><article key={p.id} className={styles.card}>
    <div className={styles.visual} aria-label="Image placeholder, no merchant image fetched">
     <div className={styles.placeholderMark}>Q</div><span>IMAGE PENDING RIGHTS</span>
     <small>Preview placeholder</small>
    </div>
    <div className={styles.cardBody}>
     <div className={styles.badges}><span className={styles.previewTag}>Private preview</span>
      {p.status==="excluded"&&<span className={styles.excluded}>Excluded record</span>}
     </div>
     <p className={styles.brand}>{neutral(p.brand,"Brand not supplied")} · {neutral(p.category,"Category unclassified")}</p>
     <h3 title={p.title}>{p.title}</h3>
     <div className={styles.price}><strong>{stagedPrice(p.price,p.currency)}</strong><span>Staged feed value · not live</span></div>
     <p className={styles.merchant}>{merchantName} · Rights: {permission}</p>
     <div className={styles.cardActions}><span aria-disabled="true" className={styles.disabledAction}>Compare prices</span>
      <span aria-disabled="true" className={styles.disabledAction}>View product</span></div>
     <details className={styles.details}><summary>Inspect imported fields</summary>
      <dl>
       <div><dt>Merchant product ID</dt><dd>{p.merchant_product_id}</dd></div>
       <div><dt>Import date</dt><dd>{date(runDate)}</dd></div>
       <div><dt>Review status</dt><dd>{p.review_decision??"Pending"}</dd></div>
       <div><dt>Source row status</dt><dd>{p.status}</dd></div>
       <div><dt>Image reference in feed</dt><dd>{p.image_url?"Present, not loaded":"Not supplied"}</dd></div>
      </dl>
     </details>
    </div>
   </article>)}
   </div>:<div className={styles.empty}>No sample products were returned for this merchant. Nothing has been published.</div>}
  <section className={styles.todo}>
   <h2>What to check before public launch</h2>
   <p><b>Presentation:</b> Card proportions, mobile wrapping, long titles, brand/category labels, price spacing and missing images.</p>
   <p><b>Data accuracy:</b> GTIN/EAN, variants, pack sizes, duplicated imports, exact merchant identities, total delivered prices, stock and expiry.</p>
   <p><b>Rights and eligibility:</b> Signed feed and image usage permission, approved affiliate terms, latest prices, publication approval and independent AVUQO scoring.</p>
   <div className={styles.links}><Link href="/control-centre/feed-imports">Open import reviews</Link>
    <Link href="/control-centre/product-readiness">Product matching &amp; readiness</Link>
    <Link href="/control-centre/source-readiness">Source rights</Link></div>
  </section>
 </div>;
}
