import Link from "next/link";
import {connection} from "next/server";
import {CalendarDays,ArrowRight,ShieldCheck} from "lucide-react";
import {annualSeasonalWindows,editorialSpotlight} from "../../../lib/editorial/seasonal-schedule";
import {ukCivilDate} from "../../../lib/editorial/seasonal-date.mjs";
import styles from "./seasonal-calendar.module.css";

const ukLabel=(s:string)=>new Date(s+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"});
export default async function SeasonalCalendarPage(){
 await connection(); // The parent Control Centre layout enforces server-side owner/admin access.
 const today=new Date();
 const uk=ukCivilDate(today);
 const year=uk?.year??2026;
 const todayKey=uk?`${uk.year}-${String(uk.month).padStart(2,"0")}-${String(uk.day).padStart(2,"0")}`:"";
 const current=editorialSpotlight(today);
 const years=[year,year+1];
 return <div className={styles.page}>
  <header className={styles.head}><p>Control Centre / Website &amp; Experience</p><h1><CalendarDays size={28}/> Automatic seasonal homepage calendar</h1>
  <p>Read-only UK editorial schedule. The live homepage changes its lead photograph, headline and destination automatically at the start of each UK calendar day. It does not publish products, approve advertisers or invent discounts.</p>
  <div className={styles.links}><Link href="/" target="_blank">View live homepage <ArrowRight size={16}/></Link><Link href="/control-centre/marketing?tab=homepage">Manage independently approved campaign placements <ArrowRight size={16}/></Link></div></header>
  <section className={styles.active} aria-label="Current homepage theme"><span>Current theme · Europe/London</span><h2>{current?.name??"Everyday shopping"}</h2><p>{current?.summary??"Find what's worth it."}</p><Link href={current?.href??"/"}>Open the linked destination <ArrowRight size={16}/></Link></section>
  {years.map(y=><section key={y} className={styles.year} aria-labelledby={`year-${y}`}>
    <h2 id={`year-${y}`}>{y} campaign calendar</h2>
    <div className={styles.grid}>{annualSeasonalWindows(y).map((item,i)=>{
     const isActive=item.id===current?.id&&item.from<=todayKey&&item.to>=todayKey;
     return <article key={`${y}-${i}`} className={styles.event}>
      <span className={styles.dates}>{ukLabel(item.from)} – {ukLabel(item.to)}</span>
      <h3>{item.name}{isActive&&<span className={styles.badge}>Active</span>}</h3>
      <p>{item.note}</p><Link href={item.href}>View destination <ArrowRight size={14}/></Link>
     </article>})}</div>
    <p className={styles.fallback}>Between named campaigns, the homepage automatically uses spring, summer or autumn editorial themes. Every date has a sensible theme, including outside major shopping events.</p>
  </section>)}
  <aside className={styles.notice}><ShieldCheck size={23}/><div><strong>Evidence firewall stays on.</strong><p>Seasonal artwork is editorial. Awin, eBay, tyres, travel quotes, price histories, affiliate tracking and live merchant photographs require their separate source permissions and freshness gates. Approved paid placements are managed separately and must remain clearly labelled.</p></div></aside>
 </div>;
}
