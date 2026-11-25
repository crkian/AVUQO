import Link from "next/link";
import {quoteJourney} from "../../lib/partners/quote-journeys";
import {isApprovedPartnerLink,type Partner} from "../../lib/partners/advertiser-directory";
import styles from "../../app/partners/partners.module.css";
export default function PartnerQuoteJourney({partner}:{partner:Partner}){
 const journey=quoteJourney(partner.slug);if(!journey)return null;
 const links=partner.links.filter(isApprovedPartnerLink);
 return <section className={styles.section} id="quote-preparation"><p className={styles.kicker}>SPECIALIST SHOPPING JOURNEY</p><h2>{journey.title}</h2><p className={styles.sectionIntro}>Use the same requirements when comparing providers. AVUQO does not submit a booking or collect these details here.</p><div className={styles.twoCols}><div><h3>Have these details ready</h3><ul>{journey.fields.map(f=><li key={f}>{f}</li>)}</ul></div><div><h3>Check the complete cost</h3><ul>{journey.costs.map(f=><li key={f}>{f}</li>)}</ul></div></div><div className={styles.linkGrid}>{links.map(l=><a className={styles.linkCard} key={l.href+l.label} href={l.href} target="_blank" rel={l.kind==="approved_awin"?"sponsored noopener noreferrer":"noopener noreferrer"}><strong>{l.label}</strong><span>Check current terms at the provider</span></a>)}<Link className={styles.linkCard} href={journey.route}><strong>Explore AVUQO guidance</strong><span>Compare the requirements before choosing</span></Link></div></section>;
}
