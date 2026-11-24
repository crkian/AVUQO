/** Exact barcode identity, never title similarity or an unqualified MPN. */
export function canonicalGtin(value:unknown):string|null{
 if(typeof value!=="string")return null;
 const code=value.trim();
 if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)||/^0+$/.test(code))return null;
 let sum=0;
 for(let i=code.length-2,j=0;i>=0;i--,j++)sum+=Number(code[i])*(j%2===0?3:1);
 return (10-sum%10)%10===Number(code.at(-1))?code.padStart(14,"0"):null;
}
export function exactBarcodeIdentity(ids:readonly {type:string;value:string}[]):string|null{
 const codes=new Set(ids.filter(x=>["ean","gtin","upc"].includes(x.type)).map(x=>canonicalGtin(x.value)).filter(Boolean));
 return codes.size===1?[...codes][0]!:null;
}
export function barcodeLookupForms(code:string):string[]{
 return [8,12,13,14].flatMap(n=>{const short=code.slice(-n);return canonicalGtin(short)===code?[short]:[]});
}
