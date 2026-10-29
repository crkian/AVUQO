import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { lifestylePages, lifestyleOrder } from "../../lib/lifestyle/landing-data";
import styles from "./page.module.css";

export const metadata:Metadata = {title:"Explore categories",description:"Discover AVUQO shopping, travel, home, tech, pets, Christmas and other editorial categories.",alternates:{canonical:"/categories"}};
const extras=[
  {title:"Pets",copy:"Feeders, fountains, supplies and gifts.",href:"/pets",image:"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80"},
  {title:"Christmas",copy:"Gift ideas and festive shopping.",href:"/christmas",image:"https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80"},
  {title:"Groceries",copy:"Shopping lists and supported supermarket comparisons.",href:"/groceries",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"},
  {title:"Compare contracts",copy:"Mobile, broadband and TV full-term costs.",href:"/compare",image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"}
];
export default function CategoriesPage(){return <main className={styles.page}>
  <Header/>
  <section className={styles.hero}><div className="shell"><p className={styles.eyebrow}>The AVUQO directory</p><h1>One place. <span>More ways to find value.</span></h1><p>Explore thoughtful buying ideas, useful tools and category-specific guides. Product and price information is only presented as live once source checks are complete.</p></div></section>
  <section className={`shell ${styles.section}`} aria-label="Category destinations">
    <div className={styles.heading}><h2>Find your next thing.</h2><p>Start with a category and take the useful details with you.</p></div>
    <div className={styles.grid}>
      {lifestyleOrder.map(slug=>{const page=lifestylePages[slug];return <Link className={styles.card} href={`/${slug}`} key={slug}>
        <div className={styles.photo} style={{backgroundImage:`url("${page.hero}")`}} aria-hidden="true"/>
        <div className={styles.cardCopy}><h3>{slug==="tech"?"Technology":slug[0].toUpperCase()+slug.slice(1)}</h3><p>{page.eyebrow}</p><ArrowRight size={19}/></div>
      </Link>})}
      {extras.map(item=><Link className={styles.card} href={item.href} key={item.href}>
        <div className={styles.photo} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/>
        <div className={styles.cardCopy}><h3>{item.title}</h3><p>{item.copy}</p><ArrowRight size={19}/></div>
      </Link>)}
    </div>
    <p className={styles.note}>Category photography is illustrative. It does not represent an endorsed product, a live quote or an available offer.</p>
  </section>
  <Footer/>
</main>}