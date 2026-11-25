import Link from "next/link";
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,ShieldCheck} from "lucide-react";
import ProductGallery from "./ProductGallery";
import AddToCollectionButton from "../collections/AddToCollectionButton";
import {chooseProductTemplate} from "../../lib/products/templates";
import {studioForVerifiedMerchant,partnerHref,activePartnerPromotions} from "../../lib/partners/advertiser-directory";
import type {ShoppingRelease} from "../../lib/products/shopping-release-reader";
import styles from "../../app/products/[slug]/page.module.css";
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
const checked=(v:string)=>new Date(v).toLocaleString("en-GB",{timeZone:"Europe/London",dateStyle:"medium",timeStyle:"short"});
/** Ordinary retail uses the established product design and category templates,
 * with its own release type, never a fabricated published_deals record.
 */
export default function OrdinaryProductDetails({item}:{item:ShoppingRelease}){
 const presentation=chooseProductTemplate({canonical_title:item.title,product_type:item.productType},[{published:{category:item.department}}]);
 const department=presentation.department;
 const studio=studioForVerifiedMerchant(item.merchantName);
 const promotions=studio?.slug==="playpress-toys"?activePartnerPromotions(new Date(),studio.slug):[];
 const details:[string,string][]=[["Retailer product reference",item.sku],["Currency","GBP"],["Retailer",item.merchantName]];
 if(item.brand)details.unshift(["Brand",item.brand]);
 if(item.model)details.unshift(["Model",item.model]);
 const browse="/shop/retail?q="+encodeURIComponent(item.brand??item.title.split(" ")[0]);
 return <div className={`${styles.productPage} ${styles[presentation.template]??""}`} data-department-theme={presentation.template==="general"?department?.theme:undefined}>
 <section className={styles.hero}><div className="shell"><Link className={styles.back} href="/shop/retail"><ArrowLeft size={17}/> Everyday retail products</Link><div className={`${styles.heroGrid} ${presentation.imageShape==="wide"?styles.wideImage:presentation.imageShape==="portrait"?styles.portraitImage:""}`}>
  <div className={styles.art}><div className={styles.productVisual}><ProductGallery images={item.gallery} title={item.title}/></div></div>
  <div className={styles.copy}><p className={styles.kicker}>{presentation.eyebrow} · verified retail</p><h1>{item.title}</h1>
   <p className={styles.variant}>{item.brand&&<span>{item.brand}</span>}{item.model&&<span>{item.model}</span>}<span>SKU {item.sku}</span></p>
   <p className={styles.intro}>A current ordinary retail listing. Confirm the precise variant and product specification with the retailer before buying.</p>
   <div className={styles.topPrice}><span>Verified item price</span><strong>{money(item.price)}</strong><small>From {item.merchantName}. Delivery and fitting, where applicable, may be extra. Not a verified discount.</small><small>{item.stock==="in_stock"?"In stock reported by supplier":"Limited stock reported by supplier"} · checked {checked(item.observedAt)} UK time.</small></div>
   <div className={styles.heroActions}><Link className={styles.action} href={"/go/"+item.offerId}>Visit retailer <ArrowRight size={18}/></Link><AddToCollectionButton kind="wishlist" productId={item.productId} productSlug={item.slug} offerId={item.offerId}/><AddToCollectionButton kind="basket" productId={item.productId} productSlug={item.slug} offerId={item.offerId}/></div>
   {promotions.map(p=><div key={p.id} className={styles.topPrice}><span>Advertiser-announced order offer</span><strong>{p.code}</strong><small>{p.title}. {p.detail} This is a basket-level promotion, not a reduction of the item price above.</small><Link href={partnerHref(studio!)}>Offer details and retailer studio <ArrowRight size={14}/></Link></div>)}
   <p className={styles.assurance}><ShieldCheck size={17}/> Verified source · independent of affiliate payout</p>
  </div></div></div></section>
 <section className={`shell ${styles.section}`} id="retailers"><div className={styles.heading}><p className={styles.kicker}>Retailer price and availability</p><h2>Currently verified retailer listing.</h2><p>This exact offer is not evidence of the cheapest market price. Further sellers are not compared until exact matching is established.</p></div><div className={styles.offerList}><article className={styles.offerCard}><div><h3>{item.merchantName}</h3>{studio&&<Link className={styles.studioLink} href={partnerHref(studio)}>Explore retailer studio <ArrowRight size={14}/></Link>}<p>Current feed observation: {checked(item.observedAt)} UK time.</p></div><div className={styles.offerPrice}><strong>{money(item.price)}</strong><span>Item price only</span></div><Link className={styles.retailer} href={"/go/"+item.offerId}>Visit retailer <ArrowRight size={16}/></Link></article></div></section>
 <section className={`shell ${styles.section}`} id="specifications"><div className={styles.heading}><p className={styles.kicker}>Exact item identity</p><h2>{presentation.groupHeading}</h2><p>Source-confirmed listing identifiers. Dimensions, technical specifications and variant choices are not inferred from a similar title.</p></div><dl className={styles.specs}>{details.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>
 <section className={`shell ${styles.templateSection}`} aria-label="Product-specific guidance"><div className={styles.templateHeading}><h2>{presentation.sectionHeading}</h2><p>{presentation.sectionIntro}</p>{department&&<Link href={"/categories/"+department.slug+"/products"}>Explore {department.name} <ArrowRight size={16}/></Link>}</div><div className={styles.templateGrid} data-single-panel={true}><div className={styles.checkList}><h3>{presentation.practicalTitle}</h3><ul>{presentation.practicalPoints.map(point=><li key={point}><CheckCircle2 size={19}/><span>{point}</span></li>)}</ul></div></div></section>
 <section className={styles.infoBand}><div className={`shell ${styles.infoGrid}`}><article><Clock3 size={27}/><h3>Price evidence</h3><p>Current supplier observation only. Verified historical price trends and savings are not established on this page.</p></article><article><ShieldCheck size={27}/><h3>Delivery and returns</h3><p>Confirm mandatory delivery, returns, warranty and applicable fees directly with the retailer.</p></article><article><CheckCircle2 size={27}/><h3>Product information</h3><p>Additional supplier descriptions and technical data will appear only after separate evidence and reuse checks.</p></article></div></section>
 <section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>Discover more</p><h2>Explore other retail products.</h2><p>Browse other listings; similar titles are not proof of interchangeable variants.</p></div><Link className={styles.action} href={browse}>Browse related retail listings <ArrowRight size={16}/></Link></section>
 <section className={`shell ${styles.disclaimer}`}><strong>How this page works</strong><p>Ordinary shopping is independent of deal scoring. Some links may earn AVUQO commission without changing price order. <Link href="/affiliate-disclosure">Affiliate disclosure</Link> · <Link href="/editorial-policy">Editorial policy</Link></p></section>
 </div>;
}
