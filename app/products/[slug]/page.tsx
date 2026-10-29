import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {verifiedProduct} from "../../../lib/products/public-catalog";
import {chooseProductTemplate,validatedSpecificationEntries} from "../../../lib/products/templates";
import styles from "./page.module.css";
type Props={params:Promise<{slug:string}>};
const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export async function generateMetadata({params}:Props):Promise<Metadata>{
 await connection();
 const {slug}=await params;const record=await verifiedProduct(slug);
 if(!record)return {title:"Product unavailable",robots:{index:false,follow:false}};
 return {title:record.product.canonical_title,description:`Understand price and seller evidence for ${record.product.canonical_title} on AVUQO. Check each current retailer offer.`,alternates:{canonical:`/products/${slug}`},robots:{index:true,follow:true}};
}
async function ProductDetails({params}:Props){
 await connection();
 const {slug}=await params;
 const entry=await verifiedProduct(slug);
 if(!entry)notFound();
 const {product,offers}=entry;
 const best=[...offers].sort((a,b)=>Number(a.offer.total_price??a.offer.price)-Number(b.offer.total_price??b.offer.price))[0];
 const presentation=chooseProductTemplate(product,offers);
 const specs=validatedSpecificationEntries(product.specifications,presentation.specPriority);
 const photo=best.published.image_url;
 return <div className={`${styles.productPage} ${styles[presentation.template]}`}><section className={styles.hero}><div className="shell"><Link className={styles.back} href="/products"><ArrowLeft size={17}/> All products</Link><div className={`${styles.heroGrid} ${presentation.imageShape==="wide"?styles.wideImage:presentation.imageShape==="portrait"?styles.portraitImage:""}`}>
 <div className={styles.art}>{photo?<img src={photo} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<div className={styles.placeholder}><span>Q</span><small>Verified image not available</small></div>}</div>
 <div className={styles.copy}><p className={styles.kicker}>{presentation.eyebrow}</p><h1>{product.canonical_title}</h1>{(product.brand||product.model)&&<p className={styles.variant}>{product.brand&&<span>{product.brand}</span>}{product.model&&<span>{product.model}</span>}</p>}
 <p className={styles.intro}>{product.description||"Compare eligible retailer offers and understand what the price evidence can, and cannot, show."}</p>
 <div className={styles.topPrice}><span>Lowest eligible observed offer</span><strong>{gbp(Number(best.offer.total_price??best.offer.price))}</strong><small>From {best.published.merchant}. Check current price, delivery, stock and terms before buying.</small></div>
 <Link className={styles.action} href="#retailers">Compare retailers <ArrowRight size={18}/></Link><p className={styles.assurance}><ShieldCheck size={17}/> Verified-source display only. Independent of affiliate payout.</p></div>
 </div></div></section>
 <section className={`shell ${styles.templateSection}`} aria-label="Product-specific guidance">
  <div className={styles.templateHeading}><p className={styles.kicker}>Designed for this kind of purchase</p><h2>{presentation.sectionHeading}</h2><p>{presentation.sectionIntro}</p></div>
  <div className={styles.templateGrid}>
   {presentation.template==="tech"&&specs.length>0?<div className={styles.highlightSpecs}><p className={styles.kicker}>At a glance</p><h3>Technical details</h3><dl>{specs.slice(0,5).map(([key,val])=><div key={key}><dt>{key.replaceAll("_"," ")}</dt><dd>{val}</dd></div>)}</dl></div>:
    presentation.template==="grocery"&&specs.length>0?<div className={styles.highlightSpecs}><p className={styles.kicker}>Pack check</p><h3>What's in the basket?</h3><dl>{specs.slice(0,5).map(([key,val])=><div key={key}><dt>{key.replaceAll("_"," ")}</dt><dd>{val}</dd></div>)}</dl></div>:
    presentation.template==="travel"?<div className={styles.travelPanel}><p className={styles.kicker}>Travel changes with the dates</p><h3>Check the trip, not just the price.</h3><p>Availability and inclusion details need to match the exact dates and travellers before you book.</p><Link href="/travel">Explore travel guidance <ArrowRight size={17}/></Link></div>:
    presentation.template==="beauty"?<div className={styles.carePanel}><p className={styles.kicker}>The finer details</p><h3>Ingredients and suitability matter.</h3><p>Use the retailer's complete product label and care advice, especially when formulations or sizes vary.</p></div>:
    presentation.template==="home"?<div className={styles.homePanel}><p className={styles.kicker}>Made for your space</p><h3>Measure twice, choose once.</h3><p>Fit, care, delivery and everyday use often matter longer than a temporary price reduction.</p></div>:
    presentation.template==="motoring"?<div className={styles.motorPanel}><p className={styles.kicker}>Ownership matters</p><h3>Plan the full running cost.</h3><p>Fuel, charging, maintenance and insurance are separate from the purchase price.</p><Link href="/motoring">Explore motoring <ArrowRight size={17}/></Link></div>:
    presentation.template==="fashion"?<div className={styles.fashionPanel}><p className={styles.kicker}>Find your fit</p><h3>Wear it your way.</h3><p>Colour, fit, material and care details deserve space alongside the price.</p></div>:
    presentation.template==="gifts"?<div className={styles.giftsPanel}><p className={styles.kicker}>Make it meaningful</p><h3>Who are you choosing for?</h3><p>Think about the person, the occasion and whether the product can arrive when needed.</p></div>:
    presentation.template==="pets"?<div className={styles.petsPanel}><p className={styles.kicker}>The little family members</p><h3>Fit their needs first.</h3><p>Choose by species, age, size and the specific instructions supplied for the product.</p></div>:
    <div className={styles.generalPanel}><p className={styles.kicker}>Take a closer look</p><h3>What comes with it?</h3><p>Confirm the exact variant, included accessories and the retailer's terms before buying.</p></div>}
   <div className={styles.checkList}><h3>{presentation.practicalTitle}</h3><ul>{presentation.practicalPoints.map(point=><li key={point}><CheckCircle2 size={19}/><span>{point}</span></li>)}</ul></div>
  </div>
 </section>
 <section className={`shell ${styles.section}`} id="retailers"><div className={styles.heading}><p className={styles.kicker}>Worth comparing</p><h2>Retailer offers for this exact product.</h2><p>Only eligible, recently checked offers are shown. A lower headline price may have extra delivery costs.</p></div>
 <div className={styles.offerList}>{offers.map(x=><article key={x.offer.id} className={styles.offerCard}><div><h3>{x.published.merchant}</h3><p>Last checked {new Date(x.offer.last_seen_at!).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} · {x.offer.stock_status==="in_stock"?"Availability reported": "Confirm availability with retailer"}</p></div><div className={styles.offerPrice}><strong>{gbp(Number(x.offer.total_price??x.offer.price))}</strong><span>{x.offer.total_price!==null?"Total reported offer cost":"Product price; delivery may be extra"}</span></div><Link href={`/go/${x.offer.id}`} className={styles.retailer}>Visit retailer <ArrowRight size={16}/></Link></article>)}</div>
 </section>
 <section className={styles.infoBand}><div className={`shell ${styles.infoGrid}`}><article><ShieldCheck size={27}/><h3>Evidence before claims</h3><p>Merchant eligibility and source permissions are checked before an offer is displayed.</p></article><article><Clock3 size={27}/><h3>Freshness matters</h3><p>Stale and expired offers are excluded from this product comparison.</p></article><article><CheckCircle2 size={27}/><h3>Independent ranking</h3><p>Offers are ordered by displayed comparable costs, not affiliate commission.</p></article></div></section>
 {specs.length>0&&<section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>The details</p><h2>{presentation.groupHeading}</h2></div><dl className={styles.specs}>{specs.map(([k,v])=><div key={k}><dt>{k.replaceAll("_"," ")}</dt><dd>{String(v)}</dd></div>)}</dl></section>}
 <section className={`shell ${styles.disclaimer}`}><strong>How this page works</strong><p>Product matching, stock, prices and delivery information are based on the specific eligible source records shown. We do not guarantee availability or the checkout price. Compare the exact variant and merchant terms. Some eligible outbound links may earn AVUQO commission without affecting the ranking. <Link href="/affiliate-disclosure">Affiliate disclosure</Link> · <Link href="/editorial-policy">Editorial policy</Link>.</p></section>
 </div>;
}
export default function Page(props:Props){return <main><Header/><Suspense fallback={<div className="shell section">Checking product evidence…</div>}><ProductDetails {...props}/></Suspense><Footer/></main>;}
