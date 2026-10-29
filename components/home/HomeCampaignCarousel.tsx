"use client";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { HomeCampaign } from "../../lib/marketing/homepage";
import styles from "./HomeCampaignCarousel.module.css";

export default function HomeCampaignCarousel({campaigns}:{campaigns:HomeCampaign[]}) {
 const slides=campaigns.length?campaigns:[];
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(true);
 useEffect(()=>{
  const query=window.matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>setReducedMotion(query.matches);
  update();query.addEventListener("change",update);
  return ()=>query.removeEventListener("change",update);
 },[]);
 useEffect(()=>{
  if(slides.length<2||paused||reducedMotion)return;
  const id=window.setInterval(()=>setActive(i=>(i+1)%slides.length),7500);
  return ()=>window.clearInterval(id);
 },[slides.length,paused,reducedMotion]);
 if(!slides.length)return null;
 const selected=slides[active%slides.length];
 return <section className={styles.section} aria-label="Featured campaigns">
   <div className={styles.card}>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{selected.sponsored?"Sponsored placement · Advertisement":"Featured on AVUQO"}</p>
      <h2>{selected.title}</h2>
      <p>{selected.summary}</p>
      <Link className={styles.cta} href={selected.href}>{selected.ctaLabel}<ArrowRight size={17}/></Link>
    </div>
    <div className={styles.art} aria-hidden="true"><span>Q</span><div className={styles.orbit}/></div>
    {slides.length>1&&<div className={styles.controls}>
      <button type="button" onClick={()=>setActive(i=>(i-1+slides.length)%slides.length)}
       aria-label="Previous featured campaign"><ChevronLeft size={19}/></button>
      <span className={styles.count} aria-live="off">{active%slides.length+1} of {slides.length}</span>
      <button type="button" onClick={()=>setActive(i=>(i+1)%slides.length)}
       aria-label="Next featured campaign"><ChevronRight size={19}/></button>
      <button type="button" onClick={()=>setPaused(x=>!x)}
       aria-label={paused?"Resume rotation":"Pause rotation"}>{paused?<Play size={17}/>:<Pause size={17}/>}</button>
    </div>}
   </div>
   <p className={styles.disclosure}>Featured placements are separate from organic rankings, independent AVUQO Scores and grocery comparisons.</p>
 </section>;
}
