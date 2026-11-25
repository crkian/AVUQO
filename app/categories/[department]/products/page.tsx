import Link from "next/link";
import {Suspense} from "react";
import type {Metadata} from "next";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {ArrowRight,BookOpen,CheckCircle2,Search,ShieldCheck,ShoppingBag} from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,departmentBySlug,departmentHref as editorialHref}
 from "../../../../lib/categories/browse-tree";
import {ordinaryShoppingPage} from "../../../../lib/products/shopping-catalogue";
import {verifiedProductIndex} from "../../../../lib/products/public-catalog";
import {partnersForDepartment} from "../../../../lib/partners/catalogue-taxonomy";
import {cardDescription,hasObservedReduction} from "../../../../lib/products/listing-description";
import RetailerSales from "../../../../components/promotions/RetailerSales";
import DepartmentPartnerShelf from "../../../../components/partners/DepartmentPartnerShelf";
import {researchGuidesByDepartment} from "../../../../lib/products/research-guides";
import {departmentBlueprint,eligibleDepartmentProduct} from "../../../../lib/products/department-showrooms";
import styles from "./page.module.css";

type Props={params:Promise<{department:string}>};
export function generateStaticParams(){
 return BROWSE_DEPARTMENTS.map(d=>({department:d.slug}));
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const d=departmentBlueprint((await params).department);
 return d?{title:d.name+" | Products and buying guides | AVUQO",
  description:"Research "+d.name+" models and see live retailer offers only after eligibility and permission checks.",
  alternates:{canonical:"/categories/"+d.slug+"/products"},
  robots:{index:false,follow:true}}:
  {title:"Department unavailable",robots:{index:false,follow:false}};
}
async function DepartmentGoods({department}:{department:string}){
 await connection();
 const d=departmentBlueprint(department);
 if(!d)notFound();
 const editorial=departmentBySlug(department);
 const [verified,retailPage]=await Promise.all([verifiedProductIndex(120),ordinaryShoppingPage({department})]);
 const ordinary=retailPage.offers.filter(o=>o.department===department);
 const distinctOrdinary=[...new Map(ordinary.map(o=>[o.productId,o])).values()].slice(0,18);
 const matching=verified.filter(item=>eligibleDepartmentProduct(d,item));
 const research=researchGuidesByDepartment(department);
 return <main className={styles.page} data-tone={d.theme}><Header/>
  <section className={styles.hero}>
   <div className={styles.heroPhoto} style={{backgroundImage:`url("${d.visual}")`}} aria-hidden="true"/>
   <div className={styles.heroShade} aria-hidden="true"/>
   <div className={"shell "+styles.heroInner}>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/categories">All categories</Link><span>/</span>
     <Link href={editorial?editorialHref(editorial):"/categories"}>{d.name}</Link><span>/</span><span>Products</span></nav>
    <p className={styles.kicker}>Products &amp; buying guidance</p>
    <h1>{d.name}</h1>
    <p>{d.intro}</p>
    <div className={styles.heroActions}><Link href={editorial?editorialHref(editorial):"/categories"}>Explore the department <ArrowRight size={16}/></Link>
     <Link href="#department-buying-guide">See buying guidance <ArrowRight size={16}/></Link></div>
   </div>
  </section>
  <RetailerSales category={department} placement="category"/>
  {research.length>0&&<section className={"shell "+styles.content} aria-labelledby="department-research-heading">
   <div className={styles.heading}><div><p className={styles.kicker}>Editorial research guides</p>
    <h2 id="department-research-heading">Explore individual models</h2>
    <p>These guides identify real product models and buying considerations. They do not show a live retailer offer, current price, stock, product photograph or AVUQO Score.</p></div></div>
   <div className={styles.goodsGrid}>{research.map(guide=><Link className={styles.item} key={guide.slug} href={"/products/"+guide.slug}>
    <div className={`${styles.art} ${styles.researchArt}`} aria-hidden="true"><BookOpen size={40}/></div>
    <div className={styles.itemBody}><p>{guide.brand} · Research guide</p><h3>{guide.title}</h3>
      <span>No verified retailer offers yet</span><strong>View buying questions <ArrowRight size={15}/></strong></div>
   </Link>)}</div>
  </section>}
  <section className={"shell "+styles.content}>
   <div className={styles.heading}><div>
    <h2>{d.name} listings</h2>
    <p>We show retailer offers after checking the product variant, price evidence and merchant permissions.</p></div>
    <span className={styles.status}><ShieldCheck size={17}/>{matching.length} eligible {matching.length===1?"product":"products"}</span></div>
   {matching.length?<div className={styles.goodsGrid}>{matching.map(({product,offers})=>{
    const approvedImage=offers.find(o=>o.published.image_url)?.published.image_url;
    return <Link className={styles.item} key={product.id} href={"/products/"+product.slug}>
     <div className={styles.art}>{approvedImage?<img src={approvedImage} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<ShoppingBag size={45} aria-hidden="true"/>}</div>
     <div className={styles.itemBody}><p>{product.brand??d.name} · {offers[0]?.published.category??d.name}</p><h3>{product.canonical_title}</h3>
      <span style={{display:"block",fontSize:12,lineHeight:1.6}}>{cardDescription(product.description)}</span>
      <span style={{display:"block"}}>{offers[0]?.published.merchant} · {offers.length} eligible {offers.length===1?"retailer offer":"retailer offers"}</span>
      <span style={{display:"block"}}>{hasObservedReduction(offers[0].published)?"Evidence-backed price reduction":"Regular retailer price"} · Check stock and delivery</span>
      <strong>From £{Number(offers[0].offer.total_price??offers[0].offer.price).toFixed(2)} · Examine exact product <ArrowRight size={15}/></strong></div>
    </Link>;
   })}</div>:
    <div className={styles.empty}><ShieldCheck size={31}/><h3>No verified listings yet</h3>
     <p>Explore buying guidance for {d.name} or search AVUQO for something specific.</p>
     <Link href={"/search?q="+encodeURIComponent(d.name)}>Search AVUQO <Search size={17}/></Link>
    </div>}
  </section>
  <section className={"shell "+styles.content} aria-label="Everyday retailer shopping"><div className={styles.heading}><div><h2>Shop participating retailers</h2><p>Explore independently checked ordinary shopping ranges, including products without a recorded discount. Retailer catalogues can span multiple departments.</p></div></div><div className={styles.goodsGrid}>{partnersForDepartment(department).filter(p=>p.advertiserId&&(p.kind==="retail"||p.slug==="mozillion")).map(p=><Link key={p.slug} className={styles.item} href={"/shop/retail?"+new URLSearchParams({merchant:p.slug,department}).toString()}><div className={styles.itemBody}><p>{p.categoryLabel}</p><h3>{p.name}</h3><strong>Browse retailer catalogue <ArrowRight size={15}/></strong></div></Link>)}</div><Link href={"/shop/retail?department="+encodeURIComponent(department)}>Browse all eligible products in this department <ArrowRight size={15}/></Link></section>
  {distinctOrdinary.length>0&&<section className={"shell "+styles.content}><div className={styles.heading}><div><h2>Everyday {d.name} shopping</h2><p>Preview of current source-checked products in this department. Browse the complete eligible department catalogue using the link above.</p></div></div><div className={styles.goodsGrid}>{distinctOrdinary.map(o=><Link key={o.offerId} href={"/shop/offer/"+o.offerId} className={styles.item}><div className={styles.art}>{o.gallery[0]?<img src={o.gallery[0]} alt={o.title} loading="lazy" referrerPolicy="no-referrer"/>:<ShoppingBag size={40}/>}</div><div className={styles.itemBody}><p>{o.merchantName}</p><h3>{o.title}</h3><strong>£{o.price.toFixed(2)} · View item <ArrowRight size={15}/></strong></div></Link>)}</div></section>}
  <DepartmentPartnerShelf department={department}/>
  <section className={styles.guide} id="department-buying-guide"><div className={"shell "+styles.guideGrid}>
   <div><p className={styles.kicker}>BUYING WITH CONFIDENCE</p><h2>{d.focus}</h2>
    </div>
   <ul>{d.checklist.map(point=><li key={point}><CheckCircle2 size={20}/><span>{point}</span></li>)}</ul>
  </div></section>
  <section className={"shell "+styles.disclosure}>Category pages are editorial and can be live even where suppliers are not ready. Public products require an approved identity, current eligible retailer offer, authorised commercial data and separate image rights. <Link href="/editorial-policy">How verification works</Link>.</section>
  <Footer/></main>;
}
export default async function Page({params}:Props){
 const {department}=await params;
 if(!departmentBlueprint(department))notFound();
 return <Suspense fallback={<main><Header/><p className="shell section">Checking eligible products…</p></main>}><DepartmentGoods department={department}/></Suspense>;
}
