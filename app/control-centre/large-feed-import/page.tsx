import type {Metadata} from "next";
import Link from "next/link";
import {connection} from "next/server";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import TooledUpLargeImport from "./TooledUpLargeImport";
export const metadata:Metadata={title:"Tooled-Up large feed importer | AVUQO",robots:{index:false,follow:false}};
export default async function Page(){
 await connection();
 await requireControlCentreAccess();
 return <main style={{display:"grid",gap:22,maxWidth:1150,padding:"16px 0 90px"}}>
  <header><p style={{fontWeight:800,color:"#6744a4",letterSpacing:1.4,fontSize:12}}>CONTROL CENTRE / PRIVATE FEED IMPORT</p>
  <h1 style={{fontSize:36,margin:"10px 0"}}>Tooled-Up large catalogue</h1>
  <p style={{color:"#6b6376",maxWidth:760,lineHeight:1.6}}>Import the full range safely in resumable batches, retaining retailer brand, product model, identifiers, category paths and stock labels. Every record remains private until a separate evidence-based publication review.</p></header>
  <TooledUpLargeImport/>
  <Link href="/control-centre/feed-imports" style={{fontWeight:700}}>← Return to standard Awin imports</Link>
 </main>;
}
