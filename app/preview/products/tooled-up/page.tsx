import type {Metadata} from "next";
import {connection} from "next/server";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../lib/supabase/server";
import TooledUpCards from "./TooledUpCards";
export const metadata:Metadata={title:"Tooled-Up private catalogue | AVUQO",robots:{index:false,follow:false}};
export const instant=false;
type Params={brand?:string;department?:string;q?:string;sort?:string;page?:string};
type Facet={value:string;count:number};
type Product={id:string;title:string;brand:string|null;category_path:string|null;price:number|string|null;currency:string;image_url:string|null;availability:string|null;model:string|null;ean:string|null;matching_total:number};
const clean=(v:string|undefined,max=80)=>v?.trim().slice(0,max)||"";
function link(p:Params){const q=new URLSearchParams();for(const [k,v] of Object.entries(p))if(v)q.set(k,v);return "/preview/products/tooled-up"+(q.size?"?"+q.toString():"");}
export default async function Page({searchParams}:{searchParams:Promise<Params>}){
 await connection();
 await requireControlCentreAccess();
 const db=await createClient();
 const {data:run,error:runError}=await db.from("feed_import_runs").select("id,total_count,created_at,status")
  .eq("merchant_id","496").eq("status","private_review").order("created_at",{ascending:false}).limit(1).maybeSingle();
 const args=await searchParams;
 const brand=clean(args.brand,120),department=clean(args.department,120),q=clean(args.q),sort=["name","brand","price_asc","price_desc"].includes(args.sort||"")?args.sort!:"name";
 const page=Math.min(5000,Math.max(1,Number.parseInt(args.page||"1",10)||1));
 const [facetResult,productResult]=run?await Promise.all([
  db.rpc("private_tooled_up_facets",{p_import_id:run.id}),
  db.rpc("private_tooled_up_search",{p_import_id:run.id,p_brand:brand||null,p_department:department||null,p_query:q||null,p_sort:sort,p_page:page})
 ]):[{data:null,error:null},{data:[],error:null}];
 const facets=facetResult.data as {brands:Facet[];departments:Facet[];count:number}|null;
 const products=(productResult.data||[]) as Product[];
 const total=products.length?Number(products[0].matching_total):0;
 const pages=Math.ceil(total/48);
 const next=(change:Partial<Params>)=>link({...{brand,department,q,sort,page:String(page)},...change});
 return <main style={{background:"#f7f5f2",minHeight:"100vh",padding:"34px max(22px,calc((100vw - 1300px)/2)) 90px",color:"#222034"}}>
  <nav style={{marginBottom:25}}><Link href="/preview/products">← Private merchant catalogues</Link></nav>
  <p style={{fontSize:12,fontWeight:800,color:"#755ab2",letterSpacing:1.4}}>OWNER-ONLY · HISTORICAL FEED DATA</p>
  <h1 style={{fontSize:"clamp(28px,4vw,46px)",margin:"8px 0 13px"}}>Explore Tooled-Up products</h1>
  <p style={{maxWidth:760,color:"#666273",lineHeight:1.7}}>Browse authentic privately staged tools by retailer-supplied brand and detailed department. Neither prices nor images are approved for public publication.</p>
  {(!run||runError)?<p role="alert">A completed private Tooled-Up import was not found.</p>:
  <>
   <p><strong>{Number(facets?.count||run.total_count).toLocaleString("en-GB")}</strong> products in the current completed private import. Brands are retailer-supplied, not verified legal manufacturers.</p>
   <form method="GET" action="/preview/products/tooled-up" style={{background:"white",padding:20,borderRadius:16,border:"1px solid #e8e4ea",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",alignItems:"end",gap:13,margin:"24px 0"}}>
    <label style={{display:"grid",gap:7}}><strong>Search full catalogue</strong><input name="q" defaultValue={q} placeholder="Product, model or product ID" maxLength={80} style={{padding:12,border:"1px solid #cfc9d9",borderRadius:9}}/></label>
    <label style={{display:"grid",gap:7}}><strong>Brand / manufacturer label</strong><select name="brand" defaultValue={brand} style={{padding:12,border:"1px solid #cfc9d9",borderRadius:9}}>
     <option value="">All brands</option>{(facets?.brands||[]).map(f=><option key={f.value} value={f.value}>{f.value} ({f.count.toLocaleString("en-GB")})</option>)}
    </select></label>
    <label style={{display:"grid",gap:7}}><strong>Tool department</strong><select name="department" defaultValue={department} style={{padding:12,border:"1px solid #cfc9d9",borderRadius:9}}>
     <option value="">All departments</option>{(facets?.departments||[]).map(f=><option key={f.value} value={f.value}>{f.value} ({f.count.toLocaleString("en-GB")})</option>)}
    </select></label>
    <label style={{display:"grid",gap:7}}><strong>Sort</strong><select name="sort" defaultValue={sort} style={{padding:12,border:"1px solid #cfc9d9",borderRadius:9}}>
     <option value="name">Name A to Z</option><option value="brand">Brand A to Z</option><option value="price_asc">Imported price low to high</option><option value="price_desc">Imported price high to low</option>
    </select></label>
    <button type="submit" style={{padding:13,border:0,borderRadius:9,background:"#5a40a8",fontWeight:800,color:"white"}}>Find products</button>
    <Link href="/preview/products/tooled-up" style={{padding:10,fontWeight:700}}>Clear filters</Link>
   </form>
   {(facetResult.error||productResult.error)&&<p role="alert">Private product search is unavailable. Check the catalogue discovery migration.</p>}
   {!facetResult.error&&!productResult.error&&<>
    <p style={{color:"#676174"}}>Showing {total===0?0:(page-1)*48+1}–{Math.min(page*48,total)} of {total.toLocaleString("en-GB")} matched products. Filters apply across the full staged catalogue.</p>
    <TooledUpCards items={products}/>
    {pages>1&&<nav aria-label="Tooled-Up catalogue pages" style={{display:"flex",justifyContent:"space-between",gap:10,marginTop:28,flexWrap:"wrap"}}>
     {page>1?<Link href={next({page:String(page-1)})}>← Previous 48</Link>:<span>First page</span>}
     <strong>Page {page} / {pages.toLocaleString("en-GB")}</strong>
     {page<pages?<Link href={next({page:String(page+1)})}>Next 48 →</Link>:<span>Last page</span>}
    </nav>}
   </>}
  </>}
  <p style={{marginTop:38,fontSize:13,color:"#6f6876"}}>Private owner preview only. No affiliate checkout links, public product imagery, verified real-time prices, or permission to publish.</p>
 </main>;
}
