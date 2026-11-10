import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {ArrowRight,ArrowUpRight,ShieldCheck} from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import TyreWheelVisual from "../../TyreWheelVisual";
import {tyreBrandNames,tyreBrandSlug,resolveTyreBrand} from "../../../../lib/tyres/catalogue";
import styles from "../../tyres.module.css";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return tyreBrandNames.map(name=>({slug:tyreBrandSlug(name)}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const name=resolveTyreBrand((await params).slug,tyreBrandNames);
 return {title:name?name+" tyre guide | AVUQO":"Tyre manufacturer | AVUQO",
  description:name?"Understand the checks that matter when choosing an exact "+name+" tyre.":undefined,
  robots:{index:false,follow:true}};
}
export default async function BrandGuide({params}:Props){
 const name=resolveTyreBrand((await params).slug,tyreBrandNames);
 if(!name)notFound();
 return <main className={styles.page}><Header/>
  <section className={styles.studioHero}><div className={styles.heroTexture}/>
   <div className={styles.shell+" "+styles.studioGrid}>
    <div className={styles.studioCopy}>
     <p className={styles.studioEyebrow}><span className={styles.eyebrowDash}/> THE MAKERS / {name.toUpperCase()}</p>
     <h1>{name}<br/><span>tyres, with</span><br/>clarity.</h1>
     <p className={styles.studioLead}>A place to explore {name} tyres thoughtfully, beginning with the model, exact dimensions and ratings that your vehicle requires.</p>
     <div className={styles.heroActions}>
      <Link href="/tyres/sizes" className={styles.premiumButton}>Understand my tyre size <ArrowRight size={17}/></Link>
      <Link href="/tyres/brands" className={styles.lightButton}>All tyre makers <ArrowUpRight size={17}/></Link>
      <Link href={"/tyres/find?brand="+tyreBrandSlug(name)} className={styles.lightButton}>Approved models <ArrowRight size={17}/></Link>
     </div>
    </div>
    <div className={styles.visualStage}><div className={styles.visualHalo}/><TyreWheelVisual small/></div>
   </div>
  </section>
  <div className={styles.shell+" "+styles.main}>
   <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/tyres">Tyres</Link><span>/</span><Link href="/tyres/brands">Manufacturers</Link><span>/</span><span>{name}</span></nav>
   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>SHOP SMARTER / CHECK THE DETAILS</p>
     <h2>The right {name} tyre.<br/><span className={styles.softHeading}>Not just the right brand.</span></h2>
     <p className={styles.sub}>A single manufacturer can make many tyres with similar names but different sizes, ratings and features. Use these checks for the exact tyre you are considering.</p>
    </div></div>
    <div className={styles.infoGrid}>
     <article className={styles.info}><span className={styles.number}>01</span><b>Start with approved dimensions</b><p>Check width, profile and rim diameter against your vehicle handbook or tyre placard.</p></article>
     <article className={styles.info}><span className={styles.number}>02</span><b>Look at the exact variant</b><p>Verify load and speed ratings and whether the exact model is reinforced, seasonal or run-flat.</p></article>
     <article className={styles.info}><span className={styles.number}>03</span><b>Count the whole cost</b><p>When approved retailer offers become available, compare fitting, delivery, balancing and disposal charges too.</p></article>
    </div>
   </section>
   <aside className={styles.comingSoon}>
    <span className={styles.pill}>VERIFIED PRODUCT GATE</span>
    <div><h2>See whether an exact {name} model is approved.</h2>
     <p>The dedicated product finder only admits exact model variants with verified safety fields, current prices and source rights. No manufacturer endorsement, installed quotation or vehicle fitment is inferred.</p>
    </div>
    <Link href={"/tyres/find?brand="+tyreBrandSlug(name)}><ShieldCheck size={17}/> View verified {name} models</Link>
   </aside>
  </div><Footer/></main>;
}