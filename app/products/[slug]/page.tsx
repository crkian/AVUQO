import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {verifiedProduct} from "../../../lib/products/public-catalog";
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
 const specs=product.specifications&&typeof product.specifications==="object"&&!Array.isArray(product.specifications)?Object.entries(product.specifications as Record<string,unknown>).filter(([k,v])=>k.length<=50&&["string","number","boolean"].includes(typeof v)&&String(v).length<150).slice(0,12):[];
 const photo=best.published.image_url;
 return <><section className={styles.hero}><div className="shell"><Link className={styles.back} href="/products"><ArrowLeft size={17}/> All products</Link><div className={styles.heroGrid}>
 <div className={styles.art}>{photo?<img src={photo} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<div className={styles.placeholder}><span>Q</span><small>Verified image not available</small></div>}</div>
 <div className={styles.copy}><p className={styles.kicker}>AVUQO product guide</p><h1>{product.canonical_title}</h1>{(product.brand||product.model)&&<p className={styles.variant}>{product.brand&&<span>{product.brand}</span>}{product.model&&<span>{product.model}</span>}</p>}
 <p className={styles.intro}>{product.description||"Compare eligible retailer offers and understand what the price evidence can, and cannot, show."}</p>
 <div className={styles.topPrice}><span>Lowest eligible observed offer</span><strong>{gbp(Number(best.offer.total_price??best.offer.price))}</strong><small>From {best.published.merchant}. Check current price, delivery, stock and terms before buying.</small></div>
 <Link className={styles.action} href="#retailers">Compare retailers <ArrowRight size={18}/></Link><p className={styles.assurance}><ShieldCheck size={17}/> Verified-source display only. Independent of affiliate payout.</p></div>
 </div></div></section>
 <section className={`shell ${styles.section}`} id="retailers"><div className={styles.heading}><p className={styles.kicker}>Worth comparing</p><h2>Retailer offers for this exact product.</h2><p>Only eligible, recently checked offers are shown. A lower headline price may have extra delivery costs.</p></div>
 <div className={styles.offerList}>{offers.map(x=><article key={x.offer.id} className={styles.offerCard}><div><h3>{x.published.merchant}</h3><p>Last checked {new Date(x.offer.last_seen_at!).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} · {x.offer.stock_status==="in_stock"?"Availability reported": "Confirm availability with retailer"}</p></div><div className={styles.offerPrice}><strong>{gbp(Number(x.offer.total_price??x.offer.price))}</strong><span>{x.offer.total_price!==null?"Total reported offer cost":"Product price; delivery may be extra"}</span></div><Link href={`/go/${x.offer.id}`} className={styles.retailer}>Visit retailer <ArrowRight size={16}/></Link></article>)}</div>
 </section>
 <section className={styles.infoBand}><div className={`shell ${styles.infoGrid}`}><article><ShieldCheck size={27}/><h3>Evidence before claims</h3><p>Merchant eligibility and source permissions are checked before an offer is displayed.</p></article><article><Clock3 size={27}/><h3>Freshness matters</h3><p>Stale and expired offers are excluded from this product comparison.</p></article><article><CheckCircle2 size={27}/><h3>Independent ranking</h3><p>Offers are ordered by displayed comparable costs, not affiliate commission.</p></article></div></section>
 {specs.length>0&&<section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>The details</p><h2>Know what you are comparing.</h2></div><dl className={styles.specs}>{specs.map(([k,v])=><div key={k}><dt>{k.replaceAll("_"," ")}</dt><dd>{String(v)}</dd></div>)}</dl></section>}
 <section className={`shell ${styles.disclaimer}`}><strong>How this page works</strong><p>Product matching, stock, prices and delivery information are based on the specific eligible source records shown. We do not guarantee availability or the checkout price. Compare the exact variant and merchant terms. Some eligible outbound links may earn AVUQO commission without affecting the ranking. <Link href="/affiliate-disclosure">Affiliate disclosure</Link> · <Link href="/editorial-policy">Editorial policy</Link>.</p></section>
 </>;
}
export default function Page(props:Props){return <main><Header/><Suspense fallback={<div className="shell section">Checking product evidence…</div>}><ProductDetails {...props}/></Suspense><Footer/></main>;}
