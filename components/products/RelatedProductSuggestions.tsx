import Link from "next/link";
import {ArrowRight, Package} from "lucide-react";
import type {PublicProduct,PublicOffer} from "../../lib/products/public-catalog";

export type RelatedEntry={product:PublicProduct;offers:PublicOffer[]};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
function Tile({item}:{item:RelatedEntry}){
 const best=[...item.offers].sort((a,b)=>Number(a.offer.total_price??a.offer.price)-Number(b.offer.total_price??b.offer.price))[0];
 if(!best)return null;
 const photo=item.offers.find(x=>x.published.image_url)?.published.image_url;
 return <article style={{border:"1px solid #e7dce9",borderRadius:15,overflow:"hidden",background:"#fff",minWidth:0}}>
  <Link href={`/products/${item.product.slug}`} style={{display:"flex",flexDirection:"column",gap:8,padding:12,color:"inherit",textDecoration:"none",height:"100%"}}>
   <div style={{display:"grid",placeItems:"center",background:"#f9f6fb",borderRadius:10,height:140}}>
    {photo?<img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" style={{height:130,maxWidth:"100%",objectFit:"contain"}}/>:
     <Package size={35} aria-hidden="true"/>}
   </div>
   <small style={{color:"#68517b"}}>{best.published.category}</small>
   <strong style={{fontSize:14,lineHeight:1.4}}>{item.product.canonical_title}</strong>
   <span style={{marginTop:"auto",fontWeight:800}}>From {money(Number(best.offer.total_price??best.offer.price))}</span>
   <small style={{color:"#716977"}}>Checked retailer offer · price may change</small>
   <span style={{color:"#6735a1",display:"inline-flex",alignItems:"center",gap:5,fontWeight:750,fontSize:13}}>View product <ArrowRight size={15}/></span>
  </Link>
 </article>;
}
export default function RelatedProductSuggestions({similar,discover}:{similar:RelatedEntry[];discover:RelatedEntry[]}){
 if(!similar.length&&!discover.length)return null;
 return <section className="shell" aria-label="More products to discover" style={{paddingBlock:32}}>
  {similar.length>0&&<div style={{marginBottom:32}}>
   <h2 style={{fontSize:"clamp(22px,3vw,30px)",marginBottom:6}}>Similar items worth comparing</h2>
   <p style={{color:"#62596a",marginBottom:18}}>Other eligible products in this category. Check exact models and specifications before comparing.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,185px),1fr))",gap:12}}>
    {similar.map(item=><Tile key={item.product.id} item={item}/>)}
   </div>
  </div>}
  {discover.length>0&&<div>
   <h2 style={{fontSize:"clamp(22px,3vw,30px)",marginBottom:6}}>Have you seen these?</h2>
   <p style={{color:"#62596a",marginBottom:18}}>Discover other independently eligible finds from across AVUQO.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,185px),1fr))",gap:12}}>
    {discover.map(item=><Tile key={item.product.id} item={item}/>)}
   </div>
  </div>}
 </section>;
}
