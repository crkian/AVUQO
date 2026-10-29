import type {CSSProperties} from "react";
import Link from "next/link";
import {ArrowRight,ArrowUpRight,ShieldCheck} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import type {Section} from "../../lib/editorial/sections";
import styles from "./SectionLanding.module.css";
export default function SectionLanding({data}:{data:Section}){
const theme={"--tone":data.color,"--wash":data.wash} as CSSProperties;
return <main className={styles.page} style={theme}><Header/>
<section className={styles.hero}><div className={`shell ${styles.heroGrid}`}><div className={styles.heroCopy}><p className={styles.kicker}>{data.label}</p><h1>{data.heading}<span>{data.highlight}</span></h1><p className={styles.intro}>{data.intro}</p><p className={styles.status}><ShieldCheck size={18}/> Guidance, not a live quote</p></div><div className={styles.photo} style={{backgroundImage:`url("${data.photo}")`}} aria-hidden="true"/></div></section>
<section className={`shell ${styles.section}`}><div className={styles.heading}><p className={styles.kicker}>Step inside</p><h2>Make yourself at home.</h2><p>Explore the different corners of this topic and decide what you want to look into.</p></div><div className={styles.grid}>{data.cards.map((c,i)=><Link className={styles.card} href={c.href} key={c.title}><span className={styles.number}>0{i+1}</span><h3>{c.title}</h3><p>{c.description}</p><span className={styles.action}>Explore <ArrowRight size={17}/></span></Link>)}</div></section>
<section className={styles.notes}><div className={`shell ${styles.notesGrid}`}><div><p className={styles.kicker}>The little details</p><h2>Three things worth checking.</h2><p>A few good questions can make a complicated decision feel much simpler.</p></div><div>{data.tips.map(([t,d],i)=><article key={t}><b>{i+1}</b><div><h3>{t}</h3><p>{d}</p></div></article>)}</div></div></section>
<section className={`shell ${styles.closing}`}><div><p className={styles.kicker}>Find what's worth it</p><h2>Better decisions start with better information.</h2><p>Find useful guides and comparison tools across AVUQO, all with a little room to think.</p>{data.cta.href.startsWith("http")?<a href={data.cta.href} target="_blank" rel="noopener noreferrer" className={styles.button}>{data.cta.text}<ArrowUpRight size={16}/></a>:<Link href={data.cta.href} className={styles.button}>{data.cta.text}<ArrowRight size={16}/></Link>}</div><div className={styles.callout}><ShieldCheck size={29}/><strong>Clarity before commission.</strong><p>No made-up deals. No pressure to buy. Just a better place to explore.</p></div></section>
<section className={`shell ${styles.disclosure}`}><strong>A note about this area</strong><p>{data.notice} Images are illustrative, not verified offers. <Link href="/editorial-policy">Our editorial policy</Link> explains how we handle sources and commercial relationships.</p></section><Footer/></main>;
}