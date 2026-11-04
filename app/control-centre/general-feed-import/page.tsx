import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import GeneralAwinImport from "./GeneralFeedImport";
export const instant=false;
export const metadata:Metadata={title:"General Awin feed import | AVUQO",robots:{index:false,follow:false}};
export default async function Page(){
 await connection();await requireControlCentreAccess();
 return <main style={{display:"grid",gap:20,maxWidth:1130,padding:"20px 0 90px"}}>
  <nav style={{fontSize:12}}><Link href="/control-centre/awin-programmes">← All 16 Awin programmes</Link></nav>
  <header style={{display:"grid",gap:11}}>
   <p style={{margin:0,fontSize:12,color:"#7c5e8f",letterSpacing:1.2,fontWeight:850}}>OWNER-ONLY · RESUMABLE SOURCE IMPORT</p>
   <h1 style={{fontSize:"clamp(30px,4vw,48px)",letterSpacing:"-.045em",margin:0}}>Import larger Awin feeds safely.</h1>
   <p style={{fontSize:14,lineHeight:1.7,color:"#706773",maxWidth:850,margin:0}}>Use this for any verified joined Awin advertiser, including tyres, mobile, tools, gifts and relevant service feeds. Every record stays in private review. Never combine separate overlapping feeds in a single import.</p>
  </header>
  <GeneralAwinImport/>
  <section style={{display:"grid",gap:8,padding:20,background:"#f6f1ed",border:"1px solid #e7dedf",borderRadius:17}}>
   <h2 style={{fontSize:21,margin:0}}>Different feed formats need different treatment</h2>
   <p style={{fontSize:13,lineHeight:1.7,margin:0}}>Standard Awin records require advertiser and product identifiers, a product title, price and currency. Google-retail records require advertiser_id, id, title, price with currency, availability and an Awin tracking field. An unknown layout, XML, missing merchant identity, invalid product IDs or a mixed-advertiser file is rejected. Separate service/contract schemas and promotion/stock verification are still required before any customer-facing publication.</p>
   <p style={{fontSize:13,lineHeight:1.7,margin:0}}>The Tooled-Up importer remains available for its verified full-range feed. Its 84,284 imported records will not be re-imported automatically here.</p>
   <div style={{display:"flex",flexWrap:"wrap",gap:14}}><Link href="/control-centre/feed-list-audit">Audit the actual feed inventory</Link><Link href="/control-centre/large-feed-import">Existing Tooled-Up importer</Link></div>
  </section>
 </main>;
}
