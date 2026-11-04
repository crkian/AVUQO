import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import FeedAuditForm from "./FeedAuditForm";
export const instant=false;
export const metadata:Metadata={title:"Private Awin feed inventory | AVUQO",robots:{index:false,follow:false}};
export default async function Page(){
 await connection();
 await requireControlCentreAccess();
 return <main style={{display:"grid",gap:23,maxWidth:1160,paddingBottom:90}}>
  <header><p style={{fontWeight:900,fontSize:12,letterSpacing:1.5,color:"#7459a0"}}>SOURCES / PRIVATE INVENTORY</p>
   <h1 style={{fontSize:38,letterSpacing:"-.045em",margin:"8px 0"}}>Awin feed discovery</h1>
   <p style={{lineHeight:1.6,maxWidth:740,color:"#6d6376"}}>Understand which joined advertisers have feed records, without exposing private download links or starting product downloads. A live feed listing is not permission to publish products, prices or photography.</p>
  </header>
  <FeedAuditForm/>
  <Link href="/control-centre/feed-imports" style={{color:"#634b7a",fontWeight:800}}>← Back to private product feed imports</Link>
 </main>;
}
