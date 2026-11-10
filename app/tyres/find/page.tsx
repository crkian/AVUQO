import Link from "next/link";
import {Suspense} from "react";
import type {Metadata} from "next";
import {connection} from "next/server";
import {ArrowRight,CheckCircle2,Search,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import TyreWheelVisual from "../TyreWheelVisual";
import {verifiedProductIndex} from "../../../lib/products/public-catalog";
import {eligibleTyreProducts,matchTyreSize,parseTyreSize,tyreSpecLabel,comparableTyreOffers} from "../../../lib/tyres/verified-comparison";
import styles from "../tyre-comparison.module.css";
type Query={width?:string;profile?:string;rim?:string};
export const metadata:Metadata={
 title:"Find exact tyre variants | AVUQO",
 description:"Search approved tyre product variants by size and compare only current authorised product offers. Fitment must be confirmed separately.",
 alternates:{canonical:"/tyres/find"},
 robots:{index:false,follow:true}
};
const widths=[155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305];
const profiles=[30,35,40,45,50,55,60,65,70,75,80];
const rims=[13,14,15,16,17,18,19,20,21,22];
const money=(v:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(v);
async function Results({query}:{query:Query}){
 await connection();
 const size=parseTyreSize(query);
 const ready=eligibleTyreProducts(await verifiedProductIndex(120)).filter(x=>matchTyreSize(x.spec,size));
 const hasInput=!!(query.width||query.profile||query.rim);
 const invalid=hasInput&&!size;
 return <section className={"shell "+styles.section} id="verified-tyres" aria-labelledby="tyre-result-title">
  <div className={styles.sectionHeading}><div><p className={styles.kicker}>VERIFIED PRODUCT ADMISSION</p>
   <h2 id="tyre-result-title">{size?"Exact size: "+size.width+"/"+size.profile+" R"+size.rim:"Product variants, when approved."}</h2>
   <p>{invalid?"Please enter all three valid tyre dimensions. A partial size cannot establish a product match.":
    ready.length?"Each product below has separate approved technical fields and current, eligible offers. Vehicle fitment and fitted quotes remain separate checks.":
    "There are no fully verified tyre variants matching this search yet. The private supplier feeds are not live retail inventory."}</p></div>
   <span className={styles.count}><ShieldCheck size={16}/>{invalid?0:ready.length} eligible variants</span></div>
  {invalid||!ready.length?<div className={styles.empty}><ShieldCheck size={32}/><h3>Precision before a price.</h3>
   <p>We will not use unverified load or speed ratings, historical feed rows or estimated fitting totals to create a tyre offer. The showroom is ready to accept approved products when every check passes.</p>
   <Link href="/tyres/sizes">Understand my tyre size <ArrowRight size={17}/></Link>
  </div>:
  <div className={styles.resultGrid}>{ready.map(({product,spec,offers})=>{
   const priced=comparableTyreOffers(offers);
   const photo=priced.find(o=>o.published.image_url)?.published.image_url;
   return <article key={product.id} className={styles.result}>
    <div className={styles.art}>{photo?<img src={photo} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<TyreWheelVisual small/>}</div>
    <div className={styles.resultBody}><p className={styles.kicker}>{product.brand??"Tyre model"}</p>
     <h3>{product.canonical_title}</h3><span className={styles.spec}>{tyreSpecLabel(spec)}</span>
     <p className={styles.details}>Load {spec.load} · Speed {spec.speed} · {spec.season??"Season not separately recorded"}</p>
     <p className={styles.pricing}>{priced.length?"From "+money(Number(priced[0].offer.price))+" per tyre":"Eligible pricing unavailable"}</p>
     <small>Product price only. Delivery, fitting, balancing and disposal not included unless verified.</small>
     <div className={styles.buttons}><Link href={"/tyres/products/"+product.slug}>View exact tyre <ArrowRight size={16}/></Link>
      <Link href={"/tyres/compare?left="+encodeURIComponent(product.slug)}>Compare models</Link></div>
    </div>
   </article>;
  })}</div>}
 </section>;
}
export default async function Page({searchParams}:{searchParams:Promise<Query>}){
 const q=await searchParams;
 return <main className={styles.page}><Header/>
  <section className={styles.hero}><div className={"shell "+styles.heroInner}>
   <div><p className={styles.kicker}>AVUQO TYRES / EXACT PRODUCT FINDER</p>
    <h1>Find the tyre.<br/><em>Know the specification.</em></h1>
    <p>A premium tyre showroom built for real model variants. Select the required dimensions to see only products with separately approved load and speed evidence.</p>
    <div className={styles.heroLinks}><Link href="/tyres">Tyre showroom <ArrowRight size={16}/></Link>
     <Link href="/tyres/brands">All tyre brands <ArrowRight size={16}/></Link></div>
   </div><div className={styles.wheel}><TyreWheelVisual small/></div>
  </div></section>
  <section className={"shell "+styles.finder}>
   <form action="/tyres/find" method="get" aria-label="Search verified tyre sizes">
    <label>Width <small>mm</small><select name="width" defaultValue={q.width??""}><option value="">All widths</option>{widths.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    <label>Profile <small>%</small><select name="profile" defaultValue={q.profile??""}><option value="">All profiles</option>{profiles.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    <label>Rim <small>inches</small><select name="rim" defaultValue={q.rim??""}><option value="">All rims</option>{rims.map(x=><option key={x} value={x}>R{x}</option>)}</select></label>
    <button type="submit"><Search size={17}/> Find eligible tyres</button>
   </form><p><ShieldCheck size={15}/> A matching size is not a vehicle-fitment approval. Check the placard/handbook plus load and speed requirements.</p>
  </section>
  <Suspense fallback={<p className="shell section">Checking approved tyre products…</p>}><Results query={q}/></Suspense>
  <section className={styles.trust}><div className={"shell "+styles.trustGrid}>
   {["Exact product, not a guessed fit","Verified load and speed requirements","Real price evidence, no invented fitting quotes"].map(text=><div key={text}><CheckCircle2 size={22}/>{text}</div>)}
  </div></section><Footer/>
 </main>;
}
