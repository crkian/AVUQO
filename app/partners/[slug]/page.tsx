import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import type {CSSProperties} from "react";
import type {Metadata} from "next";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {createAdminClient} from "../../../lib/supabase/admin";
import {verifiedOffersForAdvertiser} from "../../../lib/products/public-catalog";
import {partnerStudio} from "../../../lib/partners/studio-editorial";
import {PartnerStudioHero,PartnerStudioNotebook,PartnerStudioProducts,PartnerStudioInvitation,type StudioProduct} from "../../../components/partners/PartnerStudioExperience";
import {PARTNERS,partnerFor,activePartnerPromotions,isApprovedPartnerLink,partnerHref} from "../../../lib/partners/advertiser-directory";
import {departmentsForPartner,partnersForDepartment} from "../../../lib/partners/catalogue-taxonomy";
import styles from "../partners.module.css";

type Props={params:Promise<{slug:string}>};
// Merchant-scoped prices are request-time evidence. Keep runtime reads out of prerender.
export const instant=false;
export function generateStaticParams(){return PARTNERS.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const partner=partnerFor((await params).slug);
 if(!partner)return {title:"Partner not found | AVUQO",robots:{index:false}};
 return {
  title:`${partner.name} | ${partnerStudio(partner.slug)?.edition??"Explore"} | AVUQO`,
  description:`${partnerStudio(partner.slug)?.lead??partner.description} ${partner.whatToCheck}`,
  alternates:{canonical:`/partners/${partner.slug}`},
  robots:{index:Boolean(partner.links.length)||(partner.kind==="retail"&&["496","77952","101445","736","31539"].includes(partner.advertiserId??"")),follow:true}
 };
}
export default async function PartnerDetail({params}:Props){
 await connection();
 const slug=(await params).slug,partner=partnerFor(slug);
 if(!partner)notFound();
 const studio=partnerStudio(slug);
 if(!studio)notFound();
 const offers=partner.advertiserId?await verifiedOffersForAdvertiser(partner.advertiserId,35):[];
 const ids=[...new Set(offers.map(o=>o.published.product_id).filter(Boolean))];
 const db=createAdminClient();
 const {data:products}=ids.length?await db.from("products")
  .select("id,slug,description,brand").in("id",ids).eq("status","active"):{data:[]};
 const byId=new Map((products??[])
  .filter(p=>/^[a-z0-9][a-z0-9-]{2,159}$/.test(p.slug??""))
  .map(p=>[p.id,p]));
 const currentOffers=offers.filter(o=>byId.has(o.published.product_id));
 // Source admission still requires source-rights, exact-identity and owner-release;
 // the new photographic studio uses ONLY verifiedOffersForAdvertiser results.
 const studioProducts:StudioProduct[]=currentOffers.map(o=>{
  const p=byId.get(o.published.product_id)!;
  return {id:o.offer.id,slug:p.slug,title:o.published.title,
   brand:p.brand??null,description:p.description??null,
   imageUrl:o.published.image_url,price:Number(o.offer.price),
   observedAt:o.offer.last_seen_at,merchant:o.published.merchant};
 });
 const promotions=activePartnerPromotions(new Date(),partner.slug);
 const theme={"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as CSSProperties;
 const namedLinks=partner.links.filter(isApprovedPartnerLink);
 const categories=departmentsForPartner(partner.slug);
 const related=categories.length?partnersForDepartment(categories[0].slug).filter(p=>p.slug!==partner.slug).slice(0,5):[];
 return <><Header/>
  <main className={styles.page} style={theme}>
   <PartnerStudioHero partner={partner} studio={studio} products={studioProducts} links={namedLinks}/>
   <PartnerStudioNotebook partner={partner} studio={studio} products={studioProducts}/>
   <PartnerStudioProducts partner={partner} studio={studio} products={studioProducts}/>
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
     <p className={styles.sectionIntro}>These are promotions from the advertiser&apos;s dated materials, not independently verified AVUQO historical price reductions.</p>
     <div className={styles.promoGrid}>{promotions.map(p=><article key={p.id} className={styles.promo}>
      <h3>{p.title}</h3><p>{p.detail}</p>
      {p.code&&<div className={styles.strip}><span>Voucher code</span><code>{p.code}</code></div>}
      <a href={p.href} target="_blank" rel="sponsored noopener noreferrer">{p.cta} ↗</a>
      <small className={styles.fine}>{p.source}. Always check exclusions, availability and final prices.</small>
     </article>)}</div>
    </section>}
    <section className={styles.section} aria-labelledby="partner-department-navigation">
     <p className={styles.kicker}>Part of the wider AVUQO retail park</p><h2 id="partner-department-navigation">Shop the same category your way.</h2>
     <p className={styles.sectionIntro}>Browse the original AVUQO departments, explore other participating retailers, or start with an independently checked product. A shared category is not an assertion that shops sell identical items.</p>
     <div className={styles.relatedStores}>
      {categories.map(d=><Link className={styles.relatedStore} key={d.slug} href={"/categories/"+d.slug+"/products"}>
       <span aria-hidden="true">▤</span><strong>{d.name} products &amp; guides</strong><span aria-hidden="true">›</span>
      </Link>)}
      {related.map(p=><Link className={styles.relatedStore} href={partnerHref(p)} key={p.slug} style={{"--glow":p.glow} as CSSProperties}>
       <span aria-hidden="true">{p.symbol}</span><strong>{p.name}</strong><span aria-hidden="true">›</span>
      </Link>)}
      <Link className={styles.relatedStore} href="/catalogue"><span aria-hidden="true">◇</span><strong>Everything on AVUQO</strong><span aria-hidden="true">›</span></Link>
     </div>
    </section>
    <PartnerStudioInvitation partner={partner}/>
    <section className={styles.notice}>
     <strong>Independent comparison first.</strong> AVUQO may earn commission through some retailer links at no extra cost to you. An advertiser&apos;s own quote is not automatically the cheapest market price. Shop-by-price comparisons require the identical product or booking details across multiple valid sources. <Link href="/affiliate-disclosure">How affiliate links work</Link> · <Link href="/trust">How AVUQO verifies offers</Link> · <Link href="/partners">All partners</Link>
    </section>
   </div>
  </main><Footer/></>;
}
