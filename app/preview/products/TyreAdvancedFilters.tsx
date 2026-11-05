import Link from "next/link";

export type TyreFacetValues={
 brands:string[];widths:number[];profiles:number[];rims:number[];
};
export type TyreFilterSelection={
 brand:string;width:string;profile:string;rim:string;q:string;
 min:string;max:string;sort:string;
};
const fieldStyle={
 padding:"11px 12px",border:"1px solid #ded5e4",borderRadius:10,
 background:"white",color:"#372c3c",minHeight:44,width:"100%"
} as const;
const labelStyle={display:"grid",gap:7,fontSize:12,fontWeight:750,color:"#554b59"} as const;
const prettyBrand=(name:string)=>name.replace(/\b[A-Z]{3,}\b/g,v=>
 v.slice(0,1)+v.slice(1).toLowerCase());
export default function TyreAdvancedFilters({facets,selected,resultCount}:{
 facets:TyreFacetValues;selected:TyreFilterSelection;resultCount:number;
}){
 return <section aria-label="Advanced tyre search" style={{
  background:"#f7f2fa",border:"1px solid #e5d8ec",borderRadius:20,
  padding:"clamp(18px,3vw,28px)",marginBottom:25
 }}>
  <div style={{display:"flex",justifyContent:"space-between",gap:15,alignItems:"start",flexWrap:"wrap",marginBottom:19}}>
   <div><span style={{fontSize:11,fontWeight:850,letterSpacing:1.3,color:"#725783"}}>MOTORING · PRIVATE TYRE FINDER</span>
    <h2 style={{margin:"7px 0",fontSize:26,letterSpacing:"-.035em"}}>Find tyres by exact specifications</h2>
    <p style={{margin:0,fontSize:13,lineHeight:1.6,color:"#766c79"}}>Searches the full imported review catalogue, not just the visible page. Manufacturer is feed-supplied; tyre sizes are unverified text-derived candidates.</p>
   </div>
   <div style={{padding:"12px 16px",borderRadius:12,background:"white",border:"1px solid #e6dbe8"}}>
    <strong style={{display:"block",fontSize:24}}>{resultCount.toLocaleString("en-GB")}</strong>
    <small>matching private records</small>
   </div>
  </div>
  <form action="/preview/products" method="get" style={{display:"grid",gap:15}}>
   <input name="merchant" type="hidden" value="12715"/>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
    <label style={labelStyle}>Manufacturer
     <select name="brand" defaultValue={selected.brand} style={fieldStyle}>
      <option value="">All manufacturers</option>
      {facets.brands.map(brand=><option key={brand} value={brand}>{prettyBrand(brand)}</option>)}
     </select>
    </label>
    <label style={labelStyle}>Tyre width (mm)
     <select name="width" defaultValue={selected.width} style={fieldStyle}>
      <option value="">Any width</option>
      {facets.widths.map(x=><option key={x} value={x}>{x} mm</option>)}
     </select>
    </label>
    <label style={labelStyle}>Profile / aspect ratio
     <select name="profile" defaultValue={selected.profile} style={fieldStyle}>
      <option value="">Any profile</option>
      {facets.profiles.map(x=><option key={x} value={x}>{x}</option>)}
     </select>
    </label>
    <label style={labelStyle}>Wheel diameter
     <select name="rim" defaultValue={selected.rim} style={fieldStyle}>
      <option value="">Any rim size</option>
      {facets.rims.map(x=><option key={x} value={x}>R{x}</option>)}
     </select>
    </label>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
    <label style={labelStyle}>Search tyre model or name
     <input name="q" type="search" maxLength={80} defaultValue={selected.q} placeholder="e.g. Pilot Sport, AllSeasonContact" style={fieldStyle}/>
    </label>
    <label style={labelStyle}>Min historic price (£)
     <input name="min" type="number" min="0" max="100000" step="0.01" defaultValue={selected.min} placeholder="No minimum" style={fieldStyle}/>
    </label>
    <label style={labelStyle}>Max historic price (£)
     <input name="max" type="number" min="0" max="100000" step="0.01" defaultValue={selected.max} placeholder="No maximum" style={fieldStyle}/>
    </label>
    <label style={labelStyle}>Sort results
     <select name="sort" defaultValue={selected.sort} style={fieldStyle}>
      <option value="name">Model / product name</option>
      <option value="price_low">Historic price: low first</option>
      <option value="price_high">Historic price: high first</option>
      <option value="newest">Recently staged</option>
     </select>
    </label>
   </div>
   <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
    <button type="submit" style={{background:"#5b3d77",color:"white",border:0,borderRadius:11,padding:"13px 22px",fontWeight:850,cursor:"pointer"}}>Search all imported tyres</button>
    <Link href="/preview/products?merchant=12715" style={{padding:"12px 16px",fontSize:13,fontWeight:750,color:"#624878"}}>Clear all filters</Link>
    <small style={{color:"#7e7181"}}>Archived prices only · No live quotes or fitment approval</small>
   </div>
  </form>
 </section>;
}
