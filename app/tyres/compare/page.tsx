import Link from "next/link";
import {Suspense} from "react";
import {connection} from "next/server";
import type {Metadata} from "next";
import {ArrowRight,CheckCircle2,ShieldCheck,Scale} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import TyreWheelVisual from "../TyreWheelVisual";
import {verifiedProductIndex} from "../../../lib/products/public-catalog";
import {eligibleTyreProducts,tyreSpecLabel,comparableTyreOffers,type TyreResult} from "../../../lib/tyres/verified-comparison";
import styles from "../tyre-comparison.module.css";
type Query={left?:string;right?:string};
export const instant=false;
export const metadata:Metadata={title:"Compare verified tyres | AVUQO",description:"Compare exact approved tyre variants by technical specification and verified unit product prices. Full fitted quotes require separate evidence.",alternates:{canonical:"/tyres/compare"},robots:{index:false,follow:true}};
const price=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
function cell(row:TyreResult|null,field:keyof TyreResult["spec"]){
 const v=row?.spec[field];
 return v==null?"Not confirmed":typeof v==="boolean"?(v?"Yes":"No"):String(v);
}
function unitCost(row:TyreResult|null):string{
 if(!row)return "No tyre selected";
 const priced=comparableTyreOffers(row.offers);
 return priced.length?price(Number(priced[0].offer.price))+" per tyre":"Eligible quote unavailable";
}
async function Compare({query}:{query:Query}){
 await connection();
 const tyres=eligibleTyreProducts(await verifiedProductIndex(120));
 const left=tyres.find(x=>x.product.slug===query.left)??null;
 const right=tyres.find(x=>x.product.slug===query.right)??null;
 const selectList=tyres.map(t=>({value:t.product.slug,label:t.product.canonical_title+" · "+tyreSpecLabel(t.spec)}));
 return <>
  <section className={"shell "+styles.section}>
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>MODEL TO MODEL / VERIFIED VARIANTS</p>
    <h2>Choose two exact tyre specifications.</h2><p>We only compare models after their technical fields and retailer source admission pass separate checks. No match is implied for your vehicle.</p></div></div>
   <form action="/tyres/compare" method="get" className={styles.selector}>
    <label>First tyre<select name="left" defaultValue={left?.product.slug??""}><option value="">Choose an approved variant</option>{selectList.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
    <label>Second tyre<select name="right" defaultValue={right?.product.slug??""}><option value="">Choose an approved variant</option>{selectList.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
    <button type="submit">Compare exact tyres <Scale size={18}/></button>
   </form>
   {tyres.length<2?<div className={styles.empty}><ShieldCheck size={32}/><h3>Waiting for two verified tyre variants.</h3>
    <p>No product comparison will be invented from private feed records. This interface is ready for approved multi-brand catalogue entries with complete source evidence, load and speed ratings.</p>
    <Link href="/tyres/find">Explore tyre finder <ArrowRight size={17}/></Link></div>:
    left&&right&&left.product.id!==right.product.id?<div className={styles.compareWrap}>
     <div className={styles.compareGrid}>
      <div className={styles.labelCol}><b>Model</b><b>Exact size</b><b>Load index</b><b>Speed rating</b><b>Season</b><b>Run-flat</b><b>Reinforced (XL)</b><b>Lowest eligible unit price</b><b>Fitting included</b></div>
      {[left,right].map(x=><article className={styles.comparison} key={x.product.id}>
       <h3>{x.product.canonical_title}</h3>
       <div>{tyreSpecLabel(x.spec)}</div><div>{cell(x,"load")}</div><div>{cell(x,"speed")}</div>
       <div>{cell(x,"season")}</div><div>{cell(x,"runFlat")}</div><div>{cell(x,"xl")}</div>
       <div>{unitCost(x)}</div><div>Not independently confirmed</div>
       <Link href={"/tyres/products/"+x.product.slug}>Open exact tyre and retailer evidence <ArrowRight size={15}/></Link>
      </article>)}
     </div>
     <p className={styles.warning}><ShieldCheck size={16}/> These are technical comparisons, not vehicle-fitment approval. Retailer prices may have different delivery and installation inclusions, so a lower unit price is not necessarily the lower fitted total.</p>
    </div>:
    <div className={styles.empty}><Scale size={31}/><h3>Select two different tyres.</h3><p>Choose two separately approved exact variants to review the specification differences.</p></div>}
  </section>
 </>;
}
export default async function Page({searchParams}:{searchParams:Promise<Query>}){
 const query=await searchParams;
 return <main className={styles.page}><Header/>
  <section className={styles.hero}><div className={"shell "+styles.heroInner}>
   <div><p className={styles.kicker}>AVUQO TYRES / INDEPENDENT PRODUCT COMPARISON</p>
    <h1>Side by side.<br/><em>Every detail matters.</em></h1>
    <p>Compare verified models across dimensions, ratings and real source offers without confusing product specifications with a fitted installation quote.</p>
    <div className={styles.heroLinks}><Link href="/tyres">The showroom <ArrowRight size={16}/></Link><Link href="/tyres/find">Find exact tyres <ArrowRight size={16}/></Link></div>
   </div><div className={styles.wheel}><TyreWheelVisual small/></div>
  </div></section>
  <Suspense fallback={<p className="shell section">Checking approved tyre variants…</p>}><Compare query={query}/></Suspense>
  <section className={styles.trust}><div className={"shell "+styles.trustGrid}>
   {["No affiliate-weighted ranking","Compare identical conditions only","Always verify vehicle fitment"].map(text=><div key={text}><CheckCircle2 size={22}/>{text}</div>)}
  </div></section><Footer/>
 </main>;
}
