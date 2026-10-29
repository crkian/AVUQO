import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, HeartHandshake, Search, ShieldCheck } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { categoryPages, photoUrl, type CategorySlug } from "../../lib/editorial-category-pages";
import styles from "./EditorialCategoryPage.module.css";

const benefits = [
  { title:"Choose with confidence", text:"Understand what matters, beyond a headline price.", Icon:ShieldCheck },
  { title:"Find your fit", text:"Start with your needs, not whatever is trending.", Icon:Search },
  { title:"Discover worthwhile ideas", text:"Thoughtful inspiration, across everyday categories.", Icon:Gift },
  { title:"Keep the full cost in view", text:"Look for fees, delivery and longer-term costs.", Icon:HeartHandshake },
];

export default function EditorialCategoryPage({slug}:{slug:CategorySlug}) {
  const page=categoryPages[slug];
  return <main className={styles.root} style={{"--category-accent":page.accent} as React.CSSProperties}>
    <Header/>
    <section className={styles.hero} aria-labelledby="category-heading">
      <div className={styles.heroPhoto} style={{backgroundImage:`url("${photoUrl(page.heroPhoto,1800)}")`}} role="img" aria-label={page.photoAlt}/>
      <div className={styles.heroShade} aria-hidden="true"/>
      <div className={`shell ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{page.label}</p>
          <h1 id="category-heading">{page.headline}</h1>
          <p>{page.intro}</p>
          <Link className={styles.primary} href="#explore">Explore {page.label.replace("AVUQO ","").toLowerCase()} <ArrowRight size={19}/></Link>
        </div>
      </div>
    </section>
    <section className={styles.benefits} aria-label="The AVUQO way">
      <div className={`shell ${styles.benefitGrid}`}>{benefits.map(({title,text,Icon})=>
        <div key={title} className={styles.benefit}><span className={styles.benefitIcon}><Icon size={22}/></span><div><strong>{title}</strong><span>{text}</span></div></div>
      )}</div>
    </section>
    <section className={`shell ${styles.section}`} id="explore">
      <div className={styles.sectionHead}><div><p className={styles.kicker}>Explore the collection</p><h2>Find your next good choice.</h2><p>Start with something that interests you and explore the available options.</p></div><Link href="/categories">All categories <ArrowRight size={18}/></Link></div>
      <div className={styles.tiles}>{page.tiles.map(tile=>
        <Link key={tile.title} className={styles.tile} href={`/search?q=${encodeURIComponent(tile.query)}`}>
          <div className={styles.tilePhoto} style={{backgroundImage:`url("${photoUrl(tile.photo,750)}")`}} role="img" aria-label={tile.title}/>
          <div className={styles.tileBody}><h3>{tile.title}</h3><p>{tile.description}</p><span>Explore ideas <ArrowRight size={18}/></span></div>
        </Link>)}</div>
    </section>
    <section className={`shell ${styles.section}`}>
      <div className={styles.story}><div className={styles.storyCopy}><p className={styles.kicker}>Worth thinking about</p><h2>{page.detailTitle}</h2><p>{page.detailText}</p><Link className={styles.secondary} href={`/search?q=${encodeURIComponent(page.detailQuery)}`}>Explore more <ArrowRight size={17}/></Link></div><div className={styles.storyPhoto} style={{backgroundImage:`url("${photoUrl(page.detailPhoto,1000)}")`}} role="img" aria-label={page.detailTitle}/></div>
    </section>
    <section className={`shell ${styles.more}`}><div className={styles.sectionHead}><div><p className={styles.kicker}>More from AVUQO</p><h2>There&apos;s more worth exploring.</h2></div></div><div className={styles.moreLinks}><Link href="/christmas"><Gift size={21}/> Christmas gift finder <ArrowRight size={16}/></Link><Link href="/pets"><HeartHandshake size={21}/> Pets & essentials <ArrowRight size={16}/></Link><Link href="/compare"><CheckCircle2 size={21}/> Compare contracts <ArrowRight size={16}/></Link></div><p className={styles.footnote}>Lifestyle photography is illustrative and is not a retailer product listing. AVUQO only publishes merchant product offers when their data and permissions have passed review. Some search results may currently be illustrative while live coverage is expanded.</p></section>
    <Footer/>
  </main>;
}
