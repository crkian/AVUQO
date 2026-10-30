import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,Compass,Search,ShieldCheck} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {lifestyleOrder,lifestylePages} from "../../lib/lifestyle/landing-data";
import {storyFor,storySearchHref} from "../../lib/lifestyle/category-story";
import styles from "./page.module.css";
import DepartmentExplorer from "../../components/categories/DepartmentExplorer";
export const metadata:Metadata={
 title:"Explore Categories | AVUQO",
 description:"Find distinctive AVUQO departments, from technology and home to gifts and travel. Offers appear only after verification.",
 alternates:{canonical:"/categories"}
};
const makeTitle=(slug:string)=>({
 tech:"Technology",home:"Home & Living",toys:"Toys & Play",experiences:"Experiences & Days Out",
 shopping:"Shopping",motoring:"Motoring",travel:"Travel",gifts:"Gifts",beauty:"Beauty",fashion:"Fashion"
} as Record<string,string>)[slug]??slug;
const journeys=[
 {label:"Groceries",href:"/groceries",summary:"Build your basket and see which supermarket prices are supported.",symbol:"⌗"},
 {label:"Pets",href:"/pets",summary:"Care essentials, feeders, fountains and thoughtful pet products.",symbol:"♧"},
 {label:"Christmas",href:"/christmas",summary:"Seasonal inspiration, gifts and considered festive planning.",symbol:"✳"},
 {label:"Compare",href:"/compare",summary:"Look beyond headline contract prices to the full cost.",symbol:"∑"}
];
export default function CategoriesPage(){return <main className={styles.page}>
 <Header/>
 <section className={styles.hero}>
  <div className="shell">
   <p className={styles.eyebrow}><Compass size={16}/> The AVUQO category atlas</p>
   <h1>Every interest deserves <em>its own world.</em></h1>
   <p>From useful technology to thoughtful gifts and life&apos;s bigger adventures, explore destinations with their own personality, questions and buying guidance.</p>
   <form className={styles.search} action="/search" method="get" role="search">
    <Search size={20}/><input name="q" maxLength={120} aria-label="Search AVUQO" placeholder="What would you like to discover?" required/><button>Search <ArrowRight size={16}/></button>
   </form>
   <nav aria-label="Search inspiration" className={styles.searchIdeas}><span>Try</span>
    {["mechanical keyboard","storage ideas","creative gifts","skincare"].map(q=>
     <Link href={storySearchHref(q)} key={q}>{q}</Link>)}
   </nav>
  </div>
 </section>
 <section className={"shell "+styles.directorySection} aria-label="Full department browser"><DepartmentExplorer/></section>
 <section className={"shell "+styles.section} aria-labelledby="department-title">
  <div className={styles.heading}><p className={styles.eyebrow}>Choose a department</p>
   <h2 id="department-title">A world for every way you shop.</h2>
   <p>Distinct stories, practical questions and discovery paths, all rooted in the same AVUQO independence.</p></div>
  <div className={styles.grid}>
   {lifestyleOrder.map((slug,index)=>{
    const page=lifestylePages[slug],story=storyFor(slug);
    return <Link href={"/"+slug} key={slug} className={styles.card} data-tone={story?.energy??"warm"}>
     <div className={styles.photo} style={{backgroundImage:'linear-gradient(180deg,transparent 35%,rgba(0,0,0,.27) 100%),url("'+page.hero+'")'}} aria-hidden="true">
      <span>{String(index+1).padStart(2,"0")}</span>
     </div>
     <div className={styles.cardCopy}>
      <p>{story?.identity??page.eyebrow}</p><h3>{makeTitle(slug)}</h3>
      <span>{story?.strapline??page.intro}</span>
      <strong>Explore the category <ArrowRight size={16}/></strong>
     </div>
    </Link>;
   })}
  </div>
 </section>
 <section className={styles.more}>
  <div className="shell">
   <div className={styles.heading}><p className={styles.eyebrow}>More useful journeys</p><h2>Explore beyond the shelves.</h2>
    <p>Shop with clarity, plan ahead and compare the details that shape a decision.</p></div>
   <div className={styles.moreGrid}>
    {journeys.map((item,i)=><Link href={item.href} key={item.href} data-tone={i} className={styles.moreCard}>
      <span aria-hidden="true">{item.symbol}</span><h3>{item.label}</h3><p>{item.summary}</p>
      <strong>Explore <ArrowRight size={16}/></strong>
    </Link>)}
   </div>
   <p className={styles.disclosure}><ShieldCheck size={16}/> Illustrative category photography is not an available or endorsed product. Merchant prices and offers appear only after source verification.</p>
  </div>
 </section>
 <Footer/>
</main>}