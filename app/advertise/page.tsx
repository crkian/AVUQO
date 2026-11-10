import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,CheckCircle2,ShieldCheck,Sparkles} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {AD_ZONES} from "../../lib/site-advertising/policy";
import styles from "./page.module.css";
export const metadata:Metadata={title:"Advertise & partner with AVUQO | Independent shopping",description:"Explore clearly labelled, carefully reviewed partnership opportunities with AVUQO. Advertising never changes organic product rankings or AVUQO Scores.",alternates:{canonical:"/advertise"}};
const measures=[
 {title:"Separate from organic rankings",text:"Commercial placements never buy a better AVUQO Score or override a product's verification checks."},
 {title:"Clearly disclosed",text:"Paid advertising must be marked as Advertisement or Sponsored and distinguished from independent recommendations."},
 {title:"Permissioned and reviewed",text:"Creative, landing page, rights, campaign duration and any savings or availability claims require evidence."}
];
export default function Advertise(){
 return <main className={styles.page}><Header/>
  <section className={styles.hero}><div className="shell"><p className={styles.kicker}><Sparkles size={16}/> AVUQO PARTNERSHIPS / DISCOVERABILITY</p>
   <h1>Reach curious shoppers.<br/><em>Keep their trust.</em></h1>
   <p>AVUQO connects considered shopping, product discovery and comparison. We welcome enquiries from suitable brands and retailers who value transparent, useful advertising.</p>
   <div className={styles.actions}><Link href="/contact">Discuss a partnership <ArrowRight size={17}/></Link>
    <Link href="/affiliate-disclosure">Our affiliate independence policy</Link></div>
  </div></section>
  <section className={"shell "+styles.section}><div className={styles.heading}><p className={styles.kicker}>A PLANNED COMMERCIAL OFFERING</p>
   <h2>A place for a story worth telling.</h2><p>These are possible creative positions within AVUQO's owner-managed advertising workflow. They are not a rate card, currently bookable inventory or a guarantee of impressions.</p></div>
   <div className={styles.grid}>{AD_ZONES.map((zone,i)=><article className={styles.card} key={zone.id}><span className={styles.number}>{String(i+1).padStart(2,"0")}</span>
    <h3>{zone.label}</h3><p>{zone.description}</p><span className={styles.explanation}>Subject to review, scheduling and availability</span>
   </article>)}</div>
  </section>
  <section className={styles.trust}><div className={"shell "+styles.trustInner}><div><p className={styles.kicker}>FIND WHAT'S WORTH IT</p>
    <h2>Editorial integrity is part of the product.</h2><p>We do not sell ranking positions, fabricated price claims or access to private shopper information.</p></div>
   <ul>{measures.map(m=><li key={m.title}><CheckCircle2 size={22}/><div><h3>{m.title}</h3><p>{m.text}</p></div></li>)}</ul>
  </div></section>
  <section className={"shell "+styles.final}><ShieldCheck size={32}/><h2>Start with a conversation.</h2>
   <p>Contact AVUQO with your business, intended placement and rights-cleared campaign outline. Acceptance, pricing and activation remain subject to review and an explicit agreement. No payments or bookings are taken on this page.</p>
   <Link href="/contact">Contact AVUQO <ArrowRight size={17}/></Link></section>
  <Footer/></main>;
}
