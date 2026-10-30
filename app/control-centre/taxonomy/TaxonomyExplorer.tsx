"use client";

import {useMemo,useState} from "react";
import styles from "./taxonomy.module.css";

type CategoryRow={id:string;slug:string;name:string;parent_id:string|null;is_active:boolean};
type Derived=CategoryRow&{path:string;root:string;depth:number};
const SIZE=35;

export default function TaxonomyExplorer({categories}:{categories:CategoryRow[]}){
 const [query,setQuery]=useState("");
 const [status,setStatus]=useState("all");
 const [selectedRoot,setSelectedRoot]=useState("all");
 const [page,setPage]=useState(1);

 const enhanced=useMemo(()=>{
  const byId=new Map(categories.map(c=>[c.id,c]));
  return categories.map(c=>{
   const chain:CategoryRow[]=[];
   const seen=new Set<string>();
   let current:CategoryRow|undefined=c;
   while(current&&!seen.has(current.id)&&chain.length<8){
    seen.add(current.id);chain.unshift(current);
    current=current.parent_id?byId.get(current.parent_id):undefined;
   }
   return {...c,path:chain.map(x=>x.name).join(" / "),
     root:chain[0]?.slug??c.slug,depth:Math.max(0,chain.length-1)};
  }) as Derived[];
 },[categories]);
 const roots=useMemo(()=>{
  const bySlug=new Map(enhanced.filter(x=>x.parent_id===null).map(x=>[x.slug,x.name]));
  return [...bySlug].sort((a,b)=>a[1].localeCompare(b[1]));
 },[enhanced]);
 const filtered=useMemo(()=>{
  const q=query.trim().toLowerCase();
  return enhanced.filter(r=>(status==="all"||(status==="active"?r.is_active:!r.is_active))&&
   (selectedRoot==="all"||r.root===selectedRoot)&&
   (!q||[r.name,r.slug,r.path].some(x=>x.toLowerCase().includes(q))));
 },[enhanced,query,status,selectedRoot]);
 const count=Math.max(1,Math.ceil(filtered.length/SIZE));
 const currentPage=Math.max(1,Math.min(page,count));
 const visible=filtered.slice((currentPage-1)*SIZE,currentPage*SIZE);
 const active=categories.filter(x=>x.is_active).length;
 return <section className={styles.wrap} aria-label="Private category catalogue">
   <div className={styles.stats}>
    <div><span>All categories</span><strong>{categories.length.toLocaleString("en-GB")}</strong></div>
    <div><span>Active categories</span><strong>{active.toLocaleString("en-GB")}</strong></div>
    <div><span>Inactive candidates</span><strong>{(categories.length-active).toLocaleString("en-GB")}</strong></div>
    <div><span>Departments at root</span><strong>{roots.length}</strong></div>
   </div>
   <div className={styles.filters}>
    <label>Find category<input type="search" placeholder="e.g. crochet, plumbing, pet fountain"
     value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label>
    <label>Department<select value={selectedRoot} onChange={e=>{setSelectedRoot(e.target.value);setPage(1);}}>
      <option value="all">All departments</option>
      {roots.map(([slug,name])=><option key={slug} value={slug}>{name}</option>)}
     </select></label>
    <label>Visibility<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
      <option value="all">Active + inactive</option><option value="inactive">Inactive only</option>
      <option value="active">Active only</option>
    </select></label>
   </div>
   <div className={styles.results} role="status" aria-live="polite">
    {filtered.length.toLocaleString("en-GB")} matching categories. Inactive candidates are not live shopping pages.
   </div>
   {visible.length?<div className={styles.list}>
    {visible.map(row=><article className={styles.entry} key={row.id}>
      <div><strong>{row.name}</strong><p>{row.path}</p><small>{row.slug}</small></div>
      <span className={row.is_active?styles.active:styles.inactive}>
       {row.is_active?"Existing active":"Inactive"}
      </span>
    </article>)}
   </div>:<div className={styles.empty}>No categories match these filters.</div>}
   <div className={styles.pagination}>
    <button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage<=1}>Previous</button>
    <span>Page {currentPage} of {count}</span>
    <button type="button" onClick={()=>setPage(p=>Math.min(count,p+1))} disabled={currentPage>=count}>Next</button>
   </div>
 </section>;
}
