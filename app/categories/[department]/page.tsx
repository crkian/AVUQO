import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowRight,ChevronRight,Search,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,departmentBySlug,departmentHref,topicHref} from "../../../lib/categories/browse-tree";
import {departmentBlueprint,departmentHref as productHref} from "../../../lib/products/department-showrooms";
import styles from "./department.module.css";
import CategoryJourneys from "../../../components/marketplace/CategoryJourneys";
type Params={params:Promise<{department:string}>};
export function generateStaticParams(){
 return BROWSE_DEPARTMENTS.filter(d=>!d.landing).map(d=>({department:d.slug}));
}
export async function generateMetadata({params}:Params):Promise<Metadata>{
 const {department}=await params;
 const item=departmentBySlug(department);
 if(!item||item.landing)return {title:"Department unavailable",robots:{index:false,follow:false}};
 return {title:item.name+" | AVUQO Department",description:item.intro,
  alternates:{canonical:"/categories/"+item.slug}};
}
export default async function DepartmentPage({params}:Params){
 const {department}=await params;
 const item=departmentBySlug(department);
 if(!item||item.landing)notFound();
 const blueprint=departmentBlueprint(department);
 if(!blueprint)notFound();
 const other=BROWSE_DEPARTMENTS.filter(d=>d.slug!==item.slug&&d.theme===item.theme).slice(0,4);
 return <main className={styles.page} data-tone={item.theme}>
  <Header/>
  <section className={styles.hero}>
   <div className="shell">
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
     <Link href="/">Home</Link><ChevronRight size={14}/><Link href="/categories">Categories</Link>
     <ChevronRight size={14}/><span>{item.name}</span>
    </nav>
    <div className={styles.heroGrid}>
     <div className={styles.copy}>
      <h1>{item.name}</h1>
      <p className={styles.intro}>{item.intro}</p>
      <p className={styles.important}><ShieldCheck size={20}/> {item.advice}</p>
      <Link className={styles.directory} href={productHref(item)}>Browse {item.name} products <ArrowRight size={16}/></Link>
     </div>
     <div className={styles.art} style={{backgroundImage:`url("${blueprint.visual}")`}} aria-hidden="true"/>
    </div>
   </div>
  </section>
  <section className={"shell "+styles.section} aria-labelledby="subcategories">
   <div className={styles.heading}>
    <h2 id="subcategories">Explore {item.name}</h2>
   </div>
   <div className={styles.grid}>
    {item.topics.map(topic=><Link key={topic} className={styles.topicCard} href={topicHref(topic)}>
     <span>{topic}</span><ArrowRight size={17} aria-hidden="true"/>
    </Link>)}
   </div>
   <div className={styles.checks}>
    <h2>{blueprint.focus}</h2>
    <ul>{blueprint.checklist.map(point=><li key={point}><ShieldCheck size={17} aria-hidden="true"/>{point}</li>)}</ul>
   </div>
  </section>
  <section className={styles.searchSection}>
   <div className={"shell "+styles.searchInner}>
    <div><p className={styles.kicker}>Find what matters</p><h2>Looking for something specific?</h2>
     <p>Search AVUQO&apos;s checked listings and editorial destinations. If no verified results exist, we&apos;ll tell you rather than invent offers.</p>
    </div>
    <form action="/search" method="get" role="search"><Search size={18}/>
     <input name="q" maxLength={120} placeholder={"Search "+item.name.toLowerCase()+" ideas"} aria-label={"Search "+item.name} required/>
     <button type="submit">Search</button></form>
   </div>
  </section>
  {other.length>0&&<section className={"shell "+styles.related}>
    <h2>Continue exploring</h2><div>{other.map(d=><Link key={d.slug} href={departmentHref(d)}>{d.name}<ArrowRight size={15}/></Link>)}</div>
   </section>}
  <CategoryJourneys slug={item.slug}/>
  <Footer/>
 </main>;
}
