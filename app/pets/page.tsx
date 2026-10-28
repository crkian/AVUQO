import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Cat, Dog, Droplets, Gift, ShieldCheck } from "lucide-react";
import { connection } from "next/server";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { createClient } from "../../lib/supabase/server";
import LiveDealCard, { type LiveDealCardData } from "../../components/live/LiveDealCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pets | Smart feeders, fountains and thoughtful pet shopping",
  description: "Explore practical pet care, smart feeders, water fountains and gift ideas. AVUQO publishes retailer offers only after verification.",
  alternates: { canonical: "/pets" },
};

const categories = [
  { title:"Automatic feeders", description:"Explore meal-time technology and portion-control options.", href:"/search?q=automatic%20pet%20feeders", Icon:Cat },
  { title:"Water fountains", description:"Consider capacity, replacement filters and cleaning costs.", href:"/search?q=pet%20water%20fountains", Icon:Droplets },
  { title:"Dog essentials", description:"Compare everyday gear and practical care accessories.", href:"/search?q=dog%20accessories", Icon:Dog },
  { title:"Pet gifts", description:"Useful presents for pets and the people who care for them.", href:"/search?q=pet%20gifts", Icon:Gift },
];

async function PublishedPetOffers() {
  await connection();
  const db = await createClient();
  const {data,error} = await db.from("published_deals")
    .select("offer_id,title,category,merchant,current_price,typical_price,saving_amount,avuqo_score,confidence,label,decision,image_url,reason")
    .eq("status","published").ilike("merchant","%petlibro%").gt("current_price",0)
    .order("avuqo_score",{ascending:false}).limit(8);
  const offers = error ? [] : (data ?? []) as LiveDealCardData[];
  return <section className="shell section" aria-labelledby="pet-offers">
    <div className="section-title"><div><p className="kicker">Retailer-backed shopping</p><h2 id="pet-offers">Verified pet offers</h2><p>Only products approved through the AVUQO publication process are shown here.</p></div></div>
    {offers.length ? <div className={styles.grid}>{offers.map(offer=><LiveDealCard key={offer.offer_id} deal={offer}/>)}</div> :
    <div className={styles.empty}><ShieldCheck size={28}/><h3>Product checks in progress</h3><p>Petlibro UK is an approved affiliate partner. We have imported its catalogue for private review, but have not verified current pricing, retailer permissions and publication readiness. No offers are being shown yet.</p></div>}
    <p className={styles.note}>Prices and stock can change. Confirm current details with each retailer. AVUQO may earn a commission from eligible purchases; this does not determine organic ranking.</p>
  </section>;
}

export default function PetsPage() {
  return <main><Header/>
    <section className={styles.hero}><div className="shell"><p className="kicker">AVUQO Pets</p><h1>Better care. <span>Better value.</span></h1><p>Make sense of pet tech, accessories and running costs, without mistaking a flashy offer for a good decision.</p><Link className={styles.primary} href="#categories">Explore pet essentials <ArrowRight size={17}/></Link></div></section>
    <section className="shell section" id="categories"><div className="section-title"><div><p className="kicker">Find your category</p><h2>Start with what your pet needs.</h2></div></div><div className={styles.grid}>{categories.map(({title,description,href,Icon})=><Link key={title} href={href} className={styles.card}><Icon size={28}/><h3>{title}</h3><p>{description}</p><span>Explore ideas <ArrowRight size={15}/></span></Link>)}</div></section>
    <Suspense fallback={<section className="shell section">Checking approved pet offers…</section>}><PublishedPetOffers/></Suspense>
    <section className="shell section"><div className={styles.tip}><h2>Look beyond the sticker price.</h2><p>For automatic feeders and fountains, compare ongoing filter costs, capacity, cleaning needs, power requirements and replacement parts as well as the upfront purchase.</p></div></section>
    <Footer/></main>;
}
