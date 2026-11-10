import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import styles from "../control-centre.module.css";
export const instant=false;
export const metadata:Metadata={title:"AVUQO visual system | Control Centre",robots:{index:false,follow:false}};
const palette=[
 ["Warm canvas","#FAF8F3"],["Cream","#F7F3EC"],["Deep navy","#17142B"],
 ["Violet","#5B35F5"],["Indigo","#3A20BD"],["Soft rose","#F9E8EF"],["Success","#087B5B"]
];
const refs=[
 {title:"Seasonal showroom",copy:"Christmas, Black Friday, Valentine's, Easter and Sales all use one warm photographic system.",href:"/control-centre/seasonal"},
 {title:"Category & marketplace",copy:"25 editorial departments with violet controls, useful category photography and consistent global navigation.",href:"/control-centre/marketplace"},
 {title:"My AVUQO",copy:"Account overview, Saved, Watches, Lists, preferences and planning. User counts must come from actual scoped records.",href:"/account"},
 {title:"Source and product trust",copy:"Real product, photo, retailer, score, price and availability evidence must pass approval checks before public use.",href:"/control-centre/source-atlas"},
 {title:"Self-advertising",copy:"Private advertiser onboarding and campaign approvals are separate from organic rankings and existing retailer partners.",href:"/control-centre/site-advertising"},
 {title:"Marketing automation",copy:"Creative, social promotion and affiliate campaign workflows use separate permission, compliance and owner controls.",href:"/control-centre/marketing"}
];
const cell={border:"1px solid #e9e1eb",background:"#fff",borderRadius:18,padding:22} as const;
export default async function DesignSystemAdmin(){
 await connection();await requireControlCentreAccess();
 return <>
  <div className={styles.pageHead}><div><p className={styles.eyebrow}>Original AVUQO identity / 10 November 2026</p>
   <h1>Warm Premium Design System</h1>
   <p className={styles.sub}>The visual direction is fixed across the whole platform. Category photography and seasonal moods can change, but the AVUQO brand, spacing, navigation, product evidence and human-friendly design remain consistent.</p>
  </div></div>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Visual palette</h2><span>From the original design branch</span></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",gap:10}}>
    {palette.map(([name,color])=><div key={name} style={{...cell,padding:10}}>
     <div style={{height:66,borderRadius:11,background:color,border:"1px solid #e7e0e7"}}/>
     <p style={{fontWeight:850,fontSize:12,margin:"12px 3px 4px"}}>{name}</p>
     <code style={{fontSize:11,marginLeft:3,color:"#716d80"}}>{color}</code>
    </div>)}
   </div>
   <p style={{fontSize:13,lineHeight:1.7,color:"#786c7d"}}>Warm ivory is the main canvas; navy/violet are the AVUQO identity. Tyres may adopt a dark-plum performance variation. Black Friday, Christmas, Easter and Valentine&apos;s change the hero photography and supporting accents, not the brand structure.</p>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Original design references</h2><span>Repository documentation, not live-price data</span></div>
   <p><strong>Canonical style:</strong> <code>docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md</code></p>
   <p><strong>Page blueprints:</strong> <code>docs/design/AVUQO_PAGE_BLUEPRINTS_AND_DESIGN_COVERAGE_2026-11-05.md</code></p>
   <p><strong>Ten screenshot index:</strong> <code>docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md</code></p>
   <p><strong>Source/branch handover:</strong> <code>docs/AVUQO_PROJECT_COMPASS.md</code> and root <code>AGENTS.md</code>.</p>
   <p style={{color:"#786c7d",fontSize:13,lineHeight:1.7}}>These files specify the original seasonal, homepage, Beauty, Home, Lists, Watches, Product and My AVUQO designs. Product prices and AVUQO Scores visible in example screenshots are not actual verified AVUQO offers.</p>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>All visual and operational journeys</h2><span>Use the existing workspaces</span></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:13}}>
    {refs.map(item=><article key={item.title} style={cell}>
     <h3 style={{margin:"0 0 10px",fontSize:18}}>{item.title}</h3>
     <p style={{fontSize:13,color:"#746b79",lineHeight:1.7,minHeight:86}}>{item.copy}</p>
     <Link href={item.href} style={{fontWeight:850,fontSize:13,color:"#5b35f5"}}>Open destination →</Link>
    </article>)}
   </div>
  </section>
  <div className={styles.callout}>This is a read-only design register. It does not activate adverts, import feeds, issue social posts, approve images or publish products. Any design release must pass mobile and desktop review, CI, access checks, source permissions and documented production acceptance.</div>
 </>;
}
