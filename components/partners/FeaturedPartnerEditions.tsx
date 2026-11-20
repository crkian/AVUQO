import Link from "next/link";
import {connection} from "next/server";
import {ArrowUpRight,ArrowRight,CheckCircle2,ShieldCheck,Wrench,PawPrint,Puzzle,Plane} from "lucide-react";
import {PARTNERS,partnerHref} from "../../lib/partners/advertiser-directory";
import {partnerStudio} from "../../lib/partners/studio-editorial";
import {verifiedOffersForAdvertiser} from "../../lib/products/public-catalog";
import styles from "../../app/partners/featured.module.css";

/** Only product art already eligible for public release is used. A missing
 * image, stale offer or unconfigured preview becomes an original editorial
 * visual, never a hotlinked merchant banner or fabricated item. */
const features=[
 {slug:"tooled-up",Icon:Wrench,folio:"01"},
 {slug:"petlibro",Icon:PawPrint,folio:"02"},
 {slug:"playpress-toys",Icon:Puzzle,folio:"03"},
 {slug:"holiday-extras",Icon:Plane,folio:"04"}
] as const;
export default async function FeaturedPartnerEditions(){
 await connection();
 const safe=await Promise.all(features.map(async f=>{
  const partner=PARTNERS.find(p=>p.slug===f.slug);
  if(!partner)return null;
  const studio=partnerStudio(f.slug);
  if(!studio)return null;
  // No products or raw feeds are directly queried here.
  const offers=partner.advertiserId?await verifiedOffersForAdvertiser(partner.advertiserId,3):[];
  const photo=offers.find(o=>Boolean(o.published.image_url));
  return {...f,partner,studio,photo:photo?.published.image_url??null,
   photoAlt:photo?.published.title??""};
 }));
 const entries=safe.filter((item):item is NonNullable<typeof item>=>item!==null);
 return <section className={styles.section} aria-labelledby="featured-editions-title">
  <div className={styles.heading}>
   <div><p className={styles.eyebrow}>A curated retail park <span>/</span> 21 individual studios</p>
    <h2 id="featured-editions-title">A place for every kind of <em>discovery.</em></h2>
   </div>
   <Link href="/shop">Explore all eligible products <ArrowUpRight size={17} aria-hidden="true"/></Link>
  </div>
  <div className={styles.gallery}>
   {entries.map(({slug,Icon,folio,partner,studio,photo,photoAlt})=><Link key={slug} className={styles.feature}
    href={partnerHref(partner)} data-scene={studio.scene}
    style={{"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as React.CSSProperties}>
    <span className={styles.featureNoise} aria-hidden="true"/>
    <span className={styles.folio}>AVUQO EDITION <strong>{folio}</strong></span>
    <span className={styles.art} aria-hidden={Boolean(photo)?undefined:true}>
     {photo?<img src={photo} alt={photoAlt} referrerPolicy="no-referrer" loading="lazy"/>:
      <span className={styles.artIcon}><Icon size={120} strokeWidth={.7}/></span>}
    </span>
    <span className={styles.copy}><span className={styles.kicker}>{studio.edition}</span>
     <strong>{partner.name}</strong><span className={styles.tagline}>{studio.lead}</span>
     <span className={styles.featureAction}>Enter the studio <ArrowUpRight size={18} aria-hidden="true"/></span>
    </span>
    {photo&&<span className={styles.evidence}><CheckCircle2 size={12} aria-hidden="true"/> Verified product photo</span>}
   </Link>)}
  </div>
  <p className={styles.footnote}><ShieldCheck size={15} aria-hidden="true"/> Individually designed AVUQO editorial pages. Photographs appear only when the current source and image-reuse rules permit them. Service partners may not have public item-price listings.</p>
 </section>;
}
