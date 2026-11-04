"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowUpDown,Search,SlidersHorizontal,X,Scale,ShieldCheck} from "lucide-react";
import {stagedPrice} from "../../../lib/feed-imports/preview-selection";
import {suggestedDepartment} from "../../../lib/feed-imports/preview-departments";
import styles from "./premium-discovery.module.css";

export type PreviewItem={id:string;title:string;merchant:string;brand:string|null;rawCategory:string|null;price:number|string|null;currency:string;imageUrl:string|null;};
const toPrice=(n:number|string|null)=>n===null?Number.NaN:Number(n);
const approvedPrivateHosts=new Set(["www.cadburygiftsdirect.co.uk","cdn.shopify.com","www.tooled-up.com"]);
function safePrivateImage(value:string|null){if(!value)return null;try{const u=new URL(value);return u.protocol==="https:"&&approvedPrivateHosts.has(u.hostname)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
type Sort="featured"|"low"|"high"|"name";
export default function PremiumDiscovery({items}:{items:PreviewItem[]}){
 const [search,setSearch]=useState(""),[department,setDepartment]=useState("All departments"),[merchant,setMerchant]=useState("All retailers"),[sort,setSort]=useState<Sort>("featured"),[compare,setCompare]=useState<string[]>([]);
 const [showImages,setShowImages]=useState(false);
 const enriched=useMemo(()=>items.map(item=>({...item,department:suggestedDepartment(item.merchant,item.title,item.rawCategory)})),[items]);
 const departments=useMemo(()=>["All departments",...new Set(enriched.map(x=>x.department))].sort((a,b)=>a==="All departments"?-1:b==="All departments"?1:a.localeCompare(b)),[enriched]);
 const merchants=useMemo(()=>["All retailers",...new Set(enriched.map(x=>x.merchant))],[enriched]);
 const shown=useMemo(()=>{
  const q=search.trim().toLowerCase();
  const match=enriched.filter(x=>(department==="All departments"||x.department===department)&&(merchant==="All retailers"||x.merchant===merchant)&&(!q||[x.title,x.merchant,x.brand,x.rawCategory,x.department].some(v=>v?.toLowerCase().includes(q))));
  if(sort==="low")match.sort((a,b)=>(Number.isFinite(toPrice(a.price))?toPrice(a.price):Infinity)-(Number.isFinite(toPrice(b.price))?toPrice(b.price):Infinity));
  if(sort==="high")match.sort((a,b)=>(Number.isFinite(toPrice(b.price))?toPrice(b.price):-Infinity)-(Number.isFinite(toPrice(a.price))?toPrice(a.price):-Infinity));
  if(sort==="name")match.sort((a,b)=>a.title.localeCompare(b.title));
  return match;
 },[enriched,search,department,merchant,sort]);
 const selected=compare.map(id=>enriched.find(x=>x.id===id)).filter((x):x is (typeof enriched)[number]=>Boolean(x));
 const toggle=(id:string)=>setCompare(existing=>existing.includes(id)?existing.filter(x=>x!==id):existing.length<3?[...existing,id]:existing);
 return <div className={styles.root}>
  <section className={styles.intro} aria-label="Shopping preview controls">
   <div><span className={styles.eyebrow}>THE AVUQO EDIT</span><h2>Discover something worth a closer look.</h2><p>Browse a sample of imported products in the future shopping experience. Category labels are suggestions awaiting approval.</p></div>
   <div className={styles.count}><strong>{shown.length}</strong><span>preview products</span></div>
  </section>
  <div className={styles.imageReview}><div><strong>Owner image inspection</strong><span>Existing feed images are only loaded in this signed-in private review, when you choose to display them. Images remain unverified for publication.</span></div><button type="button" aria-pressed={showImages} onClick={()=>setShowImages(v=>!v)}>{showImages?"Hide feed images":"Show imported images privately"}</button></div>
  <div className={styles.departments} role="group" aria-label="Browse suggested departments">
   {departments.map(d=><button type="button" key={d} className={department===d?styles.selected:""} onClick={()=>setDepartment(d)}>{d}</button>)}
  </div>
  <div className={styles.toolbar}>
   <label className={styles.search}><Search size={18}/><span className={styles.sr}>Search preview products</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, brands and categories"/></label>
   <label className={styles.filter}><SlidersHorizontal size={17}/><span>Retailer</span><select value={merchant} onChange={e=>setMerchant(e.target.value)}>{merchants.map(m=><option key={m}>{m}</option>)}</select></label>
   <label className={styles.filter}><ArrowUpDown size={17}/><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Product name</option></select></label>
   {(search||department!=="All departments"||merchant!=="All retailers"||sort!=="featured")&&<button className={styles.reset} type="button" onClick={()=>{setSearch("");setDepartment("All departments");setMerchant("All retailers");setSort("featured");}}>Clear filters <X size={14}/></button>}
  </div>
  <div className={styles.disclaimer}><ShieldCheck size={17}/> Private design preview. All prices are archived values; optional owner-only feed thumbnails are not approved public imagery. Nothing can be purchased or published.</div>
  {shown.length?<div className={styles.grid}>{shown.map(item=>{
   const checked=compare.includes(item.id);
   const image=showImages?safePrivateImage(item.imageUrl):null;
   return <article className={styles.card} key={item.id}>
    <div className={styles.image}>{image?<img src={image} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className={styles.feedPhoto}/>:<><div className={styles.imageSymbol}>Q</div><span>{showImages?"Image unavailable or unsupported host":"Click above to inspect private feed images"}</span></> }<div className={styles.imageIndex}>{item.department==="Needs classification"?"CATEGORY REVIEW":item.department}</div></div>
    <div className={styles.cardBody}>
     <span className={styles.brand}>{item.brand||item.merchant}</span>
     <h3>{item.title}</h3>
     <div className={styles.meta}><span>{item.merchant}</span><span>{item.rawCategory?"Feed category recorded":"Category suggested from title"}</span></div>
     <div className={styles.price}>{stagedPrice(item.price,item.currency)}</div>
     <span className={styles.historical}>Historical import · not a live offer</span>
     <div className={styles.actions}><Link className={styles.detailLink} href={`/preview/products/${item.id}`}>Explore category-specific product details</Link><button type="button" aria-pressed={checked} disabled={!checked&&compare.length>=3} className={checked?styles.selectedCompare:styles.compare} onClick={()=>toggle(item.id)}><Scale size={16}/>{checked?"Selected to compare":"Add to preview comparison"}</button></div>
    </div>
   </article>;
  })}</div>:<div className={styles.empty}><h3>No products match these filters.</h3><p>Try another department or search term.</p><button type="button" onClick={()=>{setSearch("");setDepartment("All departments");setMerchant("All retailers");}}>Show all products</button></div>}
  {selected.length>0&&<section className={styles.comparison} aria-label="Preview comparison">
   <div className={styles.comparisonHead}><div><span className={styles.eyebrow}>COMPARE, BEFORE YOU COMMIT</span><h3>{selected.length} selected products</h3><p>Design-only comparison. Archived prices cannot be used to decide a current best deal.</p></div><button type="button" onClick={()=>setCompare([])}>Clear <X size={14}/></button></div>
   <div className={styles.comparisonCards}>{selected.map(x=><div key={x.id}><button type="button" aria-label={`Remove ${x.title} from comparison`} onClick={()=>toggle(x.id)}><X size={15}/></button><strong>{x.title}</strong><span>{x.department}</span><b>{stagedPrice(x.price,x.currency)}</b><small>{x.merchant} · historic value</small></div>)}</div>
  </section>}
 </div>;
}
