import Link from "next/link";
import {connection} from "next/server";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {editorialSpotlight,SEASONAL_DESTINATIONS} from "../../../lib/editorial/seasonal-schedule";
import styles from "../control-centre.module.css";
export const instant=false;
export default async function SeasonalAdmin(){
 await connection();await requireControlCentreAccess();
 const current=editorialSpotlight(new Date());
 return <>
  <div className={styles.pageHead}><div><p className={styles.eyebrow}>AVUQO warm-premium campaigns / 2026–2027</p>
   <h1>Seasonal design &amp; operations</h1>
   <p className={styles.sub}>One photo-led design for Christmas, Black Friday, Valentine&apos;s Day, Easter and evergreen sales. Editorial homepage features rotate by UK calendar; product prices, affiliate promotions and paid placements follow separate approval gates.</p>
  </div></div>
  <section className={styles.panel}>
   <div className={styles.panelHead}><h2>Automatic editorial spotlight</h2><span>Read-only · UK calendar · No public offer changes</span></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,270px),1fr))",gap:18,alignItems:"stretch"}}>
    <div style={{padding:25,borderRadius:19,background:"linear-gradient(120deg,#251630,#613f83)",color:"#fff"}}>
     <p style={{fontSize:11,letterSpacing:1.6,color:"#efd0e8",margin:"0 0 10px"}}>CURRENT HOMEPAGE EDITORIAL</p>
     <h3 style={{fontSize:27,margin:"0 0 13px"}}>{current?.title??"Evergreen AVUQO shopping"}</h3>
     <p style={{fontSize:13,lineHeight:1.75,color:"#e9dce9"}}>{current?.summary??"No seasonal highlight is scheduled today. The normal AVUQO homepage remains available."}</p>
     <Link href={current?.href??"/"} style={{fontSize:13,fontWeight:850,color:"#fff",textDecoration:"underline"}}>Open current customer destination →</Link>
    </div>
    <div style={{padding:25,borderRadius:19,background:"#fff8f3",border:"1px solid #e7dce3"}}>
     <p style={{fontSize:11,letterSpacing:1.4,color:"#79577f",margin:"0 0 10px"}}>COMMERCE &amp; ADVERTISING FIREWALL</p>
     <h3 style={{fontSize:23,margin:"0 0 12px",color:"#281e33"}}>Editorial does not equal an offer.</h3>
     <p style={{fontSize:13,lineHeight:1.75,color:"#726674"}}>The calendar only selects an editorial image, title and internal link. It does not create products, apply discounts, accept advertiser bookings, post social content or enable affiliate promotions.</p>
     <p><Link href="/control-centre/marketing">Marketing approvals →</Link></p>
     <p><Link href="/control-centre/site-advertising">Direct advertiser approvals →</Link></p>
    </div>
   </div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Seasonal website destinations</h2><span>Page access is separate from retailer permissions</span></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,235px),1fr))",gap:13}}>
    {SEASONAL_DESTINATIONS.map(x=><article key={x.href} style={{padding:21,background:"#fffaf7",border:"1px solid #e6dce7",borderRadius:17}}>
     <h3 style={{fontSize:18,margin:"0 0 8px"}}>{x.name}</h3>
     <p style={{fontSize:12,color:"#795d81",fontWeight:800}}>{x.window}</p>
     <p style={{fontSize:12,lineHeight:1.65,color:"#6f626f",minHeight:50}}>{x.commercial}</p>
     <Link href={x.href}>Open warm-premium page →</Link>
    </article>)}
   </div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Design, campaigns and source readiness</h2></div>
   <p>The visual baseline is indexed in <code>docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md</code>. The original seasonal mockups are references, not approved prices, scores or retailer imagery.</p>
   <p><Link href="/control-centre/source-atlas">All source statuses</Link> · <Link href="/control-centre/feed-imports">Private feed reviews</Link> · <Link href="/control-centre/content">Website content</Link> · <Link href="/control-centre/release-readiness">Release readiness</Link></p>
   <div className={styles.callout}>Automatic editorial content is active when its seasonal date window applies. Automatic ad booking, social publishing and product offer release are **not** implied. Every paid campaign, source image and merchant offer still needs evidence and explicit owner review.</div>
  </section>
 </>;
}
