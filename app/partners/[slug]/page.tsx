import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import type {CSSProperties} from "react";
import type {Metadata} from "next";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {createAdminClient} from "../../../lib/supabase/admin";
import {verifiedOffersForAdvertiser} from "../../../lib/products/public-catalog";
import {PARTNERS,partnerFor,activePartnerPromotions,isApprovedPartnerLink} from "../../../lib/partners/advertiser-directory";
import styles from "../partners.module.css";

type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return PARTNERS.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const partner=partnerFor((await params).slug);
 if(!partner)return {title:"Partner not found | AVUQO",robots:{index:false}};
 return {
  title:`${partner.name} | Explore on AVUQO`,
  description:`${partner.description} ${partner.whatToCheck}`,
  alternates:{canonical:`/partners/${partner.slug}`},
  robots:{index:Boolean(partner.links.length)||(partner.kind==="retail"&&["496","77952","101445","736","31539"].includes(partner.advertiserId??"")),follow:true}
 };
}
const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export default async function PartnerDetail({params}:Props){
 await connection();
 const slug=(await params).slug,partner=partnerFor(slug);
 if(!partner)notFound();
 const offers=partner.advertiserId?await verifiedOffersForAdvertiser(partner.advertiserId,15):[];
 const ids=[...new Set(offers.map(o=>o.published.product_id).filter(Boolean))];
 const db=createAdminClient();
 const {data:products}=ids.length?await db.from("products").select("id,slug").in("id",ids).eq("status","active"):{data:[]};
 const slugs=new Map((products??[]).filter(p=>/^[a-z0-9][a-z0-9-]{2,159}$/.test(p.slug??"")).map(p=>[p.id,p.slug]));
 const currentOffers=offers.filter(o=>slugs.has(o.published.product_id));
 const promotions=activePartnerPromotions(new Date(),partner.slug);
 const theme={"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as CSSProperties;
 const primary=partner.links.find(l=>l.kind==="approved_awin"&&isApprovedPartnerLink(l))??
  partner.links.find(l=>isApprovedPartnerLink(l));
 const namedLinks=partner.links.filter(isApprovedPartnerLink);
 return <><Header/>
  <main className={styles.page} style={theme}>
   <section className={styles.hero}><div className={styles.shell}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">AVUQO</Link><span>›</span><Link href="/partners">Retail park</Link><span>›</span><span>{partner.name}</span></nav>
    <div className={styles.heroGrid}><div>
     <p className={styles.kicker}>AVUQO retail park · {partner.kind==="retail"?"Product shopping":"Partner discovery"}</p>
     <h1>{partner.name}<span>{partner.tagline}</span></h1>
     <p className={styles.heroDescription}>{partner.description}</p>
     <div className={styles.heroLinks}>
      {primary&&<a className={styles.heroButton} href={primary.href} target="_blank" rel="sponsored noopener noreferrer">{primary.label} ↗</a>}
      <Link className={styles.heroGhost} href={partner.categoryHref}>Explore {partner.categoryLabel} on AVUQO</Link>
      <Link className={styles.heroGhost} href="/compare">Compare full costs</Link>
     </div>
    </div><div className={styles.symbol} aria-hidden="true">{partner.symbol}</div></div>
   </div></section>
   <div className={styles.shell+" "+styles.main}>
    <div className={styles.twoCols}>
     <section className={styles.section}>
      <p className={styles.kicker}>Explore this partner</p>
      <h2>{namedLinks.length?"Where would you like to start?":"Browse this category on AVUQO"}</h2>
      <p className={styles.sectionIntro}>{namedLinks.length?
       "These are documented merchant destinations. A direct retailer link may not earn AVUQO commission; only the explicitly supplied tracking links are marked as tracked.":
       "This approved advertiser does not yet have a verified outbound destination or an AVUQO public product offer. The category journeys remain available without inventing a price."}</p>
      <div className={styles.linkGrid}>
       {namedLinks.slice(0,9).map(l=><a key={l.label+l.href} className={styles.linkCard} href={l.href} target="_blank" rel="sponsored noopener noreferrer">
        <span className={styles.tag}>{l.kind==="approved_awin"?"AVUQO tracked affiliate":"Retailer website"}</span>
        <strong>{l.label}</strong>
        <span>{l.kind==="approved_awin"?"Awin link supplied for AVUQO; final terms at retailer":"Continue to the provider for live price, stock and conditions"}</span>
       </a>)}
       {!namedLinks.length&&<Link href={partner.categoryHref} className={styles.linkCard}><strong>Explore {partner.categoryLabel}</strong><span>Browse independent guides and eligible sources</span></Link>}
      </div>
     </section>
     <aside className={styles.side}><p className={styles.kicker}>The AVUQO check</p>
      <h2>Before you decide</h2><p className={styles.sectionIntro}>{partner.whatToCheck}</p>
      <ul>{partner.topics.map(t=><li key={t}>{t}</li>)}</ul>
      <p className={styles.fine}>AVUQO does not infer live prices, eligibility or stock from affiliate acceptance. Each retailer is responsible for its final quotation and checkout.</p>
     </aside>
    </div>
    {promotions.length>0&&<section className={styles.section} aria-labelledby="partner-promotions">
     <p className={styles.kicker}>Merchant announcements</p><h2 id="partner-promotions">Offers and codes shared by this partner</h2>
     <p className={styles.sectionIntro}>These are promotions from the advertiser's dated materials, not independently verified AVUQO historical price reductions.</p>
     <div className={styles.promoGrid}>{promotions.map(p=><article key={p.id} className={styles.promo}>
      <h3>{p.title}</h3><p>{p.detail}</p>
      {p.code&&<div className={styles.strip}><span>Voucher code</span><code>{p.code}</code></div>}
      <a href={p.href} target="_blank" rel="sponsored noopener noreferrer">{p.cta} ↗</a>
      <small className={styles.fine}>{p.source}. Always check exclusions, availability and final prices.</small>
     </article>)}</div>
    </section>}
    <section className={styles.section} aria-labelledby="partner-public-products">
     <p className={styles.kicker}>Source-verified shopping</p>
     <h2 id="partner-public-products">{currentOffers.length?"Products currently eligible on AVUQO":"Product-price evidence"}</h2>
     {currentOffers.length?<><p className={styles.sectionIntro}>These are individually approved source offers, not every private feed item. Prices shown exclude delivery unless independently verified. Check stock, configuration and checkout total with the retailer.</p>
      <div className={styles.products}>{currentOffers.map(o=><Link href={`/products/${slugs.get(o.published.product_id)}`} key={o.offer.id} className={styles.productCard}>
       <span className={styles.tag}>Released retailer offer</span>
       <strong>{o.published.title}</strong>
       <span className={styles.price}>{gbp(Number(o.offer.price))}</span>
       <small>Retailer item price, delivery not verified</small>
       <small>Observed {new Date(o.offer.last_seen_at??Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"})}</small>
       <span>View eligible product ↗</span>
      </Link>)}</div></>:
      <p className={styles.sectionIntro}>No matching offer currently passes AVUQO's complete public price, stock, source-rights, exact-identity and owner-release checks. This does not imply the advertiser has no products or that its programme was declined.</p>}
    </section>
    <section className={styles.notice}>
     <strong>Independent comparison first.</strong> AVUQO may earn commission through some retailer links at no extra cost to you. An advertiser's own quote is not automatically the cheapest market price. Shop-by-price comparisons require the identical product or booking details across multiple valid sources. <Link href="/affiliate-disclosure">How affiliate links work</Link> · <Link href="/trust">How AVUQO verifies offers</Link> · <Link href="/partners">All partners</Link>
    </section>
   </div>
  </main><Footer/></>;
}
