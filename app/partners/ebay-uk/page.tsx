import type {Metadata} from "next";
import Link from "next/link";
import {ArrowUpRight,Search,ShieldCheck,Info} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {EBAY_UK_SEARCHES,ebayUkEpnHref} from "../../../lib/ebay/epn-uk-links";

export const metadata:Metadata={
 title:"Explore eBay UK listings | AVUQO",
 description:"Search eBay UK from AVUQO's tracked partner links. Verify prices, postage, seller, condition and availability at eBay."
};
export default function EbayUKPartnerPage(){
 return <>
  <Header/>
  <main style={{background:"linear-gradient(160deg,#f9f6ff 0%,#fcfaf5 65%,#fff 100%)",minHeight:"68vh"}}>
   <div style={{maxWidth:1130,margin:"0 auto",padding:"32px 20px 70px"}}>
    <nav aria-label="Breadcrumb" style={{marginBottom:26,fontSize:14}}><Link href="/">AVUQO</Link> / eBay UK</nav>
    <p style={{fontSize:13,textTransform:"uppercase",letterSpacing:".14em",fontWeight:700,color:"#6f58a0"}}>Partner discovery · United Kingdom</p>
    <h1 style={{fontSize:"clamp(2.2rem,4vw,3.5rem)",color:"#251b43",lineHeight:1.1,maxWidth:780,margin:"14px 0"}}>
     Explore live listings on eBay UK
    </h1>
    <p style={{fontSize:18,color:"#524c62",maxWidth:760,lineHeight:1.6}}>
     Choose a category and continue to eBay to view current listings directly.
     We do not import, rank or quote individual eBay product prices on this page.
    </p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"24px 0 36px"}}>
     <a href={ebayUkEpnHref("all")} target="_blank" rel="sponsored noopener noreferrer"
      style={{background:"#574096",color:"#fff",borderRadius:11,padding:"13px 20px",display:"inline-flex",alignItems:"center",gap:10,fontWeight:700}}>
      Browse all eBay UK <ArrowUpRight size={18} aria-hidden="true"/>
     </a>
     <Link href="/marketplace/compare" style={{border:"1px solid #d5cde7",borderRadius:11,padding:"13px 18px",color:"#413361",fontWeight:600}}>
      Browse AVUQO comparisons
     </Link>
    </div>
    <h2 style={{fontSize:24,color:"#2d224e",marginBottom:16}}>Choose what to explore</h2>
    <section aria-label="eBay UK categories" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
     {EBAY_UK_SEARCHES.map(({id,label})=>
      <article key={id} style={{padding:23,background:"#fff",border:"1px solid #e5e0ef",borderRadius:15,boxShadow:"0 6px 26px #30204f08"}}>
       <Search size={23} color="#7155b7" aria-hidden="true"/>
       <h3 style={{fontSize:18,color:"#31234e",margin:"13px 0 9px"}}>{label}</h3>
       <p style={{color:"#655e70",fontSize:14,lineHeight:1.5,margin:"0 0 17px"}}>See sellers, conditions and current listed prices on eBay.</p>
       <a href={ebayUkEpnHref(id)} target="_blank" rel="sponsored noopener noreferrer"
        style={{display:"inline-flex",alignItems:"center",gap:5,color:"#584094",fontWeight:700}}>
        Search on eBay <ArrowUpRight size={16} aria-hidden="true"/>
       </a>
      </article>
     )}
    </section>
    <section style={{marginTop:34,padding:23,background:"#fff",borderRadius:14,border:"1px solid #e5e0ef",display:"grid",gap:12}}>
     <div style={{display:"flex",alignItems:"center",gap:9,color:"#332450"}}><ShieldCheck size={22}/><strong>Know what you&apos;re comparing</strong></div>
     <p style={{margin:0,color:"#5d5867",lineHeight:1.65}}>
      Listings, sellers, prices, condition, delivery costs, stock and returns are supplied by eBay or the seller and may change.
      Verify details on eBay before purchasing. These are outbound partner searches, <strong>not verified AVUQO price comparisons or ranked product offers</strong>.
     </p>
     <div style={{display:"flex",alignItems:"center",gap:9,color:"#514a5e",fontSize:14}}>
      <Info size={19} aria-hidden="true"/>
      <span>These are affiliate links. AVUQO may earn a commission when you buy, at no extra cost to you. <Link href="/affiliate-disclosure" style={{textDecoration:"underline"}}>Affiliate disclosure</Link>.</span>
     </div>
    </section>
   </div>
  </main>
  <Footer/>
 </>;
}
