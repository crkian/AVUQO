import {pneusTechnicalEvidence} from "./pneus-technical-evidence.mjs";

/** Exact, private candidate matching. Neither a GTIN nor size candidate grants publication. */
export function tyreIdentity(row){
 const meta=row?.metadata??{};
 const codes=[meta.ean,meta.gtin].filter(x=>typeof x==="string"&&x.trim()).map(x=>x.trim());
 if(!codes.length||codes.some(x=>x!==codes[0])||!pneusTechnicalEvidence("",codes[0]).gtinChecksumValid)return null;
 const brand=typeof row.brand==="string"?row.brand.trim().toLowerCase().replace(/\s+/g," "):"";
 return {code:codes[0],brand};
}
export function tyreIdentityIndex(rows){
 const index=new Map();
 for(const row of rows){
  const id=tyreIdentity(row);
  if(!id)continue;
  if(index.has(id.code))index.set(id.code,null);
  else index.set(id.code,{row,brand:id.brand});
 }
 return index;
}
export function comparePrivateTyreIdentities(pneus,tyres){
 const p=tyreIdentityIndex(pneus),t=tyreIdentityIndex(tyres);
 let uniqueMatches=0,brandMatches=0,brandConflicts=0,missingBrand=0,ambiguous=0,sizeCandidates=0;
 for(const [code,left] of p){
  if(!t.has(code))continue;
  const right=t.get(code);
  if(!left||!right){ambiguous++;continue;}
  uniqueMatches++;
  if(!left.brand||!right.brand){missingBrand++;continue;}
  if(left.brand!==right.brand){brandConflicts++;continue;}
  brandMatches++;
  const m=right.row.metadata??{},s=m.tyre_size_candidate;
  if(m.tyre_size_conflict===false&&s&&Number.isInteger(s.width_mm)&&s.width_mm>=125&&s.width_mm<=355&&Number.isInteger(s.aspect_ratio)&&s.aspect_ratio>=20&&s.aspect_ratio<=90&&Number.isInteger(s.rim_inches)&&s.rim_inches>=10&&s.rim_inches<=24)sizeCandidates++;
 }
 return {uniqueMatches,brandMatches,brandConflicts,missingBrand,ambiguous,sizeCandidates,verifiedEquivalentOffers:0};
}
