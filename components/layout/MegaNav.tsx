"use client";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./MegaNav.module.css";

type Group = {label:string; intro:string; links:{label:string;href:string;description:string}[]};
export const MENU_GROUPS:Group[]=[
 {label:"Discover",intro:"Find something worth your time",links:[
  {label:"Explore AVUQO",href:"/discover",description:"Start with the big picture"},
  {label:"Search everything",href:"/search",description:"Find a product or topic"},
  {label:"Shopping",href:"/shopping",description:"Shop carefully, compare confidently"},
  {label:"Deals & sales",href:"/sales",description:"Browse verified seasonal guidance"},
  {label:"Reality Check",href:"/reality-check",description:"Read beyond the headline"}]},
 {label:"Shop by category",intro:"Useful buying guides",links:[
  {label:"Technology",href:"/tech",description:"Phones, computing and devices"},
  {label:"Home & living",href:"/home",description:"Furniture and home essentials"},
  {label:"Beauty",href:"/beauty",description:"Skincare and wellbeing"},
  {label:"Fashion",href:"/fashion",description:"Clothing and everyday style"},
  {label:"Gifts",href:"/gifts",description:"Thoughtful gifting ideas"},
  {label:"Toys",href:"/toys",description:"Playtime and family"},
  {label:"Pets",href:"/pets",description:"Care for your companions"}]},
 {label:"Compare & save",intro:"Make costs easier to understand",links:[
  {label:"Compare contracts",href:"/compare",description:"Mobile, broadband and TV"},
  {label:"Groceries",href:"/groceries",description:"Plan a clearer weekly basket"},
  {label:"Product guides",href:"/products",description:"Evidence-led product details"},
  {label:"Watches",href:"/watches",description:"Keep an eye on what matters"},
  {label:"Saved items",href:"/saved",description:"Your bookmarked ideas"},
  {label:"Shared lists",href:"/lists",description:"Plan together"}]},
 {label:"Life & services",intro:"The bigger everyday decisions",links:[
  {label:"Travel",href:"/travel",description:"Journeys, breaks and inclusions"},
  {label:"Motoring",href:"/motoring",description:"Ownership and running costs"},
  {label:"Insurance explained",href:"/insurance",description:"Understand the policy wording"},
  {label:"Broadband",href:"/broadband",description:"See the full contract cost"},
  {label:"Services",href:"/services",description:"Practical household guidance"},
  {label:"Experiences",href:"/experiences",description:"Moments worth planning"}]},
 {label:"Seasonal",intro:"Browse by occasion",links:[
  {label:"Black Friday",href:"/black-friday",description:"Check the real value"},
  {label:"Christmas",href:"/christmas",description:"Thoughtful gift planning"},
  {label:"Sales",href:"/sales",description:"Offers with context"}]},
 {label:"About AVUQO",intro:"How we work",links:[
  {label:"About",href:"/about",description:"The AVUQO idea"},
  {label:"Trust & independence",href:"/trust",description:"Why evidence comes first"},
  {label:"Editorial policy",href:"/editorial-policy",description:"How content is prepared"},
  {label:"Affiliate disclosure",href:"/affiliate-disclosure",description:"Commercial transparency"},
  {label:"Contact",href:"/contact",description:"Get in touch"}]}
];
export default function MegaNav({menuOpen,onNavigate}:{
 menuOpen:boolean;onNavigate:()=>void
}) {
 const [expanded,setExpanded]=useState<string|null>(null);
 useEffect(()=>{
  const onEscape=(e:KeyboardEvent)=>{if(e.key==="Escape")setExpanded(null)};
  window.addEventListener("keydown",onEscape);
  return ()=>window.removeEventListener("keydown",onEscape);
 },[]);
 return <nav id="avuqo-primary-nav" aria-label="Primary navigation"
   className={styles.nav+" primary-nav "+(menuOpen?"is-open":"")}
   onBlur={event=>{
     const next=event.relatedTarget;
     if(next instanceof Node&&!event.currentTarget.contains(next))setExpanded(null);
   }}>
  {MENU_GROUPS.map((group,index)=><div className={styles.group} key={group.label}>
    <button className={styles.trigger} type="button"
      aria-expanded={expanded===group.label}
      aria-controls={"avuqo-subnav-"+index}
      onClick={()=>setExpanded(current=>current===group.label?null:group.label)}>
      {group.label}<ChevronDown size={15} aria-hidden="true"/>
    </button>
    <div id={"avuqo-subnav-"+index}
      className={styles.dropdown+" "+(expanded===group.label?styles.open:"")}>
      <div className={styles.intro}><strong>{group.label}</strong>
        <span>{group.intro}</span></div>
      <div className={styles.linkGrid}>
        {group.links.map(link=><Link key={link.href+link.label} href={link.href}
          className={styles.menuLink}
          onClick={()=>{setExpanded(null);onNavigate()}}>
          <span><b>{link.label}</b><small>{link.description}</small></span>
          <ChevronRight size={15} aria-hidden="true"/>
        </Link>)}
      </div>
    </div>
  </div>)}
 </nav>;
}
