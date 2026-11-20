import Link from "next/link";
import type {CSSProperties} from "react";
import type {Partner,PartnerLink} from "../../lib/partners/advertiser-directory";
import {isApprovedPartnerLink} from "../../lib/partners/advertiser-directory";
import {matchStudioChapters,type StudioEditorial} from "../../lib/partners/studio-editorial";
import styles from "../../app/partners/studios.module.css";

export type StudioProduct={
 id:string;slug:string;title:string;brand:string|null;description:string|null;
 imageUrl:string|null;price:number;observedAt:string|null;merchant:string;
};
const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
const stamp=(date:string|null)=>date&&Number.isFinite(Date.parse(date))
 ?new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"})
 :"Date unavailable";
const safePartnerDestination=(p:Partner,links:readonly PartnerLink[])=>
 links.find(l=>l.kind==="approved_awin"&&isApprovedPartnerLink(l))??
 links.find(l=>isApprovedPartnerLink(l));
const byChapter=(products:StudioProduct[],chapter:StudioEditorial["chapters"][number])=>
 products.filter(p=>matchStudioChapters(p.title,[chapter]).length>0);
const productHref=(p:StudioProduct)=>"/products/"+p.slug;

export function PartnerStudioHero({partner,studio,products,links}:{partner:Partner;studio:StudioEditorial;products:StudioProduct[];links:readonly PartnerLink[]}){
 const photos=products.filter(p=>p.imageUrl).slice(0,3);
 const primary=safePartnerDestination(partner,links);
 const heroImage=photos[0];
 const theme={"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as CSSProperties;
 return <section className={styles.hero} style={theme} data-scene={studio.scene} aria-labelledby="partner-studio-title">
  <div className={styles.heroShell}>
   <nav className={styles.crumbs} aria-label="Breadcrumb">
    <Link href="/">AVUQO</Link><span>›</span><Link href="/catalogue">Catalogue</Link><span>›</span>
    <Link href="/partners">The retail park</Link><span>›</span><span aria-current="page">{partner.name}</span>
   </nav>
   <div className={styles.heroGrid}>
    <div className={styles.heroCopy}>
     <p className={styles.micro}><span className={styles.microDot}/>{studio.stamp}<span>·</span> AN AVUQO RETAIL STUDIO</p>
     <div className={styles.brandline}><span className={styles.brandMark} aria-hidden="true">{partner.symbol}</span><span>{studio.edition}</span></div>
     <h1 id="partner-studio-title">{partner.name}<em>{partner.tagline}</em></h1>
     <p className={styles.lead}>{studio.lead}</p>
     <p className={styles.description}>{partner.description}</p>
     <div className={styles.heroActions}>
      {products.length>0?<a className={styles.primary} href="#source-products">Explore verified products <span aria-hidden="true">↗</span></a>:
       <a className={styles.primary} href="#studio-notebook">Explore the {studio.edition.toLowerCase()} <span aria-hidden="true">↗</span></a>}
      {primary&&<a className={styles.secondary} href={primary.href} target="_blank" rel={primary.kind==="approved_awin"?"sponsored noopener noreferrer":"noopener noreferrer"}>
       {primary.kind==="approved_awin"?"Visit tracked partner destination":"Visit supplier website"} <span aria-hidden="true">↗</span>
      </a>}
      <Link className={styles.secondary} href={partner.categoryHref}>Shop {partner.categoryLabel}</Link>
     </div>
     <p className={styles.heroFine}>Independently designed by AVUQO. This is not an official supplier website or a claim of exclusive partnership.</p>
    </div>
    <div className={styles.heroArtwork} aria-label={heroImage?"Rights-cleared product photographs from current AVUQO offers":"AVUQO editorial illustration"}>
     <div className={styles.heroWord} aria-hidden="true">{studio.heroWord}</div>
     {heroImage?.imageUrl?
      <div className={styles.heroPhoto}><img src={heroImage.imageUrl} alt={heroImage.title} referrerPolicy="no-referrer" loading="eager"/>
       <div className={styles.photoCaption}><span>ACTUAL ELIGIBLE PRODUCT</span><strong>{heroImage.title}</strong></div>
      </div>:
      <div className={styles.illustration} aria-hidden="true"><span>{partner.symbol}</span><small>{studio.edition}</small></div>}
     {photos[1]?.imageUrl&&<div className={styles.secondPhoto}><img src={photos[1].imageUrl} alt={photos[1].title} referrerPolicy="no-referrer" loading="lazy"/></div>}
     {photos[2]?.imageUrl&&<div className={styles.thirdPhoto}><img src={photos[2].imageUrl} alt={photos[2].title} referrerPolicy="no-referrer" loading="lazy"/></div>}
     <div className={styles.storyStamp}><span>AVUQO EDITION</span><b>{studio.heroWord}</b><span>FIND WHAT&apos;S WORTH IT</span></div>
    </div>
   </div>
  </div>
 </section>;
}

export function PartnerStudioNotebook({partner,studio,products}:{partner:Partner;studio:StudioEditorial;products:StudioProduct[]}){
 return <section className={styles.notebook} id="studio-notebook" aria-labelledby="studio-notebook-title">
  <div className={styles.storyPanel}>
   <p className={styles.eyebrow}>The AVUQO perspective / {studio.edition}</p>
   <h2 id="studio-notebook-title">{studio.storyTitle}</h2>
   <p>{studio.story}</p>
   <Link href={partner.categoryHref}>Explore the wider {partner.categoryLabel} category <span aria-hidden="true">↗</span></Link>
  </div>
  <div className={styles.chapterPanel}>
   <div className={styles.chapterHeader}><p className={styles.eyebrow}>01 / A SHOPPER&apos;S FIELD GUIDE</p><h2>{studio.chapterHeading}</h2></div>
   <div className={styles.chapterGrid}>
    {studio.chapters.map((chapter,i)=>{
     const matches=byChapter(products,chapter);
     const anchor=matches.length?"#source-products":partner.categoryHref;
     return <article className={styles.chapter} key={chapter.title}>
      <span className={styles.chapterNumber}>0{i+1}</span>
      <h3>{chapter.title}</h3><p>{chapter.detail}</p>
      {matches.length>0&&<div className={styles.chapterProducts} aria-label={"Eligible products for "+chapter.title}>
       {matches.slice(0,2).map(product=><Link href={productHref(product)} key={product.id} className={styles.chapterProduct}>
        {product.imageUrl?<img src={product.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer"/>:
         <span aria-hidden="true">{partner.symbol}</span>}
        <span>{product.title}</span>
       </Link>)}
      </div>}
      {matches.length>0?<a href={anchor}>{matches.length} source-eligible {matches.length===1?"product":"products"} in this current shelf <span aria-hidden="true">↗</span></a>:
       <Link href={anchor}>Explore the wider category <span aria-hidden="true">↗</span></Link>}
     </article>;
    })}
   </div>
  </div>
 </section>;
}

export function PartnerStudioProducts({partner,studio,products}:{partner:Partner;studio:StudioEditorial;products:StudioProduct[]}){
 if(products.length===0)return <section className={styles.emptyProducts} id="source-products" aria-label="Product publication status">
  <div className={styles.emptyArt} aria-hidden="true">{partner.symbol}</div>
  <div><p className={styles.eyebrow}>02 / THE VERIFIED SHELF</p><h2>When the evidence is ready, the products appear.</h2>
   <p>No matching offer currently passes AVUQO&apos;s complete public price, stock, source-rights, exact-identity and owner-release checks. This does not imply the advertiser has no products or that its programme was declined.</p>
   <p>Browse the {studio.edition.toLowerCase()} above, or explore the existing category without an invented live price.</p>
   <Link href={partner.categoryHref}>Explore {partner.categoryLabel} <span aria-hidden="true">↗</span></Link>
  </div>
 </section>;
 const featured=products.slice(0,18);
 const merchant=products[0].merchant;
 const href="/shop?merchant="+encodeURIComponent(merchant);
 return <section className={styles.shopping} id="source-products" aria-labelledby="source-products-title">
  <div className={styles.shoppingHeader}><div>
   <p className={styles.eyebrow}>02 / FROM THE CURRENT VERIFIED SHELF</p>
   <h2 id="source-products-title">Actually here. Actually checked.</h2>
   <p>Individual AVUQO-approved source offers for {partner.name}, not the full private feed. The item price shown is not a delivered-total or cheapest-market claim.</p>
  </div><Link href={href} className={styles.shopAll}>Shop more eligible {partner.name} products <span aria-hidden="true">↗</span></Link></div>
  <div className={styles.productGrid}>
   {featured.map((p,i)=><Link className={styles.productCard} href={productHref(p)} key={p.id}>
    <div className={styles.productImage}>
     {p.imageUrl?<img loading="lazy" referrerPolicy="no-referrer" src={p.imageUrl} alt={p.title}/>:
      <span className={styles.productFallback} aria-hidden="true">{partner.symbol}</span>}
     <span className={styles.productIndex}>{String(i+1).padStart(2,"0")}</span>
    </div>
    <div className={styles.productBody}>
     <small className={styles.productRetailer}>{partner.name} <span>·</span> source-eligible item</small>
     <strong>{p.title}</strong>
     {p.description&&<p>{p.description.length>135?p.description.slice(0,135).trimEnd()+"…":p.description}</p>}
     <div className={styles.productBottom}><span className={styles.itemPrice}>{gbp(p.price)}<small>Item price, delivery may be extra</small></span>
      <span className={styles.productArrow} aria-hidden="true">↗</span></div>
     <span className={styles.productObserved}>Source observed {stamp(p.observedAt)}</span>
    </div>
   </Link>)}
  </div>
  <p className={styles.shelfFine}>Shelf order follows recently verified eligible source offers. Retailer commissions do not determine AVUQO Score or independent organic comparisons. Photos appear only where the existing source evidence permits them.</p>
 </section>;
}

export function PartnerStudioInvitation({partner}:{partner:Partner}){
 return <aside className={styles.invitation} aria-label="Supplier collaboration invitation">
  <div><p className={styles.eyebrow}>For the people behind the products</p>
   <h2>Make this {partner.name} studio even more useful.</h2>
   <p>Are you part of the supplier team? AVUQO welcomes accurate product specifications, approved photographs, current campaign details and corrections. We review rights and evidence before showing them; no brand controls or paid placements alter independent rankings.</p>
  </div><div className={styles.inviteActions}><Link href="/contact">Share approved material <span aria-hidden="true">↗</span></Link>
   <Link href="/advertise">About AVUQO partnerships</Link></div>
 </aside>;
}
