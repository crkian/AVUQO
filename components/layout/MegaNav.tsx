"use client";
import Link from "next/link";
import {ChevronDown,ChevronRight} from "lucide-react";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {orderedNavigation,type NavigationContent} from "../../lib/content/navigation";
import styles from "./MegaNav.module.css";
import DepartmentExplorer from "../categories/DepartmentExplorer";
export default function MegaNav({menuOpen,onNavigate,navigation}:{
 menuOpen:boolean;onNavigate:()=>void;navigation:NavigationContent
}){
 const [expanded,setExpanded]=useState<string|null>(null);
 const navRef=useRef<HTMLElement>(null);
 const pathname=usePathname();
 const groups=orderedNavigation(navigation);
 useEffect(()=>{
  const onEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setExpanded(null)};
  const onPointer=(event:PointerEvent)=>{
   if(navRef.current&&!navRef.current.contains(event.target as Node))setExpanded(null);
  };
  document.addEventListener("pointerdown",onPointer);
  window.addEventListener("keydown",onEscape);
  return ()=>{
   document.removeEventListener("pointerdown",onPointer);
   window.removeEventListener("keydown",onEscape);
  };
 },[]);
 return <nav ref={navRef} id="avuqo-primary-nav" aria-label="Primary navigation"
   className={styles.nav+" primary-nav "+(menuOpen?"is-open":"")}
   onBlur={event=>{
     const next=event.relatedTarget;
     if(next instanceof Node&&!event.currentTarget.contains(next))setExpanded(null);
   }}>
  {groups.map((group,index)=>{
   const active=pathname===group.href||group.links.some(link=>pathname===link.href);
   return <div className={styles.group+(group.id==="categories"?" "+styles.categoryGroup:"")} key={group.id}>
     <div className={styles.groupHeading}>
       <Link href={group.href} className={styles.groupLink+(active?" "+styles.active:"")}
         onClick={()=>{setExpanded(null);onNavigate()}}
         aria-current={pathname===group.href?"page":undefined}>{group.label}</Link>
       <button type="button" className={styles.expand}
         aria-label={"Show "+group.label+" submenu"}
         aria-expanded={expanded===group.id}
         aria-controls={"avuqo-subnav-"+index}
         onClick={()=>setExpanded(current=>current===group.id?null:group.id)}>
         <ChevronDown size={17} aria-hidden="true"/>
       </button>
     </div>
     <div id={"avuqo-subnav-"+index}
       className={styles.dropdown+" "+(expanded===group.id?styles.open:"")+(group.id==="categories"?" "+styles.wideDropdown:"")}
       hidden={expanded!==group.id}>
       <div className={styles.intro}><strong>{group.label}</strong>
         <span>{group.intro}</span>
         <Link href={group.href} onClick={()=>{setExpanded(null);onNavigate()}}
           className={styles.viewAll}>View {group.label.toLowerCase()} <ChevronRight size={14}/></Link>
       </div>
       {group.id==="categories"?<DepartmentExplorer variant="menu" onNavigate={()=>{setExpanded(null);onNavigate()}}/>:<div className={styles.linkGrid}>
        {group.links.map(link=><Link key={link.href} href={link.href}
         className={styles.menuLink} onClick={()=>{setExpanded(null);onNavigate()}}>
         <span><b>{link.label}</b><small>{link.description}</small></span>
         <ChevronRight size={15} aria-hidden="true"/>
        </Link>)}
       </div>}
     </div>
    </div>
  })}
 </nav>;
}
