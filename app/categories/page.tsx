import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Gift, PawPrint } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { categoryPages, photoUrl, type CategorySlug } from "../../lib/editorial-category-pages";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title:"Explore all categories | AVUQO",
  description:"Explore travel, shopping, home, tech, beauty, fashion, gifts, toys, motoring, experiences, pets and seasonal ideas.",
  alternates:{canonical:"/categories"}
};
const slugs: CategorySlug[] = ["shopping","travel","home","tech","fashion","beauty","gifts","toys","motoring","experiences"];
export default function CategoriesPage(){
  return <main><Header/>
    <section className={styles.hero}><div className="shell"><p className="kicker">Explore AVUQO</p><h1>Find what&apos;s worth it, <span>whatever the aisle.</span></h1><p>Discover destinations for everything from everyday shopping to memorable experiences. A little inspiration, with better-value thinking built in.</p></div></section>
    <section className={`shell ${styles.section}`}><div className={styles.head}><div><p className="kicker">Browse departments</p><h2>Something good starts here.</h2></div></div>
      <div className={styles.grid}>{slugs.map(slug=>{const page=categoryPages[slug];return <Link href={`/${slug}`} className={styles.card} key={slug}>
        <div className={styles.image} style={{backgroundImage:`url("${photoUrl(page.heroPhoto,700)}")`}} role="img" aria-label={page.photoAlt}/>
        <div className={styles.body}><h3>{page.label.replace("AVUQO ","")}</h3><p>{page.intro}</p><span>Explore <ArrowRight size={17}/></span></div>
      </Link>})}</div>
    </section>
    <section className={`shell ${styles.section}`}><div className={styles.head}><div><p className="kicker">More ways to explore</p><h2>Seasonal and everyday favourites.</h2></div></div><div className={styles.special}>
      <Link href="/christmas"><div className={styles.specialImage} style={{backgroundImage:`url("${photoUrl(35280356,1100)}")`}}/><div><Gift size={22}/><h3>Christmas & festive gifting</h3><p>Gift ideas, crafts and practical seasonal shopping advice.</p><span>Open Christmas <ArrowRight size={17}/></span></div></Link>
      <Link href="/pets"><div className={styles.specialImage} style={{backgroundImage:`url("${photoUrl(32276112,1100)}")`}}/><div><PawPrint size={22}/><h3>Pets & pet care</h3><p>Thoughtful pet essentials, smart-feeder ideas and everyday care.</p><span>Explore Pets <ArrowRight size={17}/></span></div></Link>
    </div>
      <p className={styles.note}><Camera size={15}/> Editorial images are illustrative. Retailer products and prices are published only when source rights and product data have been checked.</p>
    </section><Footer/></main>;
}
