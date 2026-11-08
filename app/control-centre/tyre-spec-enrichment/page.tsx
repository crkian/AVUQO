import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import TyreEnrichmentForm from "./TyreEnrichmentForm";
export const instant=false;
export const metadata:Metadata={title:"Private tyre specification enrichment | AVUQO",robots:{index:false,follow:false}};
export default async function Page(){
 await connection();
 await requireControlCentreAccess();
 return <main style={{padding:"30px max(20px,5vw) 100px",display:"grid",gap:20}}>
  <nav><Link href="/preview/products?merchant=12715">← Return to private Tyres UK finder</Link></nav>
  <h1 style={{margin:0,fontSize:"clamp(30px,4vw,46px)"}}>Tyre technical specifications</h1>
  <TyreEnrichmentForm/>
 </main>;
}
