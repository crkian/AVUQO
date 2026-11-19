import Link from "next/link";
import {connection} from "next/server";
import {activePartnerPromotions,partnerFor} from "../../lib/partners/advertiser-directory";
import styles from "../../app/partners/partners.module.css";
type Props={placement?:"home"|"sales"|"travel"|"shopping"};
/** Merchant-announced codes and referral deals, kept separate from verified AVUQO price drops. */
export default async function PartnerPromoShelf({placement="shopping"}:Props){
 await connection();
 const all=activePartnerPromotions(new Date());
 const relevant=placement==="travel"?all.filter(p=>p.slug==="holiday-extras"):
  placement==="home"?all.filter(p=>p.featured):all;
 if(!relevant.length)return null;
 return <section className={styles.shell+" "+styles.directoryGroup} aria-label="Partner-announced offers">
  <div className={styles.directoryHead}>
   <div><p className={styles.kicker}>From participating advertisers</p>
    <h2>{placement==="travel"?"Airport extras and booking discounts":placement==="home"?"More from the retail park":"Partner codes and promotions"}</h2>
    <p className={styles.sectionIntro}>Advertiser announcements, not AVUQO-verified historical price drops. Final offer eligibility and prices must be checked with each retailer.</p>
   </div><Link href="/partners">Explore all shops and partners ↗</Link>
  </div>
  <div className={styles.promoGrid}>{relevant.map(p=><article key={p.id} className={styles.promo} style={{"--glow":partnerFor(p.slug)?.glow??"#eee7f5"} as React.CSSProperties}>
   <span className={styles.tag}>{partnerFor(p.slug)?.name??"Partner"} · Advertiser promotion</span>
   <h3>{p.title}</h3><p>{p.detail}</p>
   {p.code&&<div className={styles.strip}><span>Code</span><code>{p.code}</code></div>}
   <div className={styles.strip}><Link href={"/partners/"+p.slug}>Explore partner details</Link>
    <a href={p.href} target="_blank" rel="sponsored noopener noreferrer">{p.cta} ↗</a></div>
   <small className={styles.fine}>{p.source}. Merchant terms, exclusions and availability apply.</small>
  </article>)}</div>
 </section>;
}
