import Link from "next/link";
import type {CSSProperties} from "react";
import {ArrowRight,Store} from "lucide-react";
import {partnersForDepartment} from "../../lib/partners/catalogue-taxonomy";
import {partnerHref} from "../../lib/partners/advertiser-directory";
import styles from "../../app/partners/partners.module.css";

/** Contextual advertiser discovery on established product department pages.
 * Relationship only: do not imply that this retailer has eligible live products
 * in this department unless its separately verified product shelf says so. */
export default function DepartmentPartnerShelf({department}:{department:string}){
 const retailers=partnersForDepartment(department);
 if(!retailers.length)return null;
 return <section className={styles.shell+" "+styles.directoryGroup} aria-label="Retailers related to this category">
  <div className={styles.directoryHead}><div>
   <p className={styles.kicker}><Store size={14} aria-hidden="true"/> Retailers & service providers</p>
   <h2>Shops and partners in this category.</h2>
   <p className={styles.sectionIntro}>Meet participating advertisers with an interest in this department. Their own pages show any eligible offers, approved promotions and provider links. Membership alone does not guarantee live stock or the lowest price.</p>
  </div><Link href={"/partners?department="+encodeURIComponent(department)} className={styles.textAction}>Browse this department&apos;s retailers <ArrowRight size={16}/></Link></div>
  <div className={styles.relatedStores}>{retailers.slice(0,8).map(p=><Link className={styles.relatedStore} href={partnerHref(p)} key={p.slug}
   style={{"--accent":p.accent,"--deep":p.deep,"--glow":p.glow} as CSSProperties}>
   <span aria-hidden="true">{p.symbol}</span><strong>{p.name}</strong><ArrowRight size={15} aria-hidden="true"/>
  </Link>)}</div>
 </section>;
}
