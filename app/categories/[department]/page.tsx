import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowRight,ChevronRight,Search,ShieldCheck} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import {BROWSE_DEPARTMENTS,departmentBySlug,departmentHref,topicHref} from "../../../lib/categories/browse-tree";
import styles from "./department.module.css";
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
      <p className={styles.kicker}>AVUQO department guide</p>
      <h1>{item.name}</h1>
      <p className={styles.intro}>{item.intro}</p>
      <p className={styles.important}><ShieldCheck size={20}/> {item.advice}</p>
      <Link className={styles.directory} href="/categories">Explore all 25 departments <ArrowRight size={16}/></Link>
     </div>
     <div className={styles.art} aria-hidden="true"><span>{item.name.charAt(0)}</span><div>Discover • Consider • Compare</div></div>
    </div>
   </div>
  </section>
  <section className={"shell "+styles.section} aria-labelledby="subcategories">
   <div className={styles.heading}>
    <div><p className={styles.kicker}>Find your next direction</p>
     <h2 id="subcategories">Explore {item.name.toLowerCase()}</h2>
     <p>Choose a topic to search AVUQO for eligible products or relevant information. A topic is not proof of live inventory.</p>
    </div><span>{item.topics.length} browse topics</span>
   </div>
   <div className={styles.grid}>
    {item.topics.map((topic,index)=><Link key={topic} className={styles.topicCard} href={topicHref(topic)}>
     <div className={styles.topicArt} aria-hidden="true"><span>{String(index+1).padStart(2,"0")}</span><b>{["✦","◈","◇","✳"][index%4]}</b></div>
     <div className={styles.topicCopy}><h3>{topic}</h3><span>Explore this topic <ArrowRight size={15}/></span></div>
    </Link>)}
   </div>
   <p className={styles.note}><ShieldCheck size={17}/> This directory uses curated search prompts. We do not advertise inactive taxonomy as stocked products or verified prices.</p>
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
  <Footer/>
 </main>;
}
