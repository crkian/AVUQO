import Link from "next/link";
import type {CSSProperties} from "react";
import {partnerFor,partnerHref} from "../../lib/partners/advertiser-directory";
import styles from "../../app/partners/partners.module.css";
const sets={
 travel:["holiday-extras","compare-parking-prices"],
 broadband:["broadband-genie","onestream","broadband-mobile-coop"],
 shopping:["tooled-up","petlibro","playpress-toys","cadbury-gifts-direct","mozillion","craft-buddy"],
 motoring:["tyres-uk","tyres-pneus-online","simply-mot","autoaid-breakdown"],
 mobile:["mozillion","one-p-mobile","lyca-mobile","broadband-mobile-coop"]
} as const;
const text={
 travel:["Travel booking partners","Airport parking, hotels, lounges and transfers have date-specific quotes. Open the partner page for documented booking links and exclusions."],
 broadband:["Broadband partners","Explore providers and their own postcode-dependent availability, then use AVUQO to think through total contract costs."],
 shopping:["Explore our participating shops","See verified product shelves where available, or browse an advertiser's official site. Imported rows aren't all live prices."],
 motoring:["Motoring partners","Tyres, MOT bookings and recovery have different fees, fitments, times and cover. Check each before comparing."],
 mobile:["Mobile retailers and plans","Handsets and SIM plans are separate purchases. Find specialist partners and compare your contract's full cost."]
} as const;
export default function PartnerLinkShelf({kind}:{kind:keyof typeof sets}){
 const items=sets[kind].map(s=>partnerFor(s)).filter((p):p is NonNullable<typeof p>=>Boolean(p));
 return <section className={styles.shell+" "+styles.directoryGroup} aria-label={text[kind][0]}>
  <div className={styles.directoryHead}><div><p className={styles.kicker}>AVUQO retail park</p><h2>{text[kind][0]}</h2><p className={styles.sectionIntro}>{text[kind][1]}</p></div><Link href="/partners">All partner shops ↗</Link></div>
  <div className={styles.directory}>{items.map(p=><Link key={p.slug} className={styles.directoryCard}
   style={{"--accent":p.accent,"--deep":p.deep,"--glow":p.glow} as CSSProperties} href={partnerHref(p)}>
   <span className={styles.emoji} aria-hidden="true">{p.symbol}</span><b>{p.name}</b><p>{p.tagline}</p><strong>Explore partner ↗</strong>
  </Link>)}</div>
 </section>;
}
