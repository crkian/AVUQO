import Link from "next/link";
import {ArrowRight} from "lucide-react";
export default function EbayUKPartnerShelf(){
 return <section className="shell" aria-labelledby="ebay-uk-partner-heading" style={{marginTop:20,marginBottom:30}}>
  <div style={{background:"linear-gradient(115deg,#f4eefb,#fffaf0)",border:"1px solid #e5dcf2",
   borderRadius:18,padding:"clamp(20px,3.5vw,34px)",display:"flex",
   flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:16}}>
   <div style={{maxWidth:680}}>
    <p style={{margin:"0 0 6px",fontWeight:700,letterSpacing:".08em",fontSize:12,color:"#6e54a4"}}>EXPLORE A PARTNER MARKETPLACE</p>
    <h2 id="ebay-uk-partner-heading" style={{margin:"0 0 8px",fontSize:"clamp(1.3rem,2.3vw,2rem)",color:"#302246"}}>
     Discover listings on eBay UK
    </h2>
    <p style={{margin:0,color:"#62586e",lineHeight:1.5}}>
     Browse sellers and current listing prices directly on eBay. These are partner search links, not AVUQO-verified product offers.
     Affiliate links may earn us a commission.
    </p>
   </div>
   <Link href="/partners/ebay-uk" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#594396",
    color:"#fff",padding:"12px 19px",borderRadius:10,fontWeight:700}}>
    Explore eBay UK <ArrowRight size={18} aria-hidden="true"/>
   </Link>
  </div>
 </section>;
}
