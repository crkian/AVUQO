"use client";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {useMemo,useState,type CSSProperties} from "react";
import {ArrowRight,Search,SlidersHorizontal} from "lucide-react";
import {BROWSE_DEPARTMENTS} from "../../lib/categories/browse-tree";
import {PARTNERS,partnerHref} from "../../lib/partners/advertiser-directory";
import {PARTNER_DEPARTMENTS,partnerCatalogueKinds} from "../../lib/partners/catalogue-taxonomy";
import styles from "../../app/partners/partners.module.css";
type Kind=typeof partnerCatalogueKinds[number]["id"];
export default function RetailerCatalogueBrowser(){
 const router=useRouter();
 const params=useSearchParams();
 const rawDepartment=params.get("department")??"";
 const selectedDepartment=BROWSE_DEPARTMENTS.some(d=>d.slug===rawDepartment)?rawDepartment:"all";
 const [kind,setKind]=useState<Kind>("all");
 const [query,setQuery]=useState("");
 const term=query.trim().toLocaleLowerCase("en-GB");
 const shown=useMemo(()=>PARTNERS.filter(p=>{
  if(kind!=="all"&&p.kind!==kind)return false;
  if(selectedDepartment!=="all"&&!(PARTNER_DEPARTMENTS[p.slug]??[]).includes(selectedDepartment))return false;
  if(!term)return true;
  return [p.name,p.tagline,p.description,p.categoryLabel,...p.topics,
   ...BROWSE_DEPARTMENTS.filter(d=>(PARTNER_DEPARTMENTS[p.slug]??[]).includes(d.slug)).map(d=>d.name)]
   .some(t=>t.toLocaleLowerCase("en-GB").includes(term));
 }).sort((a,b)=>a.name.localeCompare(b.name,"en-GB")),[kind,selectedDepartment,term]);
 const changeDepartment=(slug:string)=>router.replace(slug==="all"?"/partners":"/partners?department="+encodeURIComponent(slug),{scroll:false});
 return <section className={styles.shell+" "+styles.catalogueBrowser} aria-labelledby="retailer-browser-heading">
  <div className={styles.directoryHead}>
   <div><p className={styles.kicker}>Retailer & service catalogue</p><h2 id="retailer-browser-heading">Find a shop or service</h2>
    <p className={styles.sectionIntro}>Search by retailer, activity or AVUQO department. Every card opens an individual advertiser page, with an approved offer shelf only where the evidence permits it.</p>
   </div><Link href="/catalogue" className={styles.textAction}>Browse everything AVUQO offers <ArrowRight size={15}/></Link>
  </div>
  <div className={styles.browserPanel}>
   <label className={styles.browserSearch}><Search size={20} aria-hidden="true"/>
    <span className={styles.srOnly}>Search retailer and service partners</span>
    <input type="search" value={query} onChange={e=>setQuery(e.currentTarget.value)}
     placeholder="Search a retailer, service or product area" maxLength={100} autoComplete="off"/>
   </label>
   <div className={styles.browserControls}>
    <label className={styles.departmentPicker}><SlidersHorizontal size={17} aria-hidden="true"/>
     <span>Shop by department</span>
     <select aria-label="Choose an existing AVUQO department" value={selectedDepartment} onChange={e=>changeDepartment(e.currentTarget.value)}>
      <option value="all">All 25 departments</option>
      {BROWSE_DEPARTMENTS.map(d=><option value={d.slug} key={d.slug}>{d.name}</option>)}
     </select>
    </label>
   </div>
   <div className={styles.filterRail} role="group" aria-label="Filter by partner type">
    {partnerCatalogueKinds.map(k=><button key={k.id} type="button"
     aria-pressed={kind===k.id} className={styles.filterChip+(kind===k.id?" "+styles.filterChipActive:"")}
     onClick={()=>setKind(k.id)}>{k.name}</button>)}
   </div>
  </div>
  <div className={styles.resultsSummary}><p aria-live="polite">{shown.length} participating {shown.length===1?"partner":"partners"} match your selection.
   <span> These are advertiser relationships, not a claim that every shop has a live product-price feed.</span></p>
   {(kind!=="all"||selectedDepartment!=="all"||query)&&<button type="button" onClick={()=>{setKind("all");setQuery("");changeDepartment("all");}}>Clear filters</button>}
  </div>
  {shown.length?<div className={styles.directory}>
   {shown.map(p=><Link key={p.slug} href={partnerHref(p)} className={styles.directoryCard}
     style={{"--accent":p.accent,"--deep":p.deep,"--glow":p.glow} as CSSProperties}>
     <span className={styles.emoji} aria-hidden="true">{p.symbol}</span>
     <span className={styles.tag}>{p.kind==="retail"?"Shop & products":p.kind==="mobile"?"Phone provider":p.kind==="travel"?"Travel bookings":p.kind==="broadband"?"Broadband provider":p.kind==="motoring"?"Motoring":p.kind==="energy"?"Energy":"Services"}</span>
     <b>{p.name}</b><p>{p.tagline}</p><small className={styles.cardAreas}>{p.categoryLabel}</small>
     <strong>Explore {p.name} <ArrowRight size={15} aria-hidden="true"/></strong>
    </Link>)}
  </div>:<div className={styles.emptyCatalogue}><h3>No advertisers match those filters yet.</h3>
   <p>Try another AVUQO department, or browse the full product and services catalogue without assuming live stock.</p>
   <Link href="/catalogue">Explore the AVUQO catalogue <ArrowRight size={16}/></Link>
  </div>}
 </section>;
}
