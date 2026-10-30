import {connection} from "next/server";
import Link from "next/link";
import {createAdminClient} from "../../../lib/supabase/admin";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {ANALYTICS_EVENT_VERSION,ANALYTICS_EVENTS,EVENT_DEFINITIONS,MEASUREMENT_GATES} from "../../../lib/analytics/contracts";
import styles from "./analytics.module.css";

type Range="7d"|"30d"|"90d";
type Metric={value:number|null;error:string|null;latest:string|null};
type Counts={events:Metric;clicks:Metric;conversions:Metric};
const EMPTY:Metric={value:null,error:"Unavailable",latest:null};
const ranges:Record<Range,number>={"7d":7,"30d":30,"90d":90};
const formatter=new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"});
async function loadMetric(
 db:ReturnType<typeof createAdminClient>,table:"analytics_events"|"click_events"|"affiliate_conversions",
 since:string
):Promise<Metric>{
 try{
  const [total,newest]=await Promise.all([
   db.from(table).select("id",{count:"exact",head:true}).gte("created_at",since),
   db.from(table).select("created_at").gte("created_at",since)
     .order("created_at",{ascending:false}).limit(1)
  ]);
  if(total.error||newest.error)return {...EMPTY,error:"Query failed; no zero is assumed"};
  return {value:total.count,latest:newest.data?.[0]?.created_at??null,error:null};
 }catch{return {...EMPTY,error:"Private reporting service unavailable"}}
}
export default async function AnalyticsDashboard({
 searchParams
}:{searchParams:Promise<{range?:string}>}){
 await connection();
 await requireControlCentreAccess();
 const params=await searchParams;
 const range:Range=params.range==="90d"?"90d":params.range==="30d"?"30d":"7d";
 const start=new Date(Date.now()-ranges[range]*86400000).toISOString();
 let counts:Counts={events:EMPTY,clicks:EMPTY,conversions:EMPTY};
 try{
  const db=createAdminClient();
  const [events,clicks,conversions]=await Promise.all([
   loadMetric(db,"analytics_events",start),
   loadMetric(db,"click_events",start),
   loadMetric(db,"affiliate_conversions",start)
  ]);
  counts={events,clicks,conversions};
 }catch{/* Explicit unavailable states are shown. */}
 const values=[
  {label:"Recorded event rows",metric:counts.events,description:"Existing event table only. These are not unique visitors or sessions."},
  {label:"Recorded merchant click rows",metric:counts.clicks,description:"Recorded outbound click rows, not confirmed purchases or eligible revenue."},
  {label:"Affiliate conversion records",metric:counts.conversions,description:"Only provider-reported conversion records, subject to verification."}
 ];
 return <div className={styles.page}>
  <header className={styles.header}>
   <p className={styles.kicker}>Operations & Trust / First-party Analytics</p>
   <h1>Analytics &amp; intelligence</h1>
   <p>Own the evidence, not assumptions. This first release reports existing AVUQO records while visitor tracking and identification stay off pending privacy, consent and retention review.</p>
   <div className={styles.gates}>
    <strong>Collection not enabled</strong>
    <span>Browser tracking OFF · Visitor identity OFF · Advertising measurement OFF · No estimated conversion figures</span>
   </div>
  </header>
  <nav className={styles.range} aria-label="Analytics time window">
   {(["7d","30d","90d"] as const).map(d=><Link key={d} href={"?range="+d}
    aria-current={d===range?"page":undefined} className={d===range?styles.selected:""}>{d==="7d"?"Last 7 days":d==="30d"?"Last 30 days":"Last 90 days"}</Link>)}
  </nav>
  <p className={styles.time}>Rolling {ranges[range]}×24-hour window beginning {formatter.format(new Date(start))} (Europe/London display). Queries use UTC timestamps.</p>
  <div className={styles.metrics}>{values.map(item=><section key={item.label} className={styles.metric}>
    <p>{item.label}</p><strong>{item.metric.value===null?"Unavailable":item.metric.value.toLocaleString("en-GB")}</strong>
    <span>{item.description}</span>
    <small>{item.metric.error??(item.metric.latest?"Last record: "+formatter.format(new Date(item.metric.latest)):"No records in this window")}</small>
   </section>)}</div>
  <section className={styles.panel}><h2>How to interpret these figures</h2>
   <p>The reporting window includes only records actually stored in AVUQO&apos;s existing tables. Historic consent coverage, bot filtering and event quality have not yet been independently verified, so these figures are <strong>observed database records</strong>, not certified audience analytics.</p>
   <div className={styles.warnings}>
    <p>Unique visitors, sessions, engagement and funnels: <b>Not measured here</b>.</p>
    <p>Search terms, product impressions, complete eligible baskets: <b>Not connected to a verified analytics intake yet</b>.</p>
    <p>Revenue, conversion rates and campaign ROI: <b>Unavailable without authoritative reconciled reporting and campaign costs</b>.</p>
   </div>
  </section>
  <section className={styles.panel}><h2>Version {ANALYTICS_EVENT_VERSION} measurement dictionary</h2>
   <p>This is the planned, reviewed event contract, not a claim that the browser currently collects these events.</p>
   <div className={styles.dictionary}>{ANALYTICS_EVENTS.map(event=><div key={event}>
     <code>{event}</code><span>{EVENT_DEFINITIONS[event]}</span>
   </div>)}</div>
  </section>
  <section className={styles.panel}><h2>Activation checklist</h2>
   <ul className={styles.checklist}>
    <li>Complete UK GDPR/PECR and privacy-notice review for each proposed data category.</li>
    <li>Ensure analytics opt-out prevents disallowed collection and consent withdrawal is effective.</li>
    <li>Deploy a validated, rate-limited server ingest, idempotency and bot/test suppression before public SDK calls.</li>
    <li>Implement retention and deletion windows, hourly/daily aggregates, freshness monitoring and aggregation verification.</li>
    <li>Reconcile provider conversions and refunds separately from click events.</li>
    <li>Test dashboard calculations with deterministic fixtures before claiming funnels, revenue or savings.</li>
   </ul>
   <p className={styles.note}>Collection enabled: <b>{MEASUREMENT_GATES.clientCollectionEnabled?"Yes":"No"}</b>. No consumer analytics scripts or event requests were enabled by this change.</p>
   <div className={styles.links}><Link href="/control-centre/revenue">Revenue ledger</Link><Link href="/control-centre/release-readiness">Release readiness</Link><Link href="/control-centre/groceries/price-evidence">Grocery price evidence</Link></div>
  </section>
 </div>;
}
