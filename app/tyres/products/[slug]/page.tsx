import Link from "next/link";
import {Suspense} from "react";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {connection} from "next/server";
import {ArrowLeft,ArrowRight,CheckCircle2,ShieldCheck,TriangleAlert} from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import TyreWheelVisual from "../../TyreWheelVisual";
import {verifiedProduct} from "../../../../lib/products/public-catalog";
import {chooseProductTemplate} from "../../../../lib/products/templates";
import {verifiedTyreSpec,tyreSpecLabel,comparableTyreOffers,validTyreQuantity,productUnitSubtotal} from "../../../../lib/tyres/verified-comparison";
import {tyreBrandSlug} from "../../../../lib/tyres/catalogue";
import styles from "../../tyre-comparison.module.css";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{quantity?:string}>};
const money=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value);
export async function generateMetadata({params}:Props):Promise<Metadata>{
 await connection();
 const {slug}=await params;
 const entry=await verifiedProduct(slug);
 const spec=entry&&verifiedTyreSpec(entry.product);
 if(!entry||!spec||chooseProductTemplate(entry.product,entry.offers).template!=="tyres")
  return {title:"Tyre product unavailable",robots:{index:false,follow:false}};
 return {title:entry.product.canonical_title+" | Exact tyre specification | AVUQO",
  description:"Examine authorised retailer offers for the exact "+tyreSpecLabel(spec)+" tyre model, subject to separate vehicle fitment and fitting checks.",
  alternates:{canonical:"/products/"+slug},robots:{index:false,follow:true}};
}
async function Details({slug,quantity}:{slug:string;quantity:1|2|4}){
 await connection();
 const entry=await verifiedProduct(slug);
 if(!entry||chooseProductTemplate(entry.product,entry.offers).template!=="tyres")notFound();
 const spec=verifiedTyreSpec(entry.product);
 if(!spec)notFound();
 const {product,offers}=entry;
 const priced=comparableTyreOffers(offers);
 if(!priced.length)notFound();
 const image=priced.find(o=>o.published.image_url)?.published.image_url;
 return <main className={styles.page}><Header/>
  <section className={styles.productHero}><div className={"shell "+styles.productTop}>
   <nav className={styles.breadcrumb}><Link href="/tyres"><ArrowLeft size={15}/> Tyres</Link><span>/</span>
    <Link href="/tyres/find">Exact variants</Link><span>/</span><span>{product.brand??"Tyre model"}</span></nav>
   <div className={styles.productGrid}>
    <div className={styles.productImage}>{image?<img src={image} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<TyreWheelVisual/>}
     <span>Exact-model photography only if image rights are approved</span></div>
    <div className={styles.productDetails}><p className={styles.kicker}>AVUQO VERIFIED TYRE MODEL / {product.brand??"MAKER NOT CONFIRMED"}</p>
     <h1>{product.canonical_title}</h1><p className={styles.bigSpec}>{tyreSpecLabel(spec)}</p>
     <p className={styles.intro}>{product.description??"Compare verified product specifications and eligible current source offers. Vehicle fitment needs a separate check."}</p>
     <div className={styles.specTags}><span>Load {spec.load}</span><span>Speed {spec.speed}</span>
      {spec.season&&<span>{spec.season}</span>}{spec.xl===true&&<span>XL confirmed</span>}{spec.runFlat===true&&<span>Run-flat confirmed</span>}</div>
     <p className={styles.warning}><TriangleAlert size={19}/> Tyre size and approved technical evidence do not prove fitment for your vehicle. Confirm the full OE requirements, load, speed and fitting with a qualified retailer.</p>
     <div className={styles.heroLinks}><Link href="#eligible-tyre-retailers">Compare retailer product prices <ArrowRight size={16}/></Link>
      <Link href={"/tyres/compare?left="+encodeURIComponent(product.slug)}>Compare tyre models <ArrowRight size={16}/></Link></div>
    </div>
   </div>
  </div></section>
  <section className={"shell "+styles.section} id="eligible-tyre-retailers">
   <div className={styles.sectionHeading}><div><p className={styles.kicker}>CURRENT ELIGIBLE SOURCE OFFERS</p>
    <h2>Real model. Clear price boundaries.</h2><p>Prices below are for the exact approved tyre variant. They are not installed or fully delivered quotes unless the retailer independently confirms every charge.</p></div></div>
   <form className={styles.quantity} method="get" action={"/tyres/products/"+product.slug}>
    <label>Planning quantity<select name="quantity" defaultValue={String(quantity)}>
     <option value="1">1 tyre</option><option value="2">2 tyres</option><option value="4">4 tyres</option>
    </select></label><button type="submit">Update product subtotal</button></form>
   <div className={styles.offerList}>{priced.map(x=>{
    const unit=Number(x.offer.price),subtotal=productUnitSubtotal(unit,quantity);
    return <article className={styles.offer} key={x.offer.id}>
     <div><p className={styles.kicker}>SOURCE-ELIGIBLE RETAILER</p><h3>{x.published.merchant}</h3>
      <small>Offer evidence checked {x.offer.last_seen_at?new Date(x.offer.last_seen_at).toLocaleDateString("en-GB"):"date unavailable"} · Confirm availability and the actual underlying fitter or seller at checkout</small></div>
     <div className={styles.offerCost}><strong>{money(unit)} <small>/ tyre</small></strong>
      <span>{quantity} tyre unit-price subtotal: <b>{subtotal===null?"Unavailable":money(subtotal)}</b></span>
      <small>Not the delivered or fitted total. No shipping, fitting, valves, balancing or disposal charges assumed.</small></div>
     <Link href={"/go/"+x.offer.id}>Visit eligible offer <ArrowRight size={17}/></Link>
    </article>;
   })}</div>
  </section>
  <section className={styles.guideBand}><div className={"shell "+styles.guideInner}><div>
   <p className={styles.kicker}>THE AVUQO TYRE CHECK</p><h2>What still matters before buying.</h2>
   <p>This product page has verified tyre fields, but AVUQO does not provide vehicle registration lookups, technical fitment approvals or installation bookings.</p>
  </div><ul>{["Check the handbook or door placard for size, load, speed and OE requirements.","Compare tyre label data only if verified for this exact variant.","Ask the retailer for a full fitted or delivered price for your location.","Confirm season, run-flat/XL requirements and whether both axles need matching tyres."].map(x=><li key={x}><CheckCircle2 size={19}/>{x}</li>)}</ul></div></section>
  <section className={"shell "+styles.disclosure}><ShieldCheck size={16}/> Affiliate income never changes independent matching or retailer price order. Only current rights-cleared offers appear, and editorial brand references do not establish manufacturer endorsement. <Link href="/editorial-policy">Review methodology</Link>.</section>
  <Footer/></main>;
}
export default async function Page({params,searchParams}:Props){
 const {slug}=await params,query=await searchParams;
 return <Suspense fallback={<main><Header/><p className="shell section">Checking exact tyre evidence…</p></main>}>
  <Details slug={slug} quantity={validTyreQuantity(query.quantity)}/></Suspense>;
}
