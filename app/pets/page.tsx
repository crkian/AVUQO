import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Cat, Dog, Droplets, Gift, ShieldCheck } from "lucide-react";
import { connection } from "next/server";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { verifiedOffers } from "../../lib/products/public-catalog";
import LiveDealCard, { type LiveDealCardData } from "../../components/live/LiveDealCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pets | Smart feeders, fountains and thoughtful pet shopping",
  description: "Explore practical pet care, smart feeders, water fountains and gift ideas. AVUQO publishes retailer offers only after verification.",
  alternates: { canonical: "/pets" },
};

const categories = [
  { title:"Automatic feeders", description:"Explore meal-time technology and portion-control options.", href:"/search?q=automatic%20pet%20feeders", Icon:Cat, image:"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80" },
  { title:"Water fountains", description:"Consider capacity, replacement filters and cleaning costs.", href:"/search?q=pet%20water%20fountains", Icon:Droplets, image:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80" },
  { title:"Dog essentials", description:"Compare everyday gear and practical care accessories.", href:"/search?q=dog%20accessories", Icon:Dog, image:"https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80" },
  { title:"Pet gifts", description:"Useful presents for pets and the people who care for them.", href:"/search?q=pet%20gifts", Icon:Gift, image:"https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80" },
];

async function PublishedPetOffers() {
  await connection();
  // Reuse the public admission gate: published status alone is not merchant permission.
  const offers:LiveDealCardData[]=(await verifiedOffers({limit:60}))
    .filter(item=>item.published.merchant.toLowerCase().includes("petlibro"))
    .slice(0,8).map(item=>item.published);
  return <section className="shell section" aria-labelledby="pet-offers">
    <div className="section-title"><div><p className="kicker">Retailer-backed shopping</p><h2 id="pet-offers">Verified pet offers</h2><p>Only products approved through the AVUQO publication process are shown here.</p></div></div>
    {offers.length ? <div className={styles.grid}>{offers.map(offer=><LiveDealCard key={offer.offer_id} deal={offer}/>)}</div> :
    <div className={styles.empty}><ShieldCheck size={28}/><h3>Product checks in progress</h3><p>Petlibro products have been imported for private review. Current AVUQO records do not yet establish publication rights, fresh eligible prices or complete retailer approval. No unverified offers are shown.</p></div>}
    <p className={styles.note}>Prices and stock can change. Confirm current details with each retailer. AVUQO may earn a commission from eligible purchases; this does not determine organic ranking.</p>
  </section>;
}

export default function PetsPage() {
  return <main><Header/>
    <section className={styles.hero}><div className={styles.heroPhoto} aria-hidden="true"/><div className={styles.heroWash} aria-hidden="true"/><div className={`shell ${styles.heroLayout}`}><div className={styles.heroCopy}><p className="kicker">AVUQO Pets</p><h1>Happier pets. <span>Better value.</span></h1><p>Explore smart feeders, fountains and thoughtful pet essentials. Compare usefulness and total cost, not just marketing promises.</p><Link className={styles.primary} href="#categories">Explore pet essentials <ArrowRight size={17}/></Link></div></div></section>
    <section className="shell section" id="categories"><div className="section-title"><div><p className="kicker">Find your category</p><h2>Start with what your pet needs.</h2></div></div><div className={styles.grid}>{categories.map(({title,description,href,Icon,image})=><Link key={title} href={href} className={styles.card}><div className={styles.cardPhoto} style={{backgroundImage:`url("${image}")`}} aria-hidden="true"/><div className={styles.cardBody}><Icon size={21}/><h3>{title}</h3><p>{description}</p><span>Explore ideas <ArrowRight size={15}/></span></div></Link>)}</div></section>
    <Suspense fallback={<section className="shell section">Checking approved pet offers…</section>}><PublishedPetOffers/></Suspense>
    <section className="shell section"><div className={styles.tip}><h2>Look beyond the sticker price.</h2><p>For automatic feeders and fountains, compare ongoing filter costs, capacity, cleaning needs, power requirements and replacement parts as well as the upfront purchase.</p></div></section>
    <Footer/></main>;
}
