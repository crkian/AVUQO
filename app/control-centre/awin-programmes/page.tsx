import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {joinedAwinAdvertisers,joinedInSource} from "../../../lib/awin/joined-catalogue";
import styles from "./programmes.module.css";
export const instant=false;
export const metadata:Metadata={title:"All joined Awin programmes | AVUQO",robots:{index:false,follow:false}};

type Run={merchant_id:string;merchant_name:string;created_at:string;total_count:number;status:string};
type Feed={advertiser_id:string;feed_id:string;feed_name:string;listed_products:number;last_imported_source:string;observed_at:string;needs_private_refresh:boolean};
const known:Record<string,{feedId:string;description:string;products:number}[]>={
 "496":[{feedId:"89987",description:"All Products, historical Tooled-Up upload",products:84284}],
 "31539":[{feedId:"74135",description:"SIM-free phones",products:224},{feedId:"97136",description:"SIM-only plans",products:33},{feedId:"97090",description:"Pay-monthly range, needs large importer",products:7729}],
 "12715":[{feedId:"93988",description:"Tyres UK range, needs large importer",products:31354}],
 "15236":[{feedId:"26513",description:"Tyres Pneus Online range, needs large importer",products:20034}],
 "37738":[{feedId:"81201",description:"1pMobile plans",products:10}],
 "118401":[{feedId:"109353",description:"Parking comparison feed",products:60}],
 "128157":[{feedId:"116573",description:"Lyca Mobile plans",products:10}],
 "77952":[{feedId:"119009",description:"Petlibro hero products",products:19}]
};
const statusText=(run:Run|undefined,feedCount:number,knownCount:number)=>{
 if(run)return "Private data imported";
 if(feedCount>0||knownCount>0)return "Feed listed; not imported";
 return "Feed availability unconfirmed";
};
export default async function Page(){
 await connection();
 await requireControlCentreAccess();
 const admin=createAdminClient();
 const [registry,imports,observations]=await Promise.all([
  admin.from("sources").select("metadata").eq("connector_key","awin").maybeSingle(),
  admin.from("feed_import_runs").select("merchant_id,merchant_name,created_at,total_count,status")
   .in("status",["private_review","importing"]).order("created_at",{ascending:false}).limit(150),
  admin.from("awin_feed_update_observations").select("advertiser_id,feed_id,feed_name,listed_products,last_imported_source,observed_at,needs_private_refresh").limit(1000)
 ]);
 const validRegistry=registry.data&&!registry.error;
 const rows=(imports.data??[]) as Run[],feeds=(observations.data??[]) as Feed[];
 const latest=new Map<string,Run>();
 for(const row of rows)if(!latest.has(row.merchant_id))latest.set(row.merchant_id,row);
 const grouped=new Map<string,Feed[]>();
 for(const feed of feeds)grouped.set(feed.advertiser_id,[...(grouped.get(feed.advertiser_id)??[]),feed]);
 const joined=joinedAwinAdvertisers.map(([id,name])=>{
  const recorded=grouped.get(id)??[],observedIds=new Set(recorded.map(f=>f.feed_id));
  const remaining=(known[id]??[]).filter(f=>!observedIds.has(f.feedId));
  const run=latest.get(id),membership=Boolean(validRegistry&&joinedInSource(registry.data?.metadata,id));
  return {id,name,recorded,remaining,run,membership,
   listed:recorded.length+remaining.length,
   status:statusText(run,recorded.length,remaining.length)};
 });
 const staged=joined.filter(p=>p.run?.status==="private_review").length;
 return <main className={styles.page}>
  <nav className={styles.breadcrumb}><Link href="/control-centre">Control Centre</Link><span>/</span><Link href="/control-centre/feed-imports">Feed imports</Link><span>/</span>All Awin programmes</nav>
  <header className={styles.header}>
   <p className={styles.eyebrow}>SOURCE CONTROL · ALL JOINED ADVERTISERS</p>
   <h1>Every accepted Awin programme, in one place.</h1>
   <p>Nothing is excluded because its feed is large or because it offers a service rather than physical products. This register covers all 16 programmes observed as joined on 4 November 2026. Membership is checked against the live source registry and is not permission to reuse images or publish offers.</p>
  </header>
  <div className={styles.metrics}>
   <div><strong>{joined.length}</strong><span>Accepted programme records</span></div>
   <div><strong>{staged}</strong><span>With completed private imports</span></div>
   <div><strong>{joined.filter(p=>p.listed>0).length}</strong><span>With recorded or historical feed references</span></div>
   <div><strong>0</strong><span>Public offers activated here</span></div>
  </div>
  {(registry.error||imports.error||observations.error)&&<p className={styles.warning} role="alert">Some live source information is unavailable. Historical feed references are labelled separately and no merchant activation is assumed.</p>}
  <section className={styles.guidance}>
   <strong>Full-range ingestion approach</strong>
   <p>Use the existing CSV importer for feeds up to 2,500 rows. The 84,284-row Tooled-Up importer is presently merchant-specific and cannot be used for tyres or other advertisers. Bigger and specialised feeds require a generalised resumable importer with merchant validation, careful overlap deduplication and separate service/contract taxonomy. Feed credentials and authorised product usage must be verified before automation.</p>
   <div className={styles.actions}><Link href="/control-centre/feed-imports#standard-awin-upload">Open private CSV importer</Link><Link href="/control-centre/feed-list-audit">Audit full Awin feed list</Link><Link href="/control-centre/awin-feed-updates">Check source freshness</Link></div>
  </section>
  <section className={styles.programmes} aria-label="All accepted Awin programmes">
   {joined.map(p=><article className={styles.card} key={p.id}>
    <div className={styles.top}><div><span className={styles.id}>AWIN {p.id}</span><h2>{p.name}</h2></div><span className={styles.state}>{p.status}</span></div>
    <p className={styles.membership}>{p.membership?"Joined in live source registry":"Live joined status not currently confirmed"} · Publication/image rights unverified</p>
    {p.run&&<p className={styles.import}>Latest import: {p.run.total_count.toLocaleString("en-GB")} records, {p.run.status==="private_review"?"private review":"import still running"} · {new Date(p.run.created_at).toLocaleDateString("en-GB",{timeZone:"UTC"})}</p>}
    {p.recorded.length>0&&<div className={styles.feedBox}><strong>Feed observations ({p.recorded.length})</strong>{p.recorded.slice(0,8).map(f=><div key={f.feed_id} className={styles.feed}><span>{f.feed_name||"Feed"} · ID {f.feed_id}</span><span>{f.listed_products.toLocaleString("en-GB")} listed</span></div>)}{p.recorded.length>8&&<small>+ {p.recorded.length-8} additional feed entries. Use the feed inventory audit for all.</small>}</div>}
    {p.remaining.length>0&&<div className={styles.feedBox}><strong>From 4 November inventory / prior upload</strong>{p.remaining.map(f=><div key={f.feedId} className={styles.feed}><span>{f.description} · ID {f.feedId}</span><span>{f.products.toLocaleString("en-GB")} listed</span></div>)}</div>}
    {!p.listed&&<p className={styles.unknown}>No current feed entry has been recorded for this programme. Check the official Awin feed inventory or its affiliate service linking arrangements; do not infer that it has no products.</p>}
    <div className={styles.cardActions}>
     <Link href="/control-centre/feed-list-audit">Verify feed list</Link>
     <Link href="/control-centre/feed-imports#standard-awin-upload">Stage eligible CSV privately</Link>
    </div>
   </article>)}
  </section>
  <p className={styles.disclaimer}>Inventory sizes and feed IDs are indicative snapshots, not evidence that a feed download works today. All Awin and eBay automatic syncing remains paused. No customer-facing listings, prices, product images or affiliate checkout links are activated by this register.</p>
 </main>;
}
