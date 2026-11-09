import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {BROWSE_DEPARTMENTS} from "../../../lib/categories/browse-tree";
import styles from "./atlas.module.css";

export const instant=false;
export const metadata:Metadata={title:"Source Atlas | AVUQO Control Centre",robots:{index:false,follow:false}};
type Connector={name:string;connector_key:string;status:string;sync_enabled:boolean;
 health_status:string|null;credential_status:string|null;last_successful_sync_at:string|null};
type PrivateRun={merchant_id:string;merchant_name:string;status:string;total_count:number;
 review_count:number;excluded_count:number;permission_status:string;created_at:string};
const format=(value:string|null)=>value?new Date(value).toLocaleDateString("en-GB",{timeZone:"Europe/London"}):"Never recorded";
const countString=(count:number|null|undefined,error:unknown)=>error?"Unavailable":(count??0).toLocaleString("en-GB");
export default async function SourceAtlas(){
 await connection();await requireControlCentreAccess();
 const db=createAdminClient();
 const [sources,runs,feedObs,merchants,products,offers,deals,stores,prices,travel,flags,nav]=await Promise.all([
  db.from("sources").select("name,connector_key,status,sync_enabled,health_status,credential_status,last_successful_sync_at").order("name"),
  db.from("feed_import_runs").select("merchant_id,merchant_name,status,total_count,review_count,excluded_count,permission_status,created_at").order("created_at",{ascending:false}).limit(80),
  db.from("awin_feed_update_observations").select("id",{count:"exact",head:true}),
  db.from("merchants").select("id",{count:"exact",head:true}),
  db.from("products").select("id",{count:"exact",head:true}).eq("status","active"),
  db.from("offers").select("id",{count:"exact",head:true}).eq("status","active"),
  db.from("published_deals").select("offer_id",{count:"exact",head:true}).eq("status","published"),
  db.from("grocery_stores").select("id",{count:"exact",head:true}),
  db.from("grocery_prices").select("id",{count:"exact",head:true}).eq("status","published"),
  db.from("travel_offers").select("id",{count:"exact",head:true}),
  db.from("system_controls").select("control_key,enabled").order("control_key"),
  db.from("site_content_published").select("version").eq("key","navigation").maybeSingle()
 ]);
 const sourceList=(sources.data??[]) as Connector[],imports=(runs.data??[]) as PrivateRun[];
 const latest=new Map<string,PrivateRun>();
 for(const run of imports)if(!latest.has(run.merchant_id))latest.set(run.merchant_id,run);
 const activeSources=sourceList.filter(s=>s.status==="active"&&s.sync_enabled).length;
 const flagsMap=new Map((flags.data??[]).map(item=>[item.control_key,item.enabled]));
 const summaries=[
  {name:"Registered connectors",value:countString(sourceList.length,sources.error),detail:"Network/connector records, not confirmed commercial feeds"},
  {name:"Active connector switches",value:countString(activeSources,sources.error),detail:"May include a demo source; activation does not prove retailer rights"},
  {name:"Private import runs",value:countString(imports.length,runs.error),detail:"Runs, not approved public products. Latest 80 inspected"},
  {name:"Awin feed observations",value:countString(feedObs.count,feedObs.error),detail:"Feed-list sightings, not authorised imports"},
  {name:"Merchants registered",value:countString(merchants.count,merchants.error),detail:"Merchant records, not verified shopping relationships"},
  {name:"Active canonical products",value:countString(products.count,products.error),detail:"Offer-eligibility checks happen separately"},
  {name:"Active offer records",value:countString(offers.count,offers.error),detail:"Raw status alone does not qualify for public display"},
  {name:"Published-deal records",value:countString(deals.count,deals.error),detail:"Public catalogue performs extra source, freshness and rights gates"},
  {name:"Supermarket records",value:countString(stores.count,stores.error),detail:"A store directory is not a live retailer feed"},
  {name:"Published grocery price rows",value:countString(prices.count,prices.error),detail:"Rights, freshness and complete-basket gates still apply"},
  {name:"Travel offer records",value:countString(travel.count,travel.error),detail:"No live travel coverage is implied by the route"},
  {name:"Editorial departments",value:String(BROWSE_DEPARTMENTS.length),detail:"Curated browsing taxonomy, not live stock"}
 ];
 return <div className={styles.page}>
  <div className={styles.header}><p className={styles.kicker}>Control Centre / all connected and planned sources</p>
   <h1>AVUQO Source Atlas</h1>
   <p>One factual operating view for networks, merchants, private imports, published records, groceries, travel and customer-facing content. A feed observation, active database row and public-release approval are three different states.</p>
   <div className={styles.links}><Link href="/control-centre/sources">Connector switches</Link>
    <Link href="/control-centre/awin-programmes">Awin programmes</Link>
    <Link href="/control-centre/feed-imports">Private imports</Link>
    <Link href="/control-centre/release-readiness">Release checks</Link>
    <Link href="/marketplace">Public marketplace</Link></div>
  </div>
  {(sources.error||runs.error||feedObs.error||flags.error)&&<div role="alert" className={styles.notice}>Some live operational data could not be read. An unavailable count or status is not interpreted as zero or as an approval.</div>}
  <section className={styles.grid} aria-label="Source and catalogue counts">{summaries.map(item=><article className={styles.metric} key={item.name}><small>{item.name}</small><strong>{item.value}</strong><p>{item.detail}</p></article>)}</section>
  <section className={styles.panel}>
   <div className={styles.panelHead}><h2>Every source connector</h2><p>Read-only inventory. Credentials, private metadata, tracking links and access tokens are never displayed.</p></div>
   <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Source</th><th>Connector</th><th>Registry status</th><th>Health</th><th>Last success</th></tr></thead>
    <tbody>{sourceList.map(s=><tr key={s.connector_key}><td><strong>{s.name}</strong></td><td>{s.connector_key}</td>
     <td><span className={styles.status+" "+(s.status==="active"&&s.sync_enabled?styles.active:styles.paused)}>{s.status} · sync {s.sync_enabled?"on":"off"}</span></td>
     <td>{s.health_status??"Unknown"}<small>Credentials: {s.credential_status??"Not recorded"}</small></td><td>{format(s.last_successful_sync_at)}</td>
    </tr>)}</tbody></table></div>
   {!sourceList.length&&<p className={styles.empty}>No source rows available.</p>}
  </section>
  <section className={styles.panel}>
   <div className={styles.panelHead}><h2>Private supplier imports</h2><p>Latest run for each supplier. These records remain outside customer-facing product listings without independent publication approval.</p></div>
   <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Supplier</th><th>Run status</th><th>Rows</th><th>Review / excluded</th><th>Rights state</th><th>Last run</th></tr></thead>
    <tbody>{[...latest.values()].map(run=><tr key={run.merchant_id}><td><strong>{run.merchant_name}</strong><small>Supplier {run.merchant_id}</small></td>
     <td>{run.status}</td><td>{run.total_count.toLocaleString("en-GB")}</td><td>{run.review_count.toLocaleString("en-GB")} / {run.excluded_count.toLocaleString("en-GB")}</td>
     <td><span className={styles.status+" "+styles.paused}>{run.permission_status}</span></td>
     <td>{format(run.created_at)}</td></tr>)}</tbody></table></div>
   {!latest.size&&<p className={styles.empty}>No import runs are available.</p>}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Publication and website controls</h2><p>Configuration is visible here. Changes remain in the existing authorised workspaces and follow their approval and audit rules.</p></div>
   <div className={styles.checks}>
    {Array.from(flagsMap.entries()).map(([name,enabled])=><article className={styles.check} key={name}>
     <h3>{name.replaceAll("_"," ")}</h3>
     <span className={styles.status+" "+(enabled?styles.active:styles.paused)}>{enabled?"Switch enabled":"Switch off"}</span>
     <p>An enabled switch alone does not override supplier-specific rights, proof of stock, price freshness or individual publication approval.</p></article>)}
    <article className={styles.check}><h3>Navigation publishing</h3><span className={styles.status}>{nav.error?"Unverified":nav.data?"Published version "+nav.data.version:"Built-in navigation"}</span>
     <p>Owner-managed menu changes have their own draft, publish and revision history.</p><Link href="/control-centre/content/navigation">Open menu editor →</Link></article>
   </div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Workspaces and next review steps</h2><p>Everything stays inside the existing Control Centre.</p></div>
   <div className={styles.checks}>
    {[
     {title:"Merchant and supplier rights",desc:"Review partner programme terms, feed-use evidence and public release approval separately.",href:"/control-centre/source-readiness"},
     {title:"Product identity and offer evidence",desc:"Compare exact models, prices, variants and permissible images before release.",href:"/control-centre/product-readiness"},
     {title:"Tyre supplier onboarding",desc:"Pneus Online remains private and blocked until real source rights are recorded.",href:"/control-centre/tyre-supplier-onboarding"},
     {title:"Groceries and supermarkets",desc:"Verify shop permissions, units, basket coverage and evidence freshness.",href:"/control-centre/groceries"},
     {title:"Editorial and legal publishing",desc:"Publish reviewed content without mixing it with supplier offer activation.",href:"/control-centre/content"},
     {title:"Analytics, trust and exceptions",desc:"Inspect missing evidence, operational errors and independence controls.",href:"/control-centre/trust"}
    ].map(item=><article className={styles.check} key={item.title}><h3>{item.title}</h3><p>{item.desc}</p><Link href={item.href}>Open workspace →</Link></article>)}
   </div>
  </section>
  <aside className={styles.notice}><strong>Release firewall:</strong> This Source Atlas is read-only. It does not resume feeds, grant product or image rights, alter historical prices, publish offers, change content or contact partners. The owner must verify each programme independently before activating its commercial integration.</aside>
 </div>;
}
