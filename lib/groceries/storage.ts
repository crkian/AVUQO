import type { BasketLine, PersonalPrices } from './compare';
export const BASKET_KEY='avuqo.groceries.basket.v1';
export function parseSavedBasket(raw:string|null):BasketLine[] {
  if(!raw || raw.length>100000) return [];
  try { const data:unknown=JSON.parse(raw); if(!Array.isArray(data)) return []; return data.filter((x):x is BasketLine => Boolean(x && typeof x==='object' && typeof x.id==='string' && typeof x.name==='string' && x.name.length<=200 && Number.isInteger(x.quantity) && x.quantity>=1 && x.quantity<=99)).slice(0,100); } catch {return [];}
}
export function parseSavedOverrides(raw:string|null):PersonalPrices {
  try {const v=JSON.parse(raw??'{}'); if(!v || typeof v!=='object'||Array.isArray(v)) return {}; const clean:PersonalPrices={};for(const [line,stores] of Object.entries(v)){if(typeof line!=='string'||!stores||typeof stores!=='object'||Array.isArray(stores)) continue; clean[line]={};for(const [store,amount] of Object.entries(stores))if(Number.isSafeInteger(amount)&&Number(amount)>=0)clean[line][store]=Number(amount);}return clean;}catch{return {};}
}
