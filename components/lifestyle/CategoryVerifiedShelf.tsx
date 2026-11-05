import {connection} from "next/server";
import Link from "next/link";
import {ArrowRight, ShieldCheck, BadgeCheck, Scale, Heart, Search} from "lucide-react";
import type {Landing} from "../../lib/lifestyle/landing-data";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import VerifiedProductCards from "../products/VerifiedProductCards";
import styles from "./CategoryVerifiedShelf.module.css";

const marketWords:Record<string,readonly string[]>={
  tech:["electronics","technology","computing","laptops","mobile phones","audio","camera","gaming"],
  home:["home & living","home and living","home furnishing","furniture","homeware","household"],
  beauty:["beauty","skincare","cosmetics","haircare","fragrance","personal care"],
  fashion:["fashion","clothing","apparel","footwear","accessories"],
  gifts:["gifts","gift sets","gifting"],
  toys:["toys","games","children's toys"],
  shopping:["shopping","retail"],
  pets:["pets","pet supplies","pet care"],
};
const promises=[
  {icon:BadgeCheck,title:"Verified offers",text:"Only publishable retailer records appear."},
  {icon:Scale,title:"Real total cost",text:"Consider delivery, terms and the full price."},
  {icon:Heart,title:"Your decision",text:"Choosing what fits matters most."},
] as const;

export default async function CategoryVerifiedShelf({config}:{config:Landing}){
  await connection();
  const words=marketWords[config.slug]??[];
  const products=words.length?await verifiedProductIndex(60):[];
  const matched=products.filter(({offers})=>offers.some(({published})=>
    words.some(word=>published.category.toLowerCase().includes(word)))).slice(0,4);
  return <section className={styles.section} aria-labelledby={`verified-heading-${config.slug}`}>
    <div className="shell">
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}><ShieldCheck size={15} aria-hidden="true"/> Thoughtful shopping</p>
          <h2 id={`verified-heading-${config.slug}`}>{matched.length?"Verified product highlights":"Worth looking into."}</h2>
          <p>{matched.length?"Each displayed product has eligible source evidence and a matching category.":"No products in this department have passed every publishing check yet. These buying guides stay available without made-up prices."}</p>
        </div>
        <Link href={matched.length?"/products":"/search"}>{matched.length?"Explore product guides":"Find a product"} <ArrowRight size={17} aria-hidden="true"/></Link>
      </div>
      <div className={styles.columns}>
        <div className={styles.products}>
          {matched.length?<VerifiedProductCards items={matched} compact/>:
          <div className={styles.empty}>
            <span><Search size={32} aria-hidden="true"/></span>
            <h3>The right evidence comes first.</h3>
            <p>Explore ${config.eyebrow.toLowerCase()} inspiration and independent buying questions now. Eligible retailer offers appear here once verified.</p>
            <Link href={`/search?q=${encodeURIComponent(config.tiles[0]?.search??config.slug)}`}>Explore ideas <ArrowRight size={16}/></Link>
          </div>}
        </div>
        <aside className={styles.context} aria-label="How AVUQO evaluates shopping choices">
          <p className={styles.eyebrow}>Our approach</p>
          <h3>Why something might be <em>worth it.</em></h3>
          <p className={styles.contextIntro}>There isn't one perfect buy. Good value comes from clear evidence and the features that matter to you.</p>
          <div className={styles.promises}>{promises.map(({icon:Icon,title,text})=>
            <div key={title}><span><Icon size={20} aria-hidden="true"/></span><div><strong>{title}</strong><p>{text}</p></div></div>)}</div>
          <Link href="/how-we-score">How AVUQO evaluates value <ArrowRight size={16}/></Link>
        </aside>
      </div>
      <p className={styles.disclosure}>Photography in editorial sections is illustrative. Scores, availability and prices are shown only when supported by current approved evidence.</p>
    </div>
  </section>;
}
