import {connection} from "next/server";
import Link from "next/link";
import {ArrowRight, Gift, ShieldCheck, Truck, Scale, Heart} from "lucide-react";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import VerifiedProductCards from "../products/VerifiedProductCards";
import styles from "./ChristmasFestiveFinds.module.css";
const ideas=[
 {href:"/gifts",title:"Gifts worth considering",image:"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=650&q=82"},
 {href:"/toys",title:"Playful little surprises",image:"https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=650&q=82"},
 {href:"/home",title:"Cosy winter comforts",image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=650&q=82"},
 {href:"/groceries",title:"Festive food planning",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=650&q=82"},
] as const;
export default async function ChristmasFestiveFinds(){
 await connection();
 const rows=await verifiedProductIndex(60);
 const seasonal=rows.filter(({product,offers})=>{
   const hay=[product.canonical_title,...offers.map(row=>row.published.category)].join(" ").toLowerCase();
   return /\b(christmas|festive|xmas|winter gift|holiday gifting)\b/i.test(hay);
 }).slice(0,4);
 return <section className={styles.section} aria-labelledby="festive-find-heading">
  <div className="shell">
   <div className={styles.heading}>
    <div><p className={styles.eyebrow}><Gift size={16} aria-hidden="true"/> The thoughtful festive edit</p>
      <h2 id="festive-find-heading">{seasonal.length?"Verified festive finds":"Find a little festive inspiration."}</h2>
      <p>{seasonal.length?"Every displayed item has current, eligible published retailer evidence. Recheck price and delivery before you buy.":"Browse gifts and seasonal ideas while AVUQO checks which individual products can be published with reliable evidence."}</p>
    </div>
    <Link href={seasonal.length?"/products":"/christmas"}>{seasonal.length?"Explore products":"Christmas guide"} <ArrowRight size={17}/></Link>
   </div>
   {seasonal.length?<VerifiedProductCards items={seasonal}/>:
   <div className={styles.ideas}>{ideas.map(item=><Link key={item.href} href={item.href} className={styles.idea}>
      <span className={styles.photo} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/>
      <strong>{item.title}</strong><span>Explore ideas <ArrowRight size={15}/></span>
    </Link>)}</div>}
   <div className={styles.confidence}>
    <strong>Shop with confidence this Christmas</strong>
    <div><Truck size={25}/><span><b>Check delivery dates</b><small>Confirm stock and retailer cut-offs.</small></span></div>
    <div><Scale size={25}/><span><b>Know the total cost</b><small>Include any delivery or extra fees.</small></span></div>
    <div><ShieldCheck size={25}/><span><b>Find genuine value</b><small>Only verified offers are presented as deals.</small></span></div>
   </div>
   <p className={styles.note}><Heart size={14} aria-hidden="true"/> Editorial photography represents ideas, not available products or verified pricing. No illustrative review count or saving is published as fact.</p>
  </div>
 </section>;
}
