import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
import styles from "./LifestyleExplorer.module.css";
const featured=["shopping","travel","home","tech","gifts","beauty"];
export default function LifestyleExplorer() {return <section className={`shell ${styles.section}`} aria-labelledby="lifestyle-explore">
  <div className={styles.heading}><div><p className={styles.kicker}>Explore AVUQO</p><h2 id="lifestyle-explore">Find your next worthwhile thing.</h2><p>Distinct destinations. Useful shopping guidance. A clearer route from inspiration to decision.</p></div><Link href="/categories">All categories <ArrowRight size={17}/></Link></div>
  <div className={styles.grid}>{featured.map(slug=>{const item=lifestylePages[slug];return <Link href={`/${slug}`} key={slug} className={styles.card}><div className={styles.photo} style={{backgroundImage:`url("${item.hero}")`}} aria-hidden="true"/><div className={styles.copy}><h3>{slug==="tech"?"Tech":slug[0].toUpperCase()+slug.slice(1)}</h3><span>Explore <ArrowRight size={16}/></span></div></Link>})}</div>
  <p className={styles.note}>Editorial imagery is illustrative. Retailer listings require verification before publication.</p>
</section>}