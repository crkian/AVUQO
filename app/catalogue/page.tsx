import Link from "next/link";
import {Suspense} from "react";
import {connection} from "next/server";
import type {Metadata} from "next";
import {ArrowRight,CheckCircle2,Compass,Grid3X3,Search,ShieldCheck,ShoppingBag,Store} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,DEPARTMENT_GROUPS} from "../../lib/categories/browse-tree";
import {verifiedProductIndex,type PublicOffer,type PublicProduct} from "../../lib/products/public-catalog";
import {cardDescription} from "../../lib/products/listing-description";
import styles from "./page.module.css";

export const metadata:Metadata={
 title:"The AVUQO Catalogue | Products, retailers, services and all 25 departments",
 description:"One catalogue for verified products, participating shops, services, and all 25 original AVUQO shopping categories.",
 alternates:{canonical:"/catalogue"}
};
const entryPoints=[
 {href:"/products",title:"Shop products",copy:"Browse eligible listings, independent guides and offers",Icon:ShoppingBag},
 {href:"/partners",title:"Browse retailers",copy:"Find every participating advertiser and its own shop page",Icon:Store},
 {href:"/categories",title:"Explore categories",copy:"Keep all 25 familiar shopping departments and topics",Icon:Grid3X3}
] as const;
const otherJourneys=[
 {href:"/sales",name:"Sales & promotions",detail:"Verified savings and separately identified advertiser campaigns",icon:"%"},
 {href:"/groceries",name:"Groceries & supermarket baskets",detail:"Build a list; see price coverage and gaps clearly",icon:"⌗"},
 {href:"/mobile",name:"Phones & SIM plans",detail:"Handsets, PAYG and mobile providers, with full-cost guidance",icon:"📱"},
 {href:"/broadband",name:"Broadband & connectivity",detail:"Providers, availability, total contracts and switching",icon:"◎"},
 {href:"/travel",name:"Travel & airport extras",detail:"Trips, lounges, parking and booking-service partners",icon:"✈"},
 {href:"/tyres/shop",name:"Tyres",detail:"Exact sizes and approved specialist listings",icon:"◉"},
 {href:"/tools",name:"Tools & DIY",detail:"Approved equipment from verified sources",icon:"⚙"},
 {href:"/services",name:"Everyday services",detail:"Discover providers and request accurate quotes",icon:"◆"},
 {href:"/lists",name:"Shopping lists",detail:"Save and organise the things you need",icon:"✓"}
] as const;
type ProductEntry={product:PublicProduct;offers:PublicOffer[]};
const money=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value);
function varied(items:ProductEntry[],limit:number):ProductEntry[]{
 const groups=new Map<string,ProductEntry[]>();
 for(const item of items){
  const groupName=(item.offers[0]?.published.category??"Other").split(/[>›/]/)[0].trim().toLowerCase()||"other";
  const group=groups.get(groupName)??[];group.push(item);groups.set(groupName,group);
 }
 const picked:ProductEntry[]=[];
 while(picked.length<limit&&[...groups.values()].some(group=>group.length)){
  for(const group of groups.values()){
   const next=group.shift();if(next)picked.push(next);
   if(picked.length>=limit)break;
  }
 }
 return picked;
}
async function VerifiedCatalogueShelf(){
 await connection();
 const items=varied(await verifiedProductIndex(48),12);
 return <section className={styles.productSection} aria-labelledby="catalogue-verified-heading">
  <div className="shell">
   <div className={styles.heading}><div><p className={styles.eyebrow}>Real retailer shopping</p>
    <h2 id="catalogue-verified-heading">{items.length?"A few eligible finds. Plenty more to discover.":"We only display offers that pass the checks."}</h2>
    <p>These are approved, current product pages. They do not represent every private feed item or imply that every retailer has a live price feed.</p>
   </div><Link href="/products">All eligible product listings <ArrowRight size={17}/></Link></div>
   {items.length?<div className={styles.productGrid}>{items.map(({product,offers})=>{
    const best=[...offers].sort((a,b)=>Number(a.offer.price)-Number(b.offer.price))[0];
    if(!best)return null;
    const approvedImage=offers.find(item=>item.published.image_url)?.published.image_url;
    return <Link href={"/products/"+product.slug} key={product.id} className={styles.productCard}>
     <span className={styles.imageWrap}>{approvedImage?
      <span role="img" className={styles.approvedImage} aria-label={"Approved product photo for "+product.canonical_title} style={{backgroundImage:`url("${approvedImage}")`}}/>:
      <ShoppingBag size={35} aria-hidden="true"/>}</span>
     <span className={styles.productCopy}>
      <small>{product.brand??best.published.merchant}</small>
      <strong>{product.canonical_title}</strong>
      <span>{cardDescription(product.description,120)}</span>
      <small>{best.published.merchant} · {offers.length} eligible {offers.length===1?"offer":"offers"}</small>
      <b>{money(Number(best.offer.price))} <small>plus delivery if applicable</small></b>
     </span>
    </Link>;
   })}</div>:<div className={styles.empty}><ShieldCheck size={28}/><p>Source permissions and product evidence are checked together. Browse the existing categories while eligible retailer prices are prepared.</p><Link href="/categories">Explore categories <ArrowRight size={16}/></Link></div>}
  </div>
 </section>;
}
export default function UnifiedCatalogue(){
 return <><Header/><main className={styles.page}>
  <section className={styles.hero}><div className="shell">
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">AVUQO</Link><span>/</span> Catalogue</nav>
   <p className={styles.eyebrow}><Compass size={15}/> Your AVUQO shopping atlas</p>
   <h1>Find your kind of <em>worth it.</em></h1>
   <p className={styles.heroText}>The AVUQO experience you know, with two connected catalogues: <strong>everything we offer</strong> and <strong>the shops and services behind it</strong>. Your categories stay just as they are.</p>
   <form className={styles.search} action="/search" method="get" role="search">
    <Search size={19} aria-hidden="true"/><input type="search" name="q" placeholder="Search products, shops, categories or ideas" aria-label="Search the AVUQO catalogue" maxLength={120} required/>
    <button type="submit">Search <ArrowRight size={16}/></button>
   </form>
   <p className={styles.trust}><CheckCircle2 size={16}/> Same AVUQO product checks <span>·</span><CheckCircle2 size={16}/> No invented retailer prices</p>
  </div></section>
  <section className={styles.entrySection} aria-label="Choose how to browse"><div className="shell">
   <div className={styles.entryGrid}>{entryPoints.map(({href,title,copy,Icon},i)=><Link className={styles.entryCard} href={href} key={href} data-entry={i}>
    <span className={styles.entryIcon}><Icon size={24}/></span><strong>{title}</strong><small>{copy}</small><span className={styles.entryAction}>Explore <ArrowRight size={17}/></span>
   </Link>)}</div>
  </div></section>
  <Suspense fallback={<div className={styles.loading}>Checking eligible product listings…</div>}><VerifiedCatalogueShelf/></Suspense>
  <section className={styles.departments} aria-labelledby="catalogue-departments-heading"><div className="shell">
   <div className={styles.heading}><div><p className={styles.eyebrow}>Your original categories</p><h2 id="catalogue-departments-heading">All 25 departments. Nothing lost.</h2>
    <p>Every category, editorial destination and specialist product showroom remains in place. A category with no verified offers is not represented as having stock.</p>
   </div><Link href="/categories">Full interactive category explorer <ArrowRight size={16}/></Link></div>
   {DEPARTMENT_GROUPS.map(group=><div className={styles.departmentGroup} key={group.label}>
    <h3>{group.label}</h3>
    <div className={styles.departmentGrid}>{group.slugs.map(slug=>{
     const department=BROWSE_DEPARTMENTS.find(d=>d.slug===slug);
     if(!department)return null;
     return <Link key={department.slug} href={"/categories/"+department.slug+"/products"} className={styles.departmentCard} data-tone={department.theme}>
      <strong>{department.name}</strong><span>{department.intro}</span><small>Browse products and guides <ArrowRight size={15}/></small>
     </Link>;
    })}</div>
   </div>)}
  </div></section>
  <section className={styles.services} aria-labelledby="catalogue-more-heading"><div className="shell">
   <div className={styles.heading}><div><p className={styles.eyebrow}>Beyond the product shelves</p>
    <h2 id="catalogue-more-heading">Everything else AVUQO helps you do.</h2>
    <p>Product shopping, supermarket baskets, service comparisons and travel bookings are different journeys under the same AVUQO identity.</p>
   </div><Link href="/partners">Browse participating advertisers <ArrowRight size={16}/></Link></div>
   <div className={styles.serviceGrid}>{otherJourneys.map(item=><Link key={item.href} href={item.href} className={styles.serviceCard}>
    <span aria-hidden="true">{item.icon}</span><strong>{item.name}</strong><small>{item.detail}</small><b>Explore <ArrowRight size={15}/></b>
   </Link>)}</div>
   <div className={styles.disclosure}><ShieldCheck size={17}/> An advertiser relationship is not evidence of a current price or the cheapest market offer. Product, tariff and booking comparisons only use reliable like-for-like information with required rights and permissions.</div>
  </div></section>
 </main><Footer/></>;
}
