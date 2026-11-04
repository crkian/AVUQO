"use client";
import {useState} from "react";
import Link from "next/link";
type Item={id:string;title:string;brand:string|null;category_path:string|null;price:number|string|null;currency:string;image_url:string|null;availability:string|null;model:string|null;ean:string|null};
function imageFromTooledUp(raw:string|null){
 if(!raw)return null;
 try{
  const u=new URL(raw);
  return u.protocol==="https:"&&u.hostname==="www.tooled-up.com"&&!u.username&&!u.password?u.href:null;
 }catch{return null;}
}
export default function TooledUpCards({items}:{items:Item[]}){
 const [images,setImages]=useState(false);
 const [broken,setBroken]=useState<string[]>([]);
 return <section style={{display:"grid",gap:18}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,padding:16,background:"#f4effb",borderRadius:14}}>
   <div><strong>Private product photography</strong><p style={{fontSize:13,margin:"4px 0",color:"#695f73"}}>Images load directly from Tooled-Up only after you choose to inspect them. Publication rights are not confirmed.</p></div>
   <button type="button" onClick={()=>setImages(v=>!v)} aria-pressed={images} style={{padding:"11px 15px",border:"1px solid #6749ab",borderRadius:9,background:"#fff",fontWeight:700}}>{images?"Hide images":"Show imported images privately"}</button>
  </div>
  {items.length===0?<p>No staged products match these filters. Try another brand or department.</p>:
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:17}}>
   {items.map(item=>{
    const img=images&&!broken.includes(item.id)?imageFromTooledUp(item.image_url):null;
    return <article key={item.id} style={{background:"white",border:"1px solid #e7e3eb",borderRadius:16,overflow:"hidden",display:"grid",gridTemplateRows:"190px auto"}}>
     <div style={{display:"grid",placeItems:"center",background:"#f7f6fa",position:"relative"}}>
      {img?<img src={img} alt={item.title} loading="lazy" referrerPolicy="no-referrer" onError={()=>setBroken(old=>[...old,item.id])} style={{maxHeight:"100%",maxWidth:"100%",objectFit:"contain",padding:12}}/>:<span style={{textAlign:"center",fontSize:12,color:"#81798b"}}>{images?"Image unavailable / cannot be loaded":"Merchant image hidden"}</span>}
     </div>
     <div style={{padding:16,display:"grid",alignContent:"start",gap:8}}>
      <span style={{fontSize:12,color:"#6b5693",fontWeight:800}}>{item.brand||"Brand not supplied"}</span>
      <h2 style={{fontSize:16,lineHeight:1.35,margin:0}}>{item.title}</h2>
      <span style={{fontSize:12,color:"#74707b"}}>{item.category_path?.split(" > ").slice(0,3).join(" › ")||"Unclassified"}</span>
      {item.model&&<span style={{fontSize:12}}>Model: {item.model}</span>}
      {item.ean&&<span style={{fontSize:12}}>EAN: {item.ean}</span>}
      {item.availability&&<span style={{fontSize:12}}>Feed stock: {item.availability} (unverified)</span>}
      <strong>{item.price===null?"Price missing":`£${Number(item.price).toFixed(2)}`}</strong>
      <small style={{color:"#756f7e"}}>Historical feed price, not a current offer</small>
      <Link href={`/preview/products/${item.id}`} style={{fontWeight:800,color:"#5d3aa8"}}>Inspect product details</Link>
     </div>
    </article>;
   })}
  </div>}
 </section>;
}
