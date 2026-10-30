"use client";
import Link from "next/link";
import {ArrowRight,ChevronRight,Search,ShieldCheck} from "lucide-react";
import {useMemo,useState} from "react";
import {BROWSE_DEPARTMENTS,DEPARTMENT_GROUPS,departmentHref,topicHref} from "../../lib/categories/browse-tree";
import styles from "./DepartmentExplorer.module.css";
export default function DepartmentExplorer({
 variant="directory",onNavigate
}:{variant?:"directory"|"menu";onNavigate?:()=>void}){
 const [selectedSlug,setSelectedSlug]=useState("home");
 const [filter,setFilter]=useState("");
 const normalized=filter.trim().toLocaleLowerCase("en-GB");
 const matches=useMemo(()=>BROWSE_DEPARTMENTS.filter(d=>!normalized||
   [d.name,d.intro,...d.topics].some(t=>t.toLocaleLowerCase("en-GB").includes(normalized))),[normalized]);
 const selected=matches.find(d=>d.slug===selectedSlug)??matches[0];
 const count=BROWSE_DEPARTMENTS.reduce((sum,d)=>sum+d.topics.length,0);
 return <div className={styles.explorer+" "+styles[variant]}>
  <div className={styles.topBar}><div><span className={styles.kicker}>Explore the full directory</span>
   <h2>{variant==="menu"?"Shop by department":"25 departments. More ways to explore."}</h2>
   <p>{count} curated browse topics. Actual prices and availability only appear when verified.</p></div>
   {variant==="directory"&&<span className={styles.total}>{BROWSE_DEPARTMENTS.length} departments</span>}
  </div>
  <label className={styles.filter}><Search size={17}/><span className={styles.srOnly}>Filter departments and topics</span>
   <input value={filter} onChange={v=>setFilter(v)} placeholder="Find a department or topic" autoComplete="off"
     aria-label="Filter departments and topics" maxLength={70}/></label>
  <div className={styles.columns}>
   <div className={styles.list} aria-label="Departments">
    {DEPARTMENT_GROUPS.map(group=>{
      const visible=BROWSE_DEPARTMENTS.filter(d=>group.slugs.some(slug=>slug===d.slug)&&matches.some(m=>m.slug===d.slug));
      return visible.length?<section key={group.label} className={styles.group}>
       <h3>{group.label}</h3>
       {visible.map(d=><div key={d.slug} className={styles.listRow}>
        <button type="button" aria-pressed={selected?.slug===d.slug}
          aria-label={"Show "+d.name+" subcategories"} onClick={()=>setSelectedSlug(d.slug)}
          className={styles.selectButton}>{d.name}<ChevronRight size={14} aria-hidden="true"/></button>
       </div>)}
      </section>:null;
    })}
   </div>
   <div className={styles.detail} aria-live="polite">
    {selected?<div className={styles.detailInner} data-tone={selected.theme}>
     <div className={styles.illustration} aria-hidden="true"><span>{selected.name.slice(0,1)}</span></div>
     <div className={styles.detailCopy}>
      <span className={styles.kicker}>Explore {selected.name}</span>
      <h3>{selected.name}</h3><p>{selected.intro}</p>
      <Link className={styles.parentLink} href={departmentHref(selected)} onClick={onNavigate}>
       Open department <ArrowRight size={16}/></Link>
     </div>
     <div className={styles.topics}>
      <h4>Explore subcategories</h4>
      <div>{selected.topics.map(topic=><Link key={topic} href={topicHref(topic)} onClick={onNavigate}>
         {topic}<ChevronRight size={15} aria-hidden="true"/></Link>)}</div>
     </div>
     <p className={styles.guidance}><ShieldCheck size={16}/>{selected.advice}</p>
    </div>:<div className={styles.noMatches}>No matching departments. Try a broader term or visit the full directory.</div>}
   </div>
  </div>
  <div className={styles.footer}><span>Browse topics are not guaranteed live offers.</span>
   <Link href="/categories" onClick={onNavigate}>View all departments <ArrowRight size={15}/></Link></div>
 </div>;
}
