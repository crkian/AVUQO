/**
 * Deterministic, read-only design samples from staged feed records.
 * Never creates products, listings, public pages, prices or publication rights.
 */
export type StagedPreviewRow={
 id:string;merchant_product_id:string;title:string;price:number|string|null;
 currency:string;brand:string|null;category:string|null;status:string;
 review_decision:string|null;image_url:string|null
};
export function safePreviewSelection(rows:StagedPreviewRow[],limit=6):StagedPreviewRow[]{
 const unique=new Map<string,StagedPreviewRow>();
 for(const row of rows){
  if(!row||typeof row.id!=="string"||typeof row.title!=="string"||!row.title.trim())continue;
  const key=(row.merchant_product_id||row.id).trim();
  if(!key||unique.has(key))continue;
  unique.set(key,row);
 }
 const records=[...unique.values()];
 const chosen:StagedPreviewRow[]=[];
 const add=(row:StagedPreviewRow|undefined)=>{
  if(row&&!chosen.some(p=>p.id===row.id)&&chosen.length<limit)chosen.push(row);
 };
 const reviewed=records.filter(r=>r.status==="review");
 add(reviewed[0]);add(reviewed[1]);
 const lengthSorted=[...reviewed].sort((a,b)=>b.title.length-a.title.length);
 add(lengthSorted[0]);add(lengthSorted[1]);
 add([...reviewed].sort((a,b)=>a.title.length-b.title.length)[0]);
 add(records.find(r=>r.status==="excluded"));
 for(const row of reviewed)add(row);
 for(const row of records)add(row);
 return chosen.slice(0,limit);
}
export function stagedPrice(value:string|number|null,currency:string){
 if(value===null||value===""||!Number.isFinite(Number(value))||Number(value)<0)return "Price unavailable";
 const code=/^[A-Z]{3}$/.test(currency)?currency:"GBP";
 try{return new Intl.NumberFormat("en-GB",{style:"currency",currency:code}).format(Number(value));}
 catch{return "Price unavailable";}
}
