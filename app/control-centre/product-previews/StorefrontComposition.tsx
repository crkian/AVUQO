"use client";
import Link from "next/link";
import {ArrowRight,ChevronLeft,ChevronRight,Pause,Play,ShieldCheck} from "lucide-react";
import {useEffect,useState} from "react";
import styles from "./StorefrontComposition.module.css";
type PreviewDepartment={label:string;merchant:string;count:number};
const SLIDES=[
 {label:"Independent shopping inspiration",title:"Find more than a headline discount.",description:"Explore how AVUQO could guide a customer from discovery to evidence-led product comparisons.",link:"/products",action:"Explore product guides"},
 {label:"A clearer weekly shop",title:"The full basket matters.",description:"A good comparison explains what has been checked and what is still missing.",link:"/groceries",action:"Explore groceries"},
 {label:"Everyday decisions",title:"Look beyond the monthly price.",description:"Bring transparent information into focus before deciding what is worthwhile.",link:"/compare",action:"Compare contracts"}
] as const;
export default function StorefrontComposition({departments}:{departments:PreviewDepartment[]}){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(true),[reducedMotion,setReducedMotion]=useState(true);
 useEffect(()=>{
  const m=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReducedMotion(m.matches);
  update();m.addEventListener("change",update);return()=>m.removeEventListener("change",update);
 },[]);
 useEffect(()=>{
  if(paused||reducedMotion)return;
  const id=window.setInterval(()=>setActive(i=>(i+1)%SLIDES.length),8500);
  return()=>window.clearInterval(id);
 },[paused,reducedMotion]);
 const slide=SLIDES[active];
 return <section className={styles.study} aria-label="Private storefront layout study">
  <div className={styles.heading}><p>DESIGN STUDY · NO PRODUCT PUBLISHING</p><h2>AVUQO storefront composition</h2><span>Rotating features, trust signals and category-style tiles, in AVUQO&apos;s own visual language.</span></div>
  <div className={styles.searchExample} aria-disabled="true">⌕ &nbsp; Search products, categories and guides <span>Preview only</span></div>
  <div className={styles.banner}>
   <div className={styles.bannerCopy}><p>{slide.label}</p><h3>{slide.title}</h3><span>{slide.description}</span><Link href={slide.link}>{slide.action}<ArrowRight size={17}/></Link></div>
   <div className={styles.bannerArt} aria-hidden="true"><b>Q</b><small><ShieldCheck size={16}/> Evidence before hype</small></div>
   <div className={styles.controls}>
    <button aria-label="Previous banner" onClick={()=>setActive(i=>(i+SLIDES.length-1)%SLIDES.length)}><ChevronLeft size={17}/></button>
    <span>{active+1} / {SLIDES.length}</span>
    <button aria-label="Next banner" onClick={()=>setActive(i=>(i+1)%SLIDES.length)}><ChevronRight size={17}/></button>
    <button aria-label={paused?"Start rotation":"Pause rotation"} onClick={()=>setPaused(x=>!x)}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>
   </div>
  </div>
  <div className={styles.assurances}><span>Independent comparisons</span><span>No invented discount claims</span><span>Image rights still pending</span></div>
  <div className={styles.tiles}>{departments.slice(0,4).map((d,i)=><article key={d.merchant} className={styles.tile}>
   <div className={styles.tileArtwork} data-tone={i} aria-hidden="true"><span>{["✦","◇","✳","◈"][i]}</span></div>
   <div className={styles.tileCopy}><p>MERCHANT FEED · PRIVATE SAMPLE</p><h4>{d.label}</h4><span>{d.count} staged product examples</span><small>Not yet verified for public offers</small></div>
  </article>)}</div>
  <p className={styles.footnote}>Reference layout only. These are not live retailer banners, prices, authorised merchant images, store services or deliverable advertisements.</p>
 </section>;
}
