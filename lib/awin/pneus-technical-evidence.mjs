/** Private technical observations only. No currency, fitting or publication inference. */
export function pneusTechnicalEvidence(title,ean){
 const text=typeof title==="string"?title.slice(0,500):"";
 const matches=[...text.matchAll(/(?:^|[^0-9A-Za-z])(\d{3})\s*\/\s*(\d{2})\s*(?:ZR|R)\s*(\d{2})(?!\d)(?:\s+(\d{2,3})([A-Z]))?/gi)];
 const dimensions=new Map();
 for(const m of matches){
  const width=Number(m[1]),profile=Number(m[2]),rim=Number(m[3]);
  if(width<125||width>355||profile<20||profile>90||rim<10||rim>24)continue;
  const size=width+"/"+profile+" R"+rim;
  dimensions.set(size,{width,profile,rim});
 }
 const size=dimensions.size===1?[...dimensions.values()][0]:null;
 const code=typeof ean==="string"?ean.trim():"";
 let gtinChecksumValid=false;
 if(/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)&&!/^0+$/.test(code)){
  let sum=0;
  for(let i=code.length-2,j=0;i>=0;i--,j++)sum+=Number(code[i])*(j%2===0?3:1);
  gtinChecksumValid=(10-sum%10)%10===Number(code.at(-1));
 }
 return {size,ambiguousSize:dimensions.size>1,gtinChecksumValid};
}
