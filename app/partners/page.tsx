import Link from "next/link";
import {Suspense} from "react";
import type {Metadata} from "next";
import {ArrowRight,Grid3X3,Search,ShoppingBag,Store} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import RetailerCatalogueBrowser from "../../components/partners/RetailerCatalogueBrowser";
import FeaturedPartnerEditions from "../../components/partners/FeaturedPartnerEditions";
import styles from "./partners.module.css";
export const metadata:Metadata={
 title:"Retailer & Service Catalogue | AVUQO Retail Park",
 description:"Browse all 21 participating Awin advertisers by name, department and type, with individual storefronts and eligible live offers where supported.",
 alternates:{canonical:"/partners"}
};
const journeys=[
 {href:"/catalogue",title:"Everything AVUQO offers",copy:"Products, services and all 25 familiar departments",Icon:Grid3X3},
 {href:"/products",title:"Shop verified products",copy:"Individually verified retailer product listings",Icon:ShoppingBag},
 {href:"/categories",title:"Shop by category",copy:"The original category and specialist browsing experience",Icon:Search}
] as const;
export default function PartnerDirectory(){
 return <><Header/><main className={styles.directoryPage}>
  <section className={styles.directoryHero}><div className={styles.shell}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">AVUQO</Link><span>›</span><Link href="/catalogue">Catalogue</Link><span>›</span> Retailers</nav>
   <p className={styles.directoryEyebrow}>AVUQO · The online retail park</p>
   <h1>Find your shop.<br/><span>Keep your options open.</span></h1>
   <p>The same AVUQO design and shopping categories, with a dedicated page for every participating advertiser. Choose a retailer, browse a product, or explore all the services available.</p>
   <div className={styles.strip}><Link className={styles.heroButton} href="/catalogue">Explore the full catalogue <ArrowRight size={15}/></Link>
    <Link className={styles.heroGhost} href="/products">Shop eligible products</Link>
    <Link className={styles.heroGhost} href="/shop">Browse all live retailer offers</Link>
    <Link className={styles.heroGhost} href="/categories">All 25 categories</Link>
    <Link className={styles.heroGhost} href="/advertise">For retailers &amp; suppliers</Link></div>
  </div></section>
  <Suspense fallback={<div className={styles.shell+" "+styles.catalogueLoading}>Preparing the featured retailer studios…</div>}>
   <FeaturedPartnerEditions/>
  </Suspense>
  <section className={styles.shell+" "+styles.catalogueEntry} aria-label="Ways to explore the retail park">
   {journeys.map(({href,title,copy,Icon})=><Link key={href} className={styles.catalogueEntryCard} href={href}>
    <span><Icon size={23} aria-hidden="true"/></span><strong>{title}</strong><small>{copy}</small><b>Explore <ArrowRight size={15}/></b>
   </Link>)}
  </section>
  <Suspense fallback={<div className={styles.shell+" "+styles.catalogueLoading}>Preparing the retailer catalogue…</div>}>
   <RetailerCatalogueBrowser/>
  </Suspense>
  <section className={styles.shell+" "+styles.catalogueFooter}>
   <p><Store size={18}/> Every accepted advertiser has its own look and page, but that does not mean all have a live price feed. Only eligible offers appear on product shelves. <Link href="/trust">Read AVUQO&apos;s evidence standards</Link>.</p>
   <Link href="/groceries">Build a supermarket shopping list <ArrowRight size={16}/></Link>
  </section>
 </main><Footer/></>;
}