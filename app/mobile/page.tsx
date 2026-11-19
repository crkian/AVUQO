import type {Metadata} from "next";
import type {CSSProperties} from "react";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {PARTNERS,partnerHref} from "../../lib/partners/advertiser-directory";
import styles from "../partners/partners.module.css";
export const metadata:Metadata={
 title:"Mobile phones, SIM-only and pay as you go | AVUQO",
 description:"Browse AVUQO mobile partners, eligible handset products and independent guidance on full contract cost. Plan prices are not quoted without current provider data.",
 alternates:{canonical:"/mobile"}
};
const groups=[
 {id:"sim-only",title:"SIM-only and pay as you go",intro:"Keep your current phone and choose the allowance, network and commitment you need.",slugs:["one-p-mobile","lyca-mobile","chattr-sim-only","broadband-mobile-coop"]},
 {id:"handsets",title:"New and pre-owned phones",intro:"Shop exact handset models and check storage, grade, warranty and the price without a bundled contract.",slugs:["mozillion"]},
 {id:"broadband",title:"Mobile and home connectivity",intro:"Compare household broadband with phone services, but keep the two contract costs and service rules distinct.",slugs:["onestream","broadband-genie","broadband-mobile-coop"]}
];
export default function MobileHub(){
 return <><Header/><main className={styles.directoryPage}>
  <section className={styles.directoryHero}><div className={styles.shell}>
   <p style={{fontSize:12,fontWeight:850,textTransform:"uppercase",letterSpacing:".13em",color:"#D6EEF9"}}>AVUQO / Mobile & connectivity</p>
   <h1>Good phone. Right plan.<br/>Clearer total cost.</h1>
   <p>Explore participating mobile providers and eligible handset offers, then compare the real commitment. We won't call a plan the cheapest without current tariff, network, VAT, promotion and term evidence.</p>
   <div className={styles.strip}><Link className={styles.heroButton} href="/compare">Calculate contract costs ↗</Link><Link className={styles.heroGhost} href="/tech">Explore technology</Link><Link className={styles.heroGhost} href="/partners">All participating retailers</Link></div>
  </div></section>
  <div className={styles.shell+" "+styles.directoryMain}>
   <div className={styles.twoCols} style={{marginTop:26}}>
    <section className={styles.section}><p className={styles.kicker}>How to choose</p><h2>Use your phone, not just the headline tariff</h2>
     <p className={styles.sectionIntro}>For SIM-only plans, compare coverage at home and work, UK data and minutes, roaming, introductory price changes and any minimum term. For a handset contract, add upfront costs, all monthly payments and any price increases. A handset-only offer is never the same as a 24-month contract.</p>
     <div className={styles.strip}><Link href="/compare">Open the full-cost calculator ↗</Link><Link href="/products">Shop verified products ↗</Link></div>
    </section>
    <aside className={styles.side}><p className={styles.kicker}>Your checklist</p><h2>Compare these, not just “from £…”</h2>
     <ul><li>Network and address-level signal</li><li>Monthly data and fair-use limits</li><li>Minimum term and annual rises</li><li>Roaming and international calls</li><li>Handset grade, storage and warranty</li><li>Setup, delivery and cancellation fees</li></ul>
    </aside>
   </div>
   {groups.map(g=><section key={g.id} id={g.id} className={styles.directoryGroup}>
    <div className={styles.directoryHead}><div><p className={styles.kicker}>Mobile retail park</p><h2>{g.title}</h2><p className={styles.sectionIntro}>{g.intro}</p></div></div>
    <div className={styles.directory}>{g.slugs.map(slug=>{
     const p=PARTNERS.find(x=>x.slug===slug);if(!p)return null;
     const theme={"--accent":p.accent,"--deep":p.deep,"--glow":p.glow} as CSSProperties;
     return <Link key={slug} href={partnerHref(p)} style={theme} className={styles.directoryCard}>
      <span className={styles.emoji} aria-hidden="true">{p.symbol}</span><b>{p.name}</b><p>{p.description}</p>
      <strong>View provider details ↗</strong></Link>;
    })}</div>
   </section>)}
   <section className={styles.notice} style={{marginTop:30}}><strong>Provider listings are not live tariff rankings.</strong> Some mobile Awin sources are contract/service feeds awaiting a dedicated price-and-terms adapter. AVUQO shows approved source prices for individual handsets separately and never substitutes a sample monthly price for a confirmed postcode-specific quote. <Link href="/trust">Our comparison principles</Link>.</section>
  </div>
 </main><Footer/></>;
}
