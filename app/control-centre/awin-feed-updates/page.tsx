import {connection} from "next/server";
import type {Metadata} from "next";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
export const metadata:Metadata={title:"Private Awin feed updates | AVUQO",robots:{index:false,follow:false}};
type Feed={advertiser_id:string;feed_id:string;advertiser_name:string;feed_name:string;listed_products:number;last_imported_source:string;observed_at:string;needs_private_refresh:boolean;change_count:number};
type Run={checked_at:string;active_feeds:number;joined_feeds:number;changed_feeds:number};
export default async function Page(){
 await connection();
 await requireControlCentreAccess();
 const admin=createAdminClient();
 const [feeds,runs,refresh]=await Promise.all([
  admin.from("awin_feed_update_observations").select("advertiser_id,feed_id,advertiser_name,feed_name,listed_products,last_imported_source,observed_at,needs_private_refresh,change_count").order("needs_private_refresh",{ascending:false}).order("advertiser_name",{ascending:true}).limit(200),
  admin.from("awin_feed_discovery_runs").select("checked_at,active_feeds,joined_feeds,changed_feeds").order("checked_at",{ascending:false}).limit(1),
  admin.from("awin_feed_update_observations").select("feed_id",{count:"exact",head:true}).eq("needs_private_refresh",true)
 ]);
 const records=(feeds.data??[]) as Feed[];
 const history=(runs.data??[]) as Run[];
 const enabled=process.env.AWIN_FEED_MONITOR_ENABLED==="true";
 const configured=/^[a-zA-Z0-9_-]{16,200}$/.test(process.env.AWIN_DATAFEED_API_KEY??"")
  &&/^[0-9]{3,15}$/.test(process.env.AWIN_PUBLISHER_ID??"")&&(process.env.CRON_SECRET?.length??0)>=16;
 const lastCheck=history[0];
 const stale=lastCheck&&new Date().getTime()-Date.parse(lastCheck.checked_at)>36*60*60*1000;
 return <main style={{maxWidth:1200,padding:"32px 20px 80px",margin:"auto",display:"grid",gap:22}}>
  <nav><Link href="/control-centre/feed-list-audit">← Awin feed inventory</Link></nav>
  <header><p style={{color:"#7351b0",fontSize:12,letterSpacing:1.4,fontWeight:800}}>OWNER-ONLY / SOURCE FRESHNESS</p>
   <h1 style={{fontSize:36,margin:"8px 0"}}>Awin feed update monitor</h1>
   <p style={{maxWidth:800,lineHeight:1.6,color:"#6a6276"}}>Daily metadata-only discovery of updates from joined Awin advertisers. This does not download product rows, activate affiliate offers or establish permission to publish images and prices.</p>
  </header>
  <section style={{display:"flex",gap:14,flexWrap:"wrap"}}>
   {[
    ["Configuration",!enabled?"Disabled":configured?"Enabled · 06:17 UTC daily":"Enabled flag set · missing configuration"],
    ["Last successful check",runs.error?"Unavailable":lastCheck?new Date(lastCheck.checked_at).toLocaleString("en-GB",{timeZone:"Europe/London"}):"No check recorded"],
    ["Feeds flagged for private refresh",refresh.error?"Unavailable":String(refresh.count??0)]
   ].map(([title,value])=><div key={title} style={{background:"white",border:"1px solid #e8e3ed",borderRadius:14,padding:17,minWidth:220,flex:1}}>
    <div style={{color:"#776e82",fontSize:12}}>{title}</div><strong>{value}</strong>
   </div>)}
  </section>
  {stale&&enabled&&<p role="status">No successful check in the last 36 hours. Review the scheduled invocation before relying on this inventory.</p>}
  {feeds.error||runs.error||refresh.error?<p role="alert">Feed monitoring history is unavailable. Confirm the private discovery migration has been applied.</p>:null}
  <div style={{overflowX:"auto",background:"white",border:"1px solid #e8e3ed",borderRadius:16}}>
   <table style={{borderCollapse:"collapse",width:"100%",minWidth:750,fontSize:13}}>
    <thead><tr>{["Advertiser","Feed","Listed products","Awin last updated","Last seen (UK)","Private refresh flag","Change count"].map(h=><th key={h} style={{background:"#f8f5fa",padding:12,textAlign:"left"}}>{h}</th>)}</tr></thead>
    <tbody>{records.map(f=><tr key={f.advertiser_id+":"+f.feed_id}>
     {[f.advertiser_name,f.feed_name||f.feed_id,f.listed_products.toLocaleString("en-GB"),f.last_imported_source||"Unknown",new Date(f.observed_at).toLocaleDateString("en-GB",{timeZone:"Europe/London"}),f.needs_private_refresh?"Review required":"No new change detected",String(f.change_count)].map((v,i)=><td key={i} style={{padding:12,borderTop:"1px solid #efeaf1"}}>{v}</td>)}
    </tr>)}</tbody>
   </table>
   {!feeds.error&&records.length===0&&<p style={{padding:16,color:"#655c70"}}>No automatic feed checks have been recorded.</p>}
  </div>
  <p style={{fontSize:13,color:"#736b7d"}}>Only metadata from Awin&apos;s feed list is stored. Signed download URLs and API keys are never returned by this screen. A marked update is not an import and does not withdraw or publish any product.</p>
  <Link href="/control-centre/feed-imports">Review private product imports</Link>
 </main>;
}
