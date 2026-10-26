import { createClient } from "../supabase/server";
export const DEFAULT_EDITORIAL = {
 home: { eyebrow:"Intelligent value discovery", headline:"Find what’s worth it.", description:"AVUQO searches sales, offers, bookings and price drops across the internet to find the ones genuinely worth your attention.", seoTitle:"AVUQO | Find what's worth it", seoDescription:"Discover value with AVUQO's independent shopping intelligence." },
 about: { eyebrow:"About AVUQO", headline:"Independent intelligence for better buying decisions.", description:"AVUQO is being built to answer a deceptively simple question: is this actually worth it?", seoTitle:"About AVUQO", seoDescription:"Learn about AVUQO's independent value intelligence." },
 trust: { eyebrow:"Trust and independence", headline:"Built for the buyer.", description:"AVUQO puts evidence and independence ahead of commissions.", seoTitle:"Trust | AVUQO", seoDescription:"Our commitment to transparent value intelligence." },
} as const;
export type EditorialKey = keyof typeof DEFAULT_EDITORIAL;
export type EditorialFields = { eyebrow:string; headline:string; description:string; seoTitle:string; seoDescription:string };
const LIMITS: Record<keyof EditorialFields,number>={eyebrow:100,headline:140,description:700,seoTitle:75,seoDescription:170};
export function parseEditorial(raw:unknown):EditorialFields {
 if(!raw || typeof raw!=="object") throw Error("Invalid editorial content");
 const value=raw as Record<string,unknown>;
 for(const key of Object.keys(LIMITS) as (keyof EditorialFields)[]) {
  if(typeof value[key]!=="string" || !value[key].trim() || value[key].length>LIMITS[key]) throw Error(`Invalid ${key}`);
 }
 return Object.fromEntries(Object.keys(LIMITS).map(k=>[k,(value[k] as string).trim()])) as EditorialFields;
}
export function defaultsFor(key:EditorialKey):EditorialFields { return {...DEFAULT_EDITORIAL[key]}; }
export async function publishedEditorial(key:EditorialKey):Promise<EditorialFields> {
 try { const db=await createClient();const {data,error}=await db.from("editorial_published").select("payload").eq("key",key).maybeSingle();
 return error || !data ? defaultsFor(key) : parseEditorial(data.payload);
 }catch {return defaultsFor(key);}
}
