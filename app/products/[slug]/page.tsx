import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,ShieldCheck,Package,ChartNoAxesCombined} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import AddToCollectionButton from "../../../components/collections/AddToCollectionButton";
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
 const actualScore=typeof best.published.avuqo_score==="number"&&Number.isFinite(best.published.avuqo_score)&&best.published.avuqo_score>=0&&best.published.avuqo_score<=100?best.published.avuqo_score:null;
 return <div className={`${styles.productPage} ${styles[presentation.template]}`}><section className={styles.hero} id="overview"><div className="shell"><nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">Products</Link><span>/</span><span aria-current="page">{product.canonical_title}</span></nav><div className={`${styles.heroGrid} ${presentation.imageShape==="wide"?styles.wideImage:presentation.imageShape==="portrait"?styles.portraitImage:""}`}>
 <div className={styles.art}>{photo?<img src={photo} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<div className={styles.placeholder}><Package size={49} aria-hidden="true"/><small>Verified product image not available</small></div>}</div>
 <div className={styles.copy}><p className={styles.kicker}>{presentation.eyebrow}</p><h1>{product.canonical_title}</h1>{(product.brand||product.model)&&<p className={styles.variant}>{product.brand&&<span>{product.brand}</span>}{product.model&&<span>{product.model}</span>}</p>}
 <p className={styles.intro}>{product.description||"Compare eligible retailer offers and understand what the price evidence can, and cannot, show."}</p>
 <div className={styles.topPrice}><span>Lowest eligible observed offer</span><strong>{gbp(Number(best.offer.total_price??best.offer.price))}</strong><small>From {best.published.merchant}. Check current price, delivery, stock and terms before buying.</small></div>
 <Link className={styles.action} href="#retailers">Compare retailers <ArrowRight size={18}/></Link><div style={{marginTop:14}}><AddToCollectionButton kind="wishlist" productId={product.id} productSlug={product.slug} offerId={best.offer.id}/></div><p className={styles.assurance}><ShieldCheck size={17}/> Verified-source display only. Independent of affiliate payout.</p></div>
 <aside className={styles.evidenceSidebar} aria-label="Product evidence">
  <div className={styles.evidenceCard}>
   <p className={styles.kicker}>Published product evidence</p>
   <h2>AVUQO Score</h2>
   {actualScore!==null?<div className={styles.scoreDisplay}><div className={styles.scoreRing}><strong>{Number.isInteger(actualScore)?actualScore:actualScore.toFixed(1)}</strong></div><span>Published score from an eligible offer.<small>Check its current source context below.</small></span></div>:
    <p className={styles.scorePending}>No publishable score is available for this exact product.</p>}
   <h3>Compare with confidence.</h3>
   <ul>
    <li><CheckCircle2 size={18}/>Only eligible, checked retailer offers appear here.</li>
    <li><CheckCircle2 size={18}/>We compare the costs supported by source records.</li>
    <li><CheckCircle2 size={18}/>Commission does not decide the ordering.</li>
   </ul>
  </div>
  <div className={styles.evidenceCard}>
   <p className={styles.kicker}>What we can show</p>
   <strong className={styles.evidenceCount}>{offers.length} eligible {offers.length===1?"offer":"offers"}</strong>
   <p>Compare the current published records below. Confirm delivery, stock and checkout terms with each retailer.</p>
   <Link href="#retailers">See retailer details <ArrowRight size={16}/></Link>
  </div>

 </aside>
 </div></div></section>
 <nav className={styles.productTabs} aria-label="On this product page"><div className="shell">
   <a href="#overview">Overview</a><a href="#retailers">Compare prices</a><a href="#buying-guide">Buying guide</a><a href="#product-evidence">Evidence</a>
 </div></nav>
 <section className={`shell ${styles.comparisonSection}`} id="retailers" aria-label="Compare eligible retailer offers and price evidence">
  <div className={styles.comparisonGrid}>
    <article className={styles.comparisonCard}>
      <div className={styles.comparisonHeading}><h2>Compare prices.</h2><span>{offers.length} eligible {offers.length===1?"offer":"offers"}</span></div>
      <p className={styles.comparisonIntro}>Recently checked retailer records for this exact product. The displayed amount is not a checkout guarantee.</p>
      <div className={styles.priceRows}>
        {[...offers].sort((a,b)=>Number(a.offer.total_price??a.offer.price)-Number(b.offer.total_price??b.offer.price)).map(row=>
          <div className={styles.priceRow} key={row.offer.id}>
            <div><strong>{row.published.merchant}</strong><small>Checked {row.offer.last_seen_at?new Date(row.offer.last_seen_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"date unavailable"}</small></div>
            <div className={styles.priceAmount}><b>{gbp(Number(row.offer.total_price??row.offer.price))}</b><small>{row.offer.total_price!==null?"Reported total cost":"Delivery may be extra"}</small></div>
            <Link href={`/go/${row.offer.id}`}>View offer <ArrowRight size={15} aria-hidden="true"/></Link>
          </div>
        )}
      </div>
      <p className={styles.comparisonDisclaimer}>Verify stock, delivery, fees and seller terms directly with the retailer before purchasing.</p>
    </article>
    <article className={styles.comparisonCard} id="product-evidence">
      <div className={styles.comparisonHeading}><h2>Price evidence.</h2><span>Evidence first</span></div>
      <div className={styles.historyEmpty}><ChartNoAxesCombined size={38} aria-hidden="true"/><strong>No verified multi-month trend yet.</strong>
        <p>We won't draw a price-history line from one observed offer. Historical trends will appear when there is sufficient approved time-series evidence for this exact variant.</p>
      </div>
      <div className={styles.historyTip}><ShieldCheck size={19} aria-hidden="true"/><p>Offers are source-checked and filtered for freshness. A retailer's claimed saving isn't independently confirmed by this panel.</p></div>
    </article>
  </div>
 </section>
 <section className={`shell ${styles.templateSection}`} id="buying-guide" aria-label="Product-specific guidance">
  <div className={styles.templateHeading}><p className={styles.kicker}>Designed for this kind of purchase</p><h2>{presentation.sectionHeading}</h2><p>{presentation.sectionIntro}</p></div>
  <div className={styles.templateGrid}>
   {presentation.template==="tech"&&specs.length>0?<div className={styles.highlightSpecs}><p className={styles.kicker}>At a glance</p><h3>Technical details</h3><dl>{specs.slice(0,5).map(([key,val])=><div key={key}><dt>{key.replaceAll("_"," ")}</dt><dd>{val}</dd></div>)}</dl></div>:
    presentation.template==="grocery"&&specs.length>0?<div className={styles.highlightSpecs}><p className={styles.kicker}>Pack check</p><h3>What&apos;s in the basket?</h3><dl>{specs.slice(0,5).map(([key,val])=><div key={key}><dt>{key.replaceAll("_"," ")}</dt><dd>{val}</dd></div>)}</dl></div>:
    presentation.template==="travel"?<div className={styles.travelPanel}><p className={styles.kicker}>Travel changes with the dates</p><h3>Check the trip, not just the price.</h3><p>Availability and inclusion details need to match the exact dates and travellers before you book.</p><Link href="/travel">Explore travel guidance <ArrowRight size={17}/></Link></div>:
    presentation.template==="beauty"?<div className={styles.carePanel}><p className={styles.kicker}>The finer details</p><h3>Ingredients and suitability matter.</h3><p>Use the retailer&apos;s complete product label and care advice, especially when formulations or sizes vary.</p></div>:
    presentation.template==="home"?<div className={styles.homePanel}><p className={styles.kicker}>Made for your space</p><h3>Measure twice, choose once.</h3><p>Fit, care, delivery and everyday use often matter longer than a temporary price reduction.</p></div>:
    presentation.template==="motoring"?<div className={styles.motorPanel}><p className={styles.kicker}>Ownership matters</p><h3>Plan the full running cost.</h3><p>Fuel, charging, maintenance and insurance are separate from the purchase price.</p><Link href="/motoring">Explore motoring <ArrowRight size={17}/></Link></div>:
    presentation.template==="fashion"?<div className={styles.fashionPanel}><p className={styles.kicker}>Find your fit</p><h3>Wear it your way.</h3><p>Colour, fit, material and care details deserve space alongside the price.</p></div>:
    presentation.template==="gifts"?<div className={styles.giftsPanel}><p className={styles.kicker}>Make it meaningful</p><h3>Who are you choosing for?</h3><p>Think about the person, the occasion and whether the product can arrive when needed.</p></div>:
    presentation.template==="pets"?<div className={styles.petsPanel}><p className={styles.kicker}>The little family members</p><h3>Fit their needs first.</h3><p>Choose by species, age, size and the specific instructions supplied for the product.</p></div>:
    <div className={styles.generalPanel}><p className={styles.kicker}>Take a closer look</p><h3>What comes with it?</h3><p>Confirm the exact variant, included accessories and the retailer&apos;s terms before buying.</p></div>}
   <div className={styles.checkList}><h3>{presentation.practicalTitle}</h3><ul>{presentation.practicalPoints.map(point=><li key={point}><CheckCircle2 size={19}/><span>{point}</span></li>)}</ul></div>
  </div>
 </section>
 <section className={styles.infoBand}><div className={`shell ${styles.infoGrid}`}><article><ShieldCheck size={27}/><h3>Evidence before claims</h3><p>Merchant eligibility and source permissions are checked before an offer is displayed.</p></article><article><Clock3 size={27}/><h3>Freshness matters</h3><p>Stale and expired offers are excluded from this product comparison.</p></article><article><CheckCircle2 size={27}/><h3>Independent ranking</h3><p>Offers are ordered by displayed comparable costs, not affiliate commission.</p></article></div></section>
 {specs.length>0&&<section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>The details</p><h2>{presentation.groupHeading}</h2></div><dl className={styles.specs}>{specs.map(([k,v])=><div key={k}><dt>{k.replaceAll("_"," ")}</dt><dd>{String(v)}</dd></div>)}</dl></section>}
 <section className={`shell ${styles.disclaimer}`}><strong>How this page works</strong><p>Product matching, stock, prices and delivery information are based on the specific eligible source records shown. We do not guarantee availability or the checkout price. Compare the exact variant and merchant terms. Some eligible outbound links may earn AVUQO commission without affecting the ranking. <Link href="/affiliate-disclosure">Affiliate disclosure</Link> · <Link href="/editorial-policy">Editorial policy</Link>.</p></section>
 </div>;
}
export default function Page(props:Props){return <main><Header/><Suspense fallback={<div className="shell section">Checking product evidence…</div>}><ProductDetails {...props}/></Suspense><Footer/></main>;}
