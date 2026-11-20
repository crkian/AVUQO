import type {Metadata} from "next";
import {getSiteUrl} from "./url";

/** Public, first-party editorial facts only. No invented prices, reviews or ratings. */
export function publicPageMetadata(input:{
 title:string;description:string;path:string;type?:"website"|"article";index?:boolean;
}):Metadata{
 const {title,description,path,type="website",index=true}=input;
 return {
  title,description,alternates:{canonical:path},
  robots:{index,follow:true,googleBot:{index,follow:true,"max-image-preview":"large","max-snippet":-1}},
  openGraph:{type,siteName:"AVUQO",locale:"en_GB",url:path,title,description},
  twitter:{card:"summary",title,description}
 };
}
export type JsonLdValue=string|number|boolean|null|JsonLdValue[]|{[key:string]:JsonLdValue|undefined};
export function breadcrumbSchema(items:readonly {name:string;path:string}[]):JsonLdValue{
 const base=getSiteUrl();
 return {"@context":"https://schema.org","@type":"BreadcrumbList",
  itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,
   name:item.name,item:base+item.path}))};
}
export function collectionSchema(name:string,path:string,description:string):JsonLdValue{
 return {"@context":"https://schema.org","@type":"CollectionPage",
  name,url:getSiteUrl()+path,description,inLanguage:"en-GB",
  isPartOf:{"@type":"WebSite",name:"AVUQO",url:getSiteUrl()}};
}
/** Escape HTML parsing characters even when upstream catalogue data is untrusted. */
export function jsonLd(value:JsonLdValue):string{
 return JSON.stringify(value).replace(/</g,"\\u003c").replace(/>/g,"\\u003e")
  .replace(/&/g,"\\u0026").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
}
