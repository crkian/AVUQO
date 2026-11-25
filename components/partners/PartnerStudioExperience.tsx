import Link from "next/link";
import {createElement,type CSSProperties} from "react";
import {ArrowDownRight,ArrowRight,ArrowUpRight,CheckCircle2,ShieldCheck} from "lucide-react";
import {sceneIcon} from "./StudioGlyph";
import type {Partner,PartnerLink} from "../../lib/partners/advertiser-directory";
import {isApprovedPartnerLink} from "../../lib/partners/advertiser-directory";
import {matchStudioChapters,type StudioEditorial} from "../../lib/partners/studio-editorial";
import styles from "../../app/partners/studios.module.css";

export type StudioProduct={
 id:string;slug:string;title:string;brand:string|null;description:string|null;
 imageUrl:string|null;price:number;observedAt:string|null;merchant:string;detailHref?:string;
};
const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
const stamp=(date:string|null)=>date&&Number.isFinite(Date.parse(date))
 ?new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"})
 :"Date unavailable";
const safePartnerDestination=(links:readonly PartnerLink[])=>
 links.find(l=>l.kind==="approved_awin"&&isApprovedPartnerLink(l))??
 links.find(l=>isApprovedPartnerLink(l));
const byChapter=(products:StudioProduct[],chapter:StudioEditorial["chapters"][number])=>
 products.filter(p=>matchStudioChapters(p.title,[chapter]).length>0);
const productHref=(p:StudioProduct)=>p.detailHref??"/products/"+p.slug;

export function PartnerStudioHero({partner,studio,products,links}:{partner:Partner;studio:StudioEditorial;products:StudioProduct[];links:readonly PartnerLink[]}){
 const photos=products.filter(p=>p.imageUrl).slice(0,3);
 const heroImage=photos[0];
 const primary=safePartnerDestination(links);
 const Icon=sceneIcon(studio.scene);
 const theme={"--accent":partner.accent,"--deep":partner.deep,"--glow":partner.glow} as CSSProperties;
 return <section className={styles.hero} style={theme} data-scene={studio.scene} data-images={heroImage?"verified":"editorial"} aria-labelledby="partner-studio-title">
  <div className={styles.heroShell}>
   <nav className={styles.crumbs} aria-label="Breadcrumb">
    <Link href="/">AVUQO</Link><span aria-hidden="true">/</span>
    <Link href="/partners">The retail park</Link><span aria-hidden="true">/</span>
    <span aria-current="page">{partner.name}</span>
   </nav>
   <div className={styles.heroGrid}>
    <div className={styles.heroCopy}>
     <div className={styles.heroEdition}><span className={styles.editionDash}/><span>{studio.stamp}</span><span className={styles.editionDivider}>/</span><span>{studio.edition}</span></div>
     <p className={styles.micro}>AN AVUQO RETAIL STUDIO <span>·</span> INDEPENDENTLY CURATED</p>
     <h1 id="partner-studio-title">{partner.name}</h1>
     <div className={styles.heroStatement}><span className={styles.statementLine}/><p>{partner.tagline}</p></div>
     <p className={styles.lead}>{studio.lead}</p>
     <p className={styles.description}>{partner.description}</p>
     <div className={styles.heroActions}>
      {products.length>0?
       <a className={styles.primary} href="#source-products">Explore the product edit <ArrowUpRight size={17} aria-hidden="true"/></a>:
       <a className={styles.primary} href="#studio-notebook">Explore the buying guide <ArrowDownRight size={17} aria-hidden="true"/></a>}
      {primary&&<a className={styles.secondary} href={primary.href} target="_blank" rel={primary.kind==="approved_awin"?"sponsored noopener noreferrer":"noopener noreferrer"}>
       {primary.kind==="approved_awin"?"Partner campaign":"Visit supplier"} <ArrowUpRight size={15} aria-hidden="true"/>
      </a>}
     </div>
     <div className={styles.heroAssurance}><ShieldCheck size={16} aria-hidden="true"/><span>Independent AVUQO editorial. Product claims and prices require their own source evidence.</span></div>
    </div>
    <div className={styles.heroArtwork} data-scene={studio.scene} aria-label={heroImage?"Currently verified supplier product gallery":"Original AVUQO editorial artwork"}>
     <div className={styles.artGrid} aria-hidden="true"/>
     <div className={styles.artNumber} aria-hidden="true">{studio.stamp.replace("EDITION ","").split(" ")[0]}</div>
     <div className={styles.artHeadline} aria-hidden="true">{studio.heroWord}</div>
     {heroImage?.imageUrl?
      <div className={styles.heroPhoto}>
       <img src={heroImage.imageUrl} alt={heroImage.title} referrerPolicy="no-referrer" loading="eager"/>
       <Link href={productHref(heroImage)} className={styles.photoCaption}>
        <small><CheckCircle2 size={13} aria-hidden="true"/> VERIFIED RETAILER ITEM</small>
        <strong>{heroImage.title}</strong><span>{gbp(heroImage.price)} <ArrowUpRight size={15} aria-hidden="true"/></span>
        <em>Item price. Delivery may be extra.</em>
       </Link>
      </div>:
      <div className={styles.illustration} aria-hidden="true">
       <div className={styles.illustrationHalo}/>{createElement(Icon,{strokeWidth:.65,size:186,className:styles.illustrationIcon})}
       <span className={styles.illustrationFolio}>{studio.edition}</span>
      </div>}
     {photos[1]?.imageUrl&&<Link href={productHref(photos[1])} className={styles.secondPhoto} aria-label={"Explore "+photos[1].title}>
      <img src={photos[1].imageUrl} alt="" referrerPolicy="no-referrer" loading="lazy"/>
     </Link>}
     {photos[2]?.imageUrl&&<Link href={productHref(photos[2])} className={styles.thirdPhoto} aria-label={"Explore "+photos[2].title}>
      <img src={photos[2].imageUrl} alt="" referrerPolicy="no-referrer" loading="lazy"/>
     </Link>}
     <div className={styles.sceneTag}><span>AVUQO / {studio.edition}</span><strong>{studio.heroWord}</strong></div>
    </div>
   </div>
   <div className={styles.heroFoot}>
    <div><span className={styles.heroFootLine}/><span>DISCOVER WHAT&apos;S WORTH IT</span></div>
    <div><span>STUDIO NOTES</span><ArrowDownRight size={19} aria-hidden="true"/></div>
   </div>
  </div>
 </section>;
}

