import {connection} from "next/server";
import Link from "next/link";
import {createClient} from "../../../lib/supabase/server";
import {CONTROL_CENTRE_SECTIONS} from "../../../lib/control-centre/workspaces";
import styles from "./readiness.module.css";
type Check={name:string;status:"available"|"restricted"|"pending"|"unknown";detail:string;href:string};
export default async function ReleaseReadiness(){
 await connection();
 const db=await createClient();
 const [nav,system,ads,groceries,sources,prices,marketing,feeds]=await Promise.all([
  db.from("site_content_published").select("version").eq("key","navigation").maybeSingle(),
  db.from("marketing_system").select("publishing_enabled,ai_enabled,emergency_stop").eq("singleton",true).maybeSingle(),
  db.from("site_advertisers").select("id",{count:"exact",head:true}),
  db.from("grocery_stores").select("id",{count:"exact",head:true}),
  db.from("sources").select("id",{count:"exact",head:true}),
  db.from("grocery_prices").select("id",{count:"exact",head:true}),
  db.from("marketing_brands").select("slug",{count:"exact",head:true}),
  db.from("marketing_channels").select("id",{count:"exact",head:true}).eq("connection_state","verified")
 ]);
 const count=(n:number|null,err:unknown)=>err?"Unavailable":n===null?"Not checked":String(n);
 const checks:Check[]=[
  {name:"Website menu and publishing",status:nav.error?"unknown":"available",
   detail:nav.error?"Content CMS cannot be read":nav.data?"Version "+nav.data.version+" is published":"Vetted built-in menu is public; owner has not published edits",
   href:"/control-centre/content/navigation"},
  {name:"External site advertising",status:ads.error?"unknown":"restricted",
   detail:ads.error?"Private advertising tables require installation":
    count(ads.count,ads.error)+" advertisers recorded. Campaign serving and paid bookings are not connected.",
   href:"/control-centre/site-advertising"},
  {name:"Four-brand social marketing",status:marketing.error?"unknown":"restricted",
   detail:marketing.error?"Marketing records unavailable":count(marketing.count,marketing.error)+" brand workspaces. "+
    (system.data?.emergency_stop?"Emergency stop ON. ":"")+
    (system.data?.publishing_enabled?"Publishing switch enabled.":"Publishing OFF.")+
    " Verified social channels: "+count(feeds.count,feeds.error),
   href:"/control-centre/marketing"},
  {name:"AI creative generation",status:system.error?"unknown":"restricted",
   detail:system.data?.ai_enabled?"Database AI control enabled; verify real provider budget and usage":"Database AI generation OFF until authorised models and budget are connected",
   href:"/control-centre/marketing?tab=automation"},
  {name:"Supermarket catalogue",status:groceries.error?"unknown":"available",
   detail:count(groceries.count,groceries.error)+" supermarket records. Listings do not prove price feeds or retailer permission.",
   href:"/control-centre/groceries"},
  {name:"Grocery price coverage",status:prices.error?"unknown":"pending",
   detail:count(prices.count,prices.error)+" price rows. Current, valid and rights-cleared coverage must be verified separately.",
   href:"/control-centre/groceries/price-evidence"},
  {name:"Source connector registry",status:sources.error?"unknown":"pending",
   detail:count(sources.count,sources.error)+" registered source records. Active authorised connections need separate review.",
   href:"/control-centre/sources"},
  {name:"Affiliate programme and commissions",status:"pending",
   detail:"Only confirmed programme access, approved products and reconciled conversions qualify for public promotion.",
   href:"/control-centre/revenue"},
  {name:"Budgeting & Savings customer journey",status:"pending",
   detail:"Strategic requirement, not yet a verified complete consumer feature. Do not promise bank connections or realised savings.",
   href:"/control-centre/content"},
  {name:"Responsive authenticated browser review",status:"pending",
   detail:"Verify owner/admin screens at mobile and zoom levels; code and HTTP checks alone cannot prove layout behaviour.",
   href:"/control-centre"}
 ];
 return <div className={styles.page}>
  <div className={styles.header}><p className={styles.kicker}>Start here / Release readiness</p>
   <h1>What&apos;s working, and what still needs attention?</h1>
   <p>One factual release checklist across the public site, data systems and private backend. A record count is never evidence of a working feed, advertising delivery or independently verified savings.</p></div>
  <div className={styles.legend}><span>Available: built interface or record access</span>
   <span>Restricted: deliberately off</span><span>Pending: operational acceptance remains</span><span>Unknown: data unavailable</span></div>
  <div className={styles.checks}>{checks.map(item=><article key={item.name} className={styles.check}>
    <div><span className={styles.status+" "+styles[item.status]}>{item.status}</span><h2>{item.name}</h2>
     <p>{item.detail}</p></div>
    <Link href={item.href}>Open workspace</Link>
  </article>)}</div>
  <section className={styles.panel}><h2>Backend map</h2>
   <p>All operating systems stay within the existing AVUQO Control Centre. Advertising on AVUQO, marketing our own four sites, and merchant affiliate promotion are separate workflows.</p>
   <div className={styles.workspaces}>{CONTROL_CENTRE_SECTIONS.map(section=><div key={section.id}>
    <h3>{section.label}</h3><p>{section.description}</p>
    {section.links.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}
   </div>)}</div>
  </section>
  <section className={styles.panel}><h2>Release gate</h2>
   <p>Before enabling ad delivery, social publishing, AI generation or source ingestion: confirm permissions, test role security, run automated checks, complete authenticated browser testing, verify production logs and retain a rollback path.</p>
  </section>
 </div>;
}
