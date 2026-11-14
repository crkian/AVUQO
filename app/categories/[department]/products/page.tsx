import Link from "next/link";
import {Suspense} from "react";
import type {Metadata} from "next";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {ArrowRight,CheckCircle2,Search,ShieldCheck,ShoppingBag} from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,departmentBySlug,departmentHref as editorialHref}
 from "../../../../lib/categories/browse-tree";
import {verifiedProductIndex} from "../../../../lib/products/public-catalog";
import {departmentBlueprint,eligibleDepartmentProduct} from "../../../../lib/products/department-showrooms";
import styles from "./page.module.css";

type Props={params:Promise<{department:string}>};
export function generateStaticParams(){
 return BROWSE_DEPARTMENTS.map(d=>({department:d.slug}));
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const d=departmentBlueprint((await params).department);
 return d?{title:d.name+" | Verified products | AVUQO",
  description:"Explore "+d.name+" products only when exact variants and current authorised retailer offers are approved.",
  alternates:{canonical:"/categories/"+d.slug+"/products"},
  robots:{index:false,follow:true}}:
  {title:"Department unavailable",robots:{index:false,follow:false}};
}
async function DepartmentGoods({department}:{department:string}){
 await connection();
 const d=departmentBlueprint(department);
 if(!d)notFound();
 const editorial=departmentBySlug(department);
 const verified=await verifiedProductIndex(120);
 const matching=verified.filter(item=>eligibleDepartmentProduct(d,item));
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
  <section className={"shell "+styles.content}>
   <div className={styles.heading}><div>
    <h2>{d.name} listings</h2>
    <p>We show retailer offers after checking the product variant, price evidence and merchant permissions.</p></div>
    <span className={styles.status}><ShieldCheck size={17}/>{matching.length} eligible {matching.length===1?"product":"products"}</span></div>
   {matching.length?<div className={styles.goodsGrid}>{matching.map(({product,offers})=>{
    const approvedImage=offers.find(o=>o.published.image_url)?.published.image_url;
    return <Link className={styles.item} key={product.id} href={"/products/"+product.slug}>
     <div className={styles.art}>{approvedImage?<img src={approvedImage} alt={product.canonical_title} referrerPolicy="no-referrer"/>:<ShoppingBag size={45} aria-hidden="true"/>}</div>
     <div className={styles.itemBody}><p>{product.brand??"Product guide"}</p><h3>{product.canonical_title}</h3>
      <span>{offers.length} approved {offers.length===1?"retailer offer":"retailer offers"}</span>
      <strong>Examine exact product <ArrowRight size={15}/></strong></div>
    </Link>;
   })}</div>:
    <div className={styles.empty}><ShieldCheck size={31}/><h3>No verified listings yet</h3>
     <p>Explore buying guidance for {d.name} or search AVUQO for something specific.</p>
     <Link href={"/search?q="+encodeURIComponent(d.name)}>Search AVUQO <Search size={17}/></Link>
    </div>}
  </section>
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
