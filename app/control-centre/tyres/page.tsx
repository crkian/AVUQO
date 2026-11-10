import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {CheckCircle2,LockKeyhole,ShieldAlert,ShieldCheck} from "lucide-react";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import styles from "../source-atlas/atlas.module.css";
export const instant=false;
export const metadata:Metadata={title:"Tyre operations | AVUQO Control Centre",robots:{index:false,follow:false}};
const suppliers=[
 {id:"12715",name:"Tyres UK / Tyres.net",feed:"93988",admin:"/control-centre/tyre-spec-enrichment",label:"Private technical enrichment"},
 {id:"15236",name:"Pneus Online UK",feed:"26513",admin:"/control-centre/tyre-supplier-onboarding",label:"Second supplier onboarding"}
];
export default async function TyreOperations(){
 await connection();await requireControlCentreAccess();
 const db=createAdminClient();
 const [source,imports,privateRows,publicProducts,reviewJobs,enrichmentJobs]=await Promise.all([
  db.from("sources").select("status,sync_enabled,credential_status").eq("connector_key","awin").maybeSingle(),
  db.from("feed_import_runs").select("merchant_id,status,total_count,review_count,excluded_count,created_at")
    .in("merchant_id",suppliers.map(s=>s.id)).order("created_at",{ascending:false}).limit(30),
  db.from("feed_import_records").select("id",{count:"exact",head:true}).eq("import_id","8ea807f1-7050-4dfb-af51-e08dc7c7bbd5").eq("status","review"),
  db.from("products").select("id",{count:"exact",head:true}).eq("status","active"),
  db.from("awin_bulk_import_jobs").select("advertiser_id,feed_id,state,updated_at,last_failure_code")
    .in("advertiser_id",suppliers.map(s=>s.id)).order("created_at",{ascending:false}).limit(10),
  db.from("awin_tyres_spec_enrichment_jobs").select("state,source_row_count,candidate_count,updated_count,skipped_count,updated_at")
    .order("updated_at",{ascending:false}).limit(1)
 ]);
 const sourcePaused=source.data?.status!=="active"||source.data?.sync_enabled!==true;
 const statusErrors=[source,imports,privateRows,publicProducts,reviewJobs].some(x=>x.error);
 return <div className={styles.page}>
  <header className={styles.header}><p className={styles.kicker}>CONTROL CENTRE / INTELLIGENT TYRE MARKETPLACE</p>
   <h1>The complete tyre pipeline, in one place.</h1>
   <p>Track real supplier intake, private technical verification, model comparison readiness and public product admission. No permissions, imports or prices are changed from this read-only view.</p>
  </header>
  {statusErrors&&<div className={styles.callout}>Some tyre source tables could not be checked. Treat missing information as unknown, not as an approval.</div>}
  <section className={styles.metrics}>
   {[
    {name:"Awin source",value:source.error?"Unknown":sourcePaused?"Paused":"Configured active",desc:"Source activation is separate from joined-programme membership"},
    {name:"Tyres UK private review records",value:privateRows.error?"Unknown":privateRows.count??0,desc:"Staged and unverified, not public product listings"},
    {name:"Active canonical products",value:publicProducts.error?"Unknown":publicProducts.count??0,desc:"All categories combined; not equivalent to verified public tyres"},
    {name:"Technical enrichment worker",value:enrichmentJobs.error?"Not installed / unavailable":enrichmentJobs.data?.[0]?.state??"No job",desc:"A prepared automation route is not proof that a supplier import ran"}
   ].map(x=><article key={x.name} className={styles.metric}><small>{x.name}</small><strong>{typeof x.value==="number"?x.value.toLocaleString("en-GB"):x.value}</strong><p>{x.desc}</p></article>)}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Tyre supplier onboarding</h2><p>Use each named supplier's authorised feed and rights review. Awin access alone does not grant public price or image publication.</p></div>
   <div className={styles.checks}>{suppliers.map(s=>{
    const recent=(imports.data??[]).filter(r=>String(r.merchant_id)===s.id)[0];
    const job=(reviewJobs.data??[]).find(j=>String(j.advertiser_id)===s.id);
    return <article key={s.id} className={styles.check}>
     <h3>{s.name}</h3><p>Awin advertiser {s.id} · Feed {s.feed}</p>
     <p><strong>Private import:</strong> {recent?recent.status:"No completed record found"} · <strong>Staged rows:</strong> {recent?.total_count??"not confirmed"}</p>
     <p><strong>Import worker:</strong> {job?.state??"No recent journal"}{job?.last_failure_code?" · controlled failure: "+job.last_failure_code:""}</p>
     <p>Production publication is blocked until an explicit supplier-specific rights and technical data review.</p>
     <Link href={s.admin}>{s.label} →</Link>
    </article>;
   })}</div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>From supplier goods to independent AVUQO comparison</h2><p>The workflow is intentionally fail-closed; each gate has a separate owner destination.</p></div>
   <div className={styles.checks}>{[
    {title:"01 · Joined source and permitted commercial data",href:"/control-centre/source-atlas",copy:"Check each advertiser's exact data rights, credential health and publication controls."},
    {title:"02 · Private original-feed validation",href:"/control-centre/feed-imports",copy:"Record source fingerprint, product identity, currency and safe ingestion evidence."},
    {title:"03 · Exact tyre technical evidence",href:"/control-centre/tyre-spec-enrichment",copy:"Verify width/profile/rim, load and speed and special variants; no inferred fitment."},
    {title:"04 · Private product showroom",href:"/preview/tyres",copy:"Review product cards, brands and candidate facets without accidental public pricing."},
    {title:"05 · Product and retailer admission",href:"/control-centre/product-readiness",copy:"Only live, permissioned, correctly matched offers and rights-cleared images can be published."},
    {title:"06 · Consumer product and model comparisons",href:"/tyres/find",copy:"Customer finder, individual variants and model comparison remain empty until fully eligible."}
   ].map(x=><article key={x.title} className={styles.check}><h3>{x.title}</h3><p>{x.copy}</p><Link href={x.href}>Open this gate →</Link></article>)}</div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Never claim a fitted quote without the complete cost</h2></div>
   <div className={styles.checks}>{[
    {icon:CheckCircle2,text:"Product-level technical match requires evidence for exact size, load and speed."},
    {icon:LockKeyhole,text:"Vehicle compatibility, fitter identity, fitting, disposal, balancing and delivery need separate confirmation."},
    {icon:ShieldCheck,text:"Product-price comparisons are never ranked by affiliate commission."},
    {icon:ShieldAlert,text:"Private records, unapproved logos and programme membership cannot become public offers automatically."}
   ].map(x=><div className={styles.check} key={x.text}><x.icon size={21} aria-hidden="true"/><p>{x.text}</p></div>)}</div>
  </section>
 </div>;
}
