import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
import styles from "./LifestyleExplorer.module.css";

const rooms = [
  { href: "/shopping", title: "Shopping", subtitle: "Find things you'll love to use", eyebrow: "Considered shopping", image: lifestylePages.shopping.hero, tone: "shopping" },
  { href: "/groceries", title: "Groceries", subtitle: "A little help with the weekly shop", eyebrow: "Your everyday basket", image: lifestylePages.home.tiles[1].image, tone: "groceries" },
  { href: "/home", title: "Home & living", subtitle: "Thoughtful comforts and useful upgrades", eyebrow: "Make room for better", image: lifestylePages.home.hero, tone: "home" },
  { href: "/travel", title: "Travel", subtitle: "Good journeys start with good plans", eyebrow: "Places to discover", image: lifestylePages.travel.hero, tone: "travel" },
  { href: "/tech", title: "Tech", subtitle: "Useful technology without the noise", eyebrow: "Everyday essentials", image: lifestylePages.tech.hero, tone: "tech" },
  { href: "/pets", title: "Pets", subtitle: "Care for your companions", eyebrow: "The little family members", image: "/illustrations/avuqo-pets-care.svg", tone: "pets" },
  { href: "/gifts", title: "Gifts", subtitle: "A little more thought, a lot more meaning", eyebrow: "Giving well", image: lifestylePages.gifts.hero, tone: "gifts" },
  { href: "/beauty", title: "Beauty", subtitle: "Simple routines and thoughtful choices", eyebrow: "Feel good", image: lifestylePages.beauty.hero, tone: "beauty" },
] as const;

export default function LifestyleExplorer() {
  return <section className={`shell ${styles.section}`} aria-labelledby="lifestyle-explore">
    <div className={styles.heading}>
      <div><p className={styles.kicker}>Come on in</p><h2 id="lifestyle-explore">Explore AVUQO, room by room.</h2><p>Different corners for different parts of life, all with the same thoughtful approach to value.</p></div>
      <Link href="/categories">All departments <ArrowRight size={17}/></Link>
    </div>
    <div className={styles.grid}>{rooms.map(room => <Link href={room.href} key={room.href} className={`${styles.card} ${styles[room.tone]}`}>
      <div className={styles.photo} style={{backgroundImage:`url("${room.image}")`}} aria-hidden="true"/>
      <div className={styles.copy}><span className={styles.overline}>{room.eyebrow}</span><h3>{room.title}</h3><p>{room.subtitle}</p><span className={styles.linkText}>Explore <ArrowRight size={17}/></span></div>
    </Link>)}</div>
    <p className={styles.note}>Photography is illustrative. Specific merchant offers are shown only when suitable data and permissions are available.</p>
  </section>;
}
