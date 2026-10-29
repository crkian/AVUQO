import Link from "next/link";
import type {CSSProperties} from "react";
import {ArrowRight,CalendarDays,ShieldCheck,ShoppingBag} from "lucide-react";
import Header from "../layout/Header";import Footer from "../layout/Footer";
import {seasonal,type Season} from "../../lib/editorial/seasonal";
import styles from "./SeasonalLanding.module.css";
export default function SeasonalLanding({kind}:{kind:Season}){
const d=seasonal[kind];const style={"--tone":d.color,"--wash":d.wash} as CSSProperties;
return <main className={styles.page} style={style}><Header/>
<section className={styles.hero}><div className={`shell ${styles.heroInner}`}><div className={styles.copy}><p className={styles.kicker}>{d.eyebrow}</p><h1>{d.title}<span>{d.highlight}</span></h1><p className={styles.lead}>{d.intro}</p><div className={styles.date}><CalendarDays size={18}/>{d.date}</div><p className={styles.status}><ShieldCheck size={17}/>{d.status}</p></div><div className={styles.photo} style={{backgroundImage:`url("${d.photo}")`}} aria-hidden="true"/></div></section>
<section className={`shell ${styles.explore}`}><div className={styles.heading}><p className={styles.kicker}>Curated starting points</p><h2>Explore what matters to you.</h2><p>Discover ideas, not invented deals. Follow the links to the relevant AVUQO department.</p></div><div className={styles.grid}>{d.cards.map(([title,copy,href],i)=><Link key={href} href={href} className={styles.card}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p><strong>Explore <ArrowRight size={17}/></strong></Link>)}</div></section>
<section className={styles.tips}><div className={`shell ${styles.tipsInner}`}><div><p className={styles.kicker}>Shop with a little wisdom</p><h2>Three habits worth keeping.</h2></div><div>{d.tips.map(([title,description],i)=><article key={title}><ShoppingBag size={21}/><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></section>
<section className={`shell ${styles.notice}`}><strong>A note on sale claims</strong><p>{d.notice} Advertiser payments do not determine organic recommendations. <Link href="/editorial-policy">How our editorial policy works</Link>.</p></section>
<Footer/></main>;
}