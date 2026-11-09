import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,ArrowUpRight,CheckCircle2,Gauge,ShieldCheck,SlidersHorizontal} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import TyreWheelVisual from "./TyreWheelVisual";
import {tyreCollections,tyreBrandNames,tyreBrandSlug} from "../../lib/tyres/catalogue";
import styles from "./tyres.module.css";

export const metadata:Metadata={
 title:"Tyres | A more intelligent way to choose | AVUQO",
 description:"Explore tyre sizes, manufacturers and fitting costs with evidence-first guidance. Verified live tyre offers are coming to AVUQO.",
 alternates:{canonical:"/tyres"}
};
const widths=[155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305];
const profiles=[30,35,40,45,50,55,60,65,70,75,80];
const rims=[13,14,15,16,17,18,19,20,21,22];

export default function TyresPage(){
 return <main className={styles.page}>
  <Header/>
  <section className={styles.studioHero}>
   <div className={styles.heroTexture} aria-hidden="true"/>
   <div className={styles.shell+" "+styles.studioGrid}>
    <div className={styles.studioCopy}>
     <p className={styles.studioEyebrow}><span className={styles.eyebrowDash}/> AVUQO MOTORING / TYRES</p>
     <h1>Better tyres.<br/><span>A clearer way</span><br/>to choose.</h1>
     <p className={styles.studioLead}>A considered way to explore tyres. Start with your size, discover manufacturers and understand what makes the right choice, beyond the headline price.</p>
     <div className={styles.heroActions}>
      <a className={styles.premiumButton} href="#size-finder">Explore by tyre size <ArrowRight size={18}/></a>
      <Link className={styles.lightButton} href="/tyres/brands">Browse tyre brands <ArrowUpRight size={17}/></Link>
     </div>
     <div className={styles.studioMicro}><ShieldCheck size={17}/><span>Useful guidance now. Retailer offers only when verified.</span></div>
    </div>
    <div className={styles.visualStage}>
     <div className={styles.visualHalo} aria-hidden="true"/>
     <TyreWheelVisual/>
     <span className={styles.visualCaption}>DETAIL MATTERS. EVERY MILLIMETRE.</span>
     <span className={styles.visualRingLabel}>DESIGNED AROUND THE DETAILS</span>
    </div>
   </div>
   <div className={styles.heroBottomLine} aria-hidden="true"/>
  </section>

  <section className={styles.finderSection} id="size-finder" aria-labelledby="tyre-finder-title">
   <div className={styles.shell}>
    <div className={styles.finderCard}>
     <div className={styles.finderIntro}><span className={styles.pill}>01 / START HERE</span>
      <h2 id="tyre-finder-title">Know your tyre size?</h2>
      <p>Choose the three numbers from your tyre sidewall to understand what they mean. Vehicle suitability needs a separate check.</p>
     </div>
     <form className={styles.sizeForm} method="get" action="/tyres/sizes" aria-label="Understand a tyre size">
      <label>WIDTH <small>mm</small><select name="width" defaultValue="" required>
       <option value="" disabled>e.g. 205</option>
       {widths.map(n=><option value={n} key={n}>{n}</option>)}
      </select></label>
      <label>PROFILE <small>%</small><select name="profile" defaultValue="" required>
       <option value="" disabled>e.g. 55</option>
       {profiles.map(n=><option value={n} key={n}>{n}</option>)}
      </select></label>
      <label>RIM <small>inches</small><select name="rim" defaultValue="" required>
       <option value="" disabled>e.g. 16</option>
       {rims.map(n=><option value={n} key={n}>R{n}</option>)}
      </select></label>
      <button type="submit">Understand this size <ArrowRight size={17}/></button>
     </form>
     <p className={styles.finderFootnote}><ShieldCheck size={15}/> Size education, not a vehicle-fitment or live-price search. Always verify the full required specification.</p>
    </div>
   </div>
  </section>

  <section className={styles.featureStrip} aria-label="The AVUQO approach">
   <div className={styles.shell+" "+styles.featureStripGrid}>
    <div><SlidersHorizontal size={22}/><span><b>Right dimensions</b><small>Start with the approved size</small></span></div>
    <div><Gauge size={22}/><span><b>Right specification</b><small>Understand load, speed and variants</small></span></div>
    <div><ShieldCheck size={22}/><span><b>Real total cost</b><small>Fitting and fees matter too</small></span></div>
   </div>
  </section>

  <div className={styles.shell+" "+styles.main}>
   <section className={styles.section} id="browse">
    <div className={styles.headingRow}>
     <div><p className={styles.kicker}>CURATED EXPLORATION / 02</p><h2>Made for different roads.<br/><span className={styles.softHeading}>And different drivers.</span></h2>
      <p className={styles.sub}>From year-round practicality to performance, explore the things worth checking in each type of tyre.</p></div>
    </div>
    <div className={styles.collectionGrid}>{tyreCollections.map((type,i)=><Link className={styles.collectionCard} href={"/tyres/categories/"+type.slug} key={type.slug}>
     <span className={styles.collectionIndex}>{"0"+(i+1)}</span>
     <span className={styles.collectionIcon} aria-hidden="true">{i===0?"◉":i===1?"✳":i===2?"☀":i===3?"❄":i===4?"⌁":i===5?"▣":i===6?"◎":"↗"}</span>
     <h3>{type.title}</h3><p>{type.description}</p><span className={styles.collectionLink}>Explore the guide <ArrowUpRight size={17}/></span>
    </Link>)}</div>
   </section>

   <section className={styles.brandSection}>
    <div className={styles.headingRow}>
     <div><p className={styles.kicker}>THE MAKERS / 03</p><h2>Big names.<br/><span className={styles.softHeading}>Better questions.</span></h2>
      <p className={styles.sub}>Browse tyre manufacturers, then focus on the exact model, size and rating that your car needs.</p></div>
     <Link className={styles.textLink} href="/tyres/brands">All manufacturers <ArrowRight size={16}/></Link>
    </div>
    <div className={styles.featuredBrands}>{["Michelin","Continental","Pirelli","Bridgestone","Goodyear","Hankook","Dunlop","Yokohama"].map((brand,i)=><Link href={"/tyres/brands/"+tyreBrandSlug(brand)} className={styles.featuredBrand} key={brand}>
     <span className={styles.brandSerial}>{String(i+1).padStart(2,"0")}</span>
     <span>{brand}</span><ArrowUpRight size={18}/>
    </Link>)}</div>
    <p className={styles.microDisclaimer}>Editorial brand directory. AVUQO does not claim manufacturer affiliation, endorsement or currently available live product offers.</p>
   </section>

   <section className={styles.storySection}>
    <div className={styles.storyMark}><span>AVUQO / KNOW YOUR TYRE</span><strong>205<span>/</span>55 <small>R</small>16</strong>
      <div className={styles.numberExplainer}><span>WIDTH</span><span>PROFILE</span><span>RIM</span></div>
    </div>
    <div className={styles.storyCopy}><p className={styles.kicker}>DETAILS THAT MAKE THE DIFFERENCE / 04</p>
     <h2>It’s not just about <em>the number on the price tag.</em></h2>
     <p>Your tyre size, load index, speed rating and exact variant all matter. So do fitting, balancing, delivery and disposal charges. The best choice begins with the full picture.</p>
     <Link className={styles.darkButton} href="/tyres/sizes">Understand tyre markings <ArrowRight size={17}/></Link>
    </div>
   </section>

   <section className={styles.section}>
    <div className={styles.headingRow}><div><p className={styles.kicker}>OUR STANDARD / 05</p><h2>Trust isn't an add-on.<br/><span className={styles.softHeading}>It's where we start.</span></h2></div></div>
    <div className={styles.infoGrid}>
     <div className={styles.info}><CheckCircle2 size={25}/><b>Fitment before deals</b><p>Check your vehicle handbook or tyre placard and confirm the correct size, load and speed requirements before choosing.</p></div>
     <div className={styles.info}><CheckCircle2 size={25}/><b>One real price</b><p>When retailer comparisons launch, we'll explain whether offers include fitting, delivery, disposal and other applicable costs.</p></div>
     <div className={styles.info}><CheckCircle2 size={25}/><b>Evidence before claims</b><p>Specifications, stock, imagery and availability need verified sources. Historical imports never become live offers by default.</p></div>
    </div>
   </section>
   <aside className={styles.comingSoon}><span className={styles.pill}>IN PREPARATION</span>
    <div><h2>Intelligent tyre comparisons are on their way.</h2><p>Our private supplier catalogue is being checked before any retail listings appear. Until then, AVUQO Tyres is an educational browsing experience, not a live quote or vehicle-fitment service.</p></div>
    <Link href="/motoring">Explore AVUQO Motoring <ArrowUpRight size={18}/></Link>
   </aside>
  </div>
  <Footer/>
 </main>;
}