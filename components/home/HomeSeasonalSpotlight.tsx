import Link from "next/link";
import {ArrowRight,CalendarDays,ShieldCheck} from "lucide-react";
import type {EditorialSpotlight} from "../../lib/editorial/seasonal-schedule";
import styles from "./HomeSeasonalSpotlight.module.css";
export default function HomeSeasonalSpotlight({spotlight}:{spotlight:EditorialSpotlight|null}){
 if(!spotlight)return null;
 return <section className={styles.section} aria-labelledby="avuqo-home-season-heading">
  <div className="shell">
   <div className={styles.card} style={{backgroundImage:`url("${spotlight.image}")`}}>
    <div className={styles.copy}>
     <p className={styles.kicker}><CalendarDays size={16} aria-hidden="true"/> THE AVUQO SEASONAL EDIT</p>
     <h2 id="avuqo-home-season-heading">{spotlight.title.split(" at AVUQO")[0]}<em>{spotlight.title.includes(" at AVUQO")?" at AVUQO":""}</em></h2>
     <p>{spotlight.summary}</p>
     <div className={styles.actions}>
      <Link className={styles.primary} href={spotlight.href}>{spotlight.cta} <ArrowRight size={16}/></Link>
      <Link className={styles.secondary} href={spotlight.secondaryHref}>{spotlight.secondaryLabel}</Link>
     </div>
    </div>
   </div>
   <p className={styles.disclosure}><ShieldCheck size={15}/> Automatically selected editorial inspiration for the current season, not an advertisement or evidence of discounted products. Only verified retailer offers may appear in product listings.</p>
  </div>
 </section>;
}