export function PartnerStudioNavigation({partner,products}:{partner:Partner;products:StudioProduct[]}){
 return <nav className={styles.studioNavigation} aria-label={partner.name+" studio sections"}>
  <div className={styles.navShell}>
   <span className={styles.navIdentity}>THE <strong>{partner.name}</strong> EDIT</span>
   <div className={styles.navLinks}>
    <a href="#studio-notebook">The edit <span>01</span></a>
    <a href="#source-products">{products.length?"Shop products":"Product evidence"} <span>02</span></a>
    <a href="#partner-department-navigation">Explore further <span>03</span></a>
    <a href="#supplier-contribute">For suppliers <span>04</span></a>
   </div>
  </div>
 </nav>;
}

export function PartnerStudioNotebook({partner,studio,products}:{partner:Partner;studio:StudioEditorial;products:StudioProduct[]}){
 const Icon=sceneIcon(studio.scene);
 return <section className={styles.notebook} id="studio-notebook" aria-labelledby="studio-notebook-title">
  <div className={styles.storyPanel}>
   <p className={styles.eyebrow}>01 <span>/</span> THE AVUQO EDIT</p>
   <div className={styles.storyOrnament} aria-hidden="true">{createElement(Icon,{size:45,strokeWidth:1})}<span>{studio.heroWord}</span></div>
   <h2 id="studio-notebook-title">{studio.storyTitle}</h2>
   <p>{studio.story}</p>
   <Link href={partner.categoryHref}>Explore {partner.categoryLabel} <ArrowUpRight size={16} aria-hidden="true"/></Link>
   <div className={styles.storyWatermark} aria-hidden="true">{studio.heroWord}</div>
  </div>
  <div className={styles.chapterPanel}>
   <div className={styles.chapterHeader}><p className={styles.eyebrow}>FIELD NOTES <span>/</span> A SHORT BUYING GUIDE</p><h2>{studio.chapterHeading}</h2></div>
   <div className={styles.chapterGrid}>
    {studio.chapters.map((chapter,i)=>{
     const matches=byChapter(products,chapter);
     const anchor=matches.length?"#source-products":partner.categoryHref;
     return <article className={styles.chapter} key={chapter.title}>
      <span className={styles.chapterNumber}>0{i+1}</span>
      <div><h3>{chapter.title}</h3><p>{chapter.detail}</p></div>
      {matches.length>0&&<div className={styles.chapterProducts} aria-label={"Eligible products for "+chapter.title}>
       {matches.slice(0,2).map(product=><Link href={productHref(product)} key={product.id} className={styles.chapterProduct}>
        {product.imageUrl?<img src={product.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer"/>:
         <span aria-hidden="true">{createElement(Icon,{size:20})}</span>}
        <span>{product.title}</span>
       </Link>)}
      </div>}
      {matches.length>0?<a href={anchor}>{matches.length} currently verified {matches.length===1?"item":"items"} <ArrowUpRight size={15} aria-hidden="true"/></a>:
       <Link href={anchor}>Explore the wider category <ArrowUpRight size={15} aria-hidden="true"/></Link>}
     </article>;
    })}
   </div>
  </div>
 </section>;
}

export function PartnerStudioProducts({partner,studio,products}:{partner:Partner;studio:StudioEditorial;products:StudioProduct[]}){
 const Icon=sceneIcon(studio.scene);
 if(products.length===0)return <section className={styles.emptyProducts} id="source-products" aria-label="Product publication status">
  <div className={styles.emptyArt} aria-hidden="true"><div className={styles.emptyArtIcon}>{createElement(Icon,{size:90,strokeWidth:.85})}</div><span>{studio.heroWord}</span></div>
  <div className={styles.emptyCopy}>
   <p className={styles.eyebrow}>02 <span>/</span> THE PRODUCT EDIT</p>
   <h2>Every product needs its proof.</h2>
   <p className={styles.emptyLead}>This studio has its own buying guide while we check which individual supplier offers qualify for the public shopping shelf.</p>
   <p className={styles.emptyExplanation}>No matching offer currently passes AVUQO&apos;s complete public price, stock, source-rights, exact-identity and owner-release checks. This does not imply the advertiser has no products or that its programme was declined.</p>
   <Link href={partner.categoryHref}>Discover {partner.categoryLabel} <ArrowUpRight size={16} aria-hidden="true"/></Link>
  </div>
 </section>;
 const featured=products.slice(0,12);
 const merchant=products[0]!.merchant;
 const href=partner.advertiserId&&(partner.kind==="retail"||partner.slug==="mozillion")?"/shop/retail?merchant="+encodeURIComponent(partner.slug):"/shop?merchant="+encodeURIComponent(merchant);
 return <section className={styles.shopping} id="source-products" aria-labelledby="source-products-title">
  <div className={styles.shoppingHeader}>
   <div><p className={styles.eyebrow}>02 <span>/</span> SOURCED AND CHECKED</p>
    <h2 id="source-products-title">The product edit<span className={styles.headingPeriod}>.</span></h2>
    <p>Real, individually eligible products from {partner.name}. This is a curated window into the current AVUQO-approved shelf, not every item in a private supplier feed.</p>
   </div>
   <Link href={href} className={styles.shopAll}>Explore more from this retailer <ArrowUpRight size={16} aria-hidden="true"/></Link>
  </div>
  <div className={styles.productGrid}>
   {featured.map((p,i)=><Link className={styles.productCard} href={productHref(p)} key={p.id}>
    <div className={styles.productImage}>
     {p.imageUrl?<img loading="lazy" referrerPolicy="no-referrer" src={p.imageUrl} alt={p.title}/>:
      <span className={styles.productFallback} aria-hidden="true"><Icon size={76} strokeWidth={.8}/></span>}
     <span className={styles.productIndex}>{String(i+1).padStart(2,"0")}</span>
     {i===0&&<span className={styles.spotlightLabel}>THE CURRENT SPOTLIGHT <ArrowUpRight size={13} aria-hidden="true"/></span>}
    </div>
    <div className={styles.productBody}>
     <small className={styles.productRetailer}>{partner.name} <span>/</span> SOURCE-ELIGIBLE ITEM</small>
     <strong>{p.title}</strong>
     {p.description&&<p>{p.description.length>135?p.description.slice(0,135).trimEnd()+"…":p.description}</p>}
     <div className={styles.productBottom}><span className={styles.itemPrice}>{gbp(p.price)}<small>Item price, delivery may be extra</small></span>
      <span className={styles.productArrow}><ArrowUpRight size={20} aria-hidden="true"/></span></div>
     <span className={styles.productObserved}>Source observed {stamp(p.observedAt)}</span>
    </div>
   </Link>)}
  </div>
  <p className={styles.shelfFine}><ShieldCheck size={15} aria-hidden="true"/> Current source-eligible offers only. Commission does not influence AVUQO Score or independent organic comparisons. Images are shown only where existing source rights permit.</p>
 </section>;
}

export function PartnerStudioInvitation({partner}:{partner:Partner}){
 return <aside className={styles.invitation} id="supplier-contribute" aria-label="Supplier collaboration invitation">
  <div className={styles.inviteDecor} aria-hidden="true">YOUR BRAND<br/>ON AVUQO<span>↗</span></div>
  <div className={styles.invitationInner}><p className={styles.eyebrow}>04 <span>/</span> FOR THE PEOPLE BEHIND THE PRODUCTS</p>
   <h2>Help tell the {partner.name} story<span>.</span></h2>
   <p>Work with AVUQO to make your studio more useful: share approved product photographs, accurate specifications, campaign material and corrections. Every asset is reviewed for rights and accuracy. Supplier input never buys a better independent ranking.</p>
   <div className={styles.inviteActions}><Link href="/contact">Share approved material <ArrowUpRight size={16} aria-hidden="true"/></Link>
    <Link href="/advertise">How partnerships work <ArrowRight size={16} aria-hidden="true"/></Link></div>
  </div>
 </aside>;
}
