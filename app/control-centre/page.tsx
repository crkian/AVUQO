import {connection} from "next/server";
import Link from "next/link";
import type {SupabaseClient} from "@supabase/supabase-js";
import {createClient} from "../../lib/supabase/server";
import {CONTROL_CENTRE_SECTIONS} from "../../lib/control-centre/workspaces";
import styles from "./control-centre.module.css";
export const instant=false;
type CountResult={value:number|null;problem:boolean};
async function count(s:SupabaseClient,table:string,filters?:[string,string][]):Promise<CountResult>{
 try{
  let q=s.from(table).select("*",{count:"exact",head:true});
  for(const [k,v] of filters??[])q=q.eq(k,v);
  const {count,error}=await q;
  return {value:error?null:count??null,problem:!!error};
 }catch{return {value:null,problem:true}}
}
export default async function ControlCentreHome(){
 await connection();const s=await createClient();
 const [sources,openExceptions,jobs,promotions,healthResult]=await Promise.all([
  count(s,"sources"),count(s,"exceptions",[["status","open"]]),
  count(s,"automation_jobs",[["status","queued"]]),
  count(s,"promotion_candidates"),
  s.from("system_health").select("component,status,last_checked_at")
   .order("last_checked_at",{ascending:false}).limit(6)
 ]);
 const metrics=[
  {name:"Registered sources",value:sources}, {name:"Open exceptions",value:openExceptions},
  {name:"Queued operations",value:jobs}, {name:"Promotion candidates",value:promotions}
 ];
 return <>
  <div className={styles.pageHead}><div>
   <p className={styles.eyebrow}>Owner operations · AVUQO</p><h1>Control Centre</h1>
   <p className={styles.sub}>One organised place to manage the website, data, advertising, marketing and trust. Each workspace shows what is live, what needs review and what is deliberately disabled.</p>
  </div><Link href="/control-centre/release-readiness" className={styles.overviewAction}>View release readiness →</Link></div>
  <section className={styles.overviewWorkspaceGrid} aria-label="Operational workspaces">
   {CONTROL_CENTRE_SECTIONS.filter(x=>x.id!=="home").map(group=><article key={group.id}>
    <h2>{group.label}</h2><p>{group.description}</p>
    <div>{group.links.slice(0,5).map(link=><Link href={link.href} key={link.href}>{link.label}</Link>)}</div>
   </article>)}
  </section>
  <div className={styles.metrics}>{metrics.map(m=><div className={styles.metric} key={m.name}>
   <span>{m.name}</span><strong>{m.value.problem?"Unavailable":m.value.value??"Not checked"}</strong>
  </div>)}</div>
  <section className={styles.panel}><div className={styles.panelHead}><h2>System health</h2><span>Latest recorded checks, not assumed live status</span></div>
   {healthResult.error?<div className={styles.empty}>Health information could not be read.</div>:
    healthResult.data?.length?<table className={styles.table}><thead><tr>
     <th>Component</th><th>Status</th><th>Last checked</th></tr></thead>
     <tbody>{healthResult.data.map(r=><tr key={r.component}><td>{r.component}</td>
      <td><span className={styles.pill+" "+(r.status==="healthy"?styles.good:styles.warn)}>{r.status}</span></td>
      <td>{r.last_checked_at?new Date(r.last_checked_at).toLocaleString("en-GB"):"Not recorded"}</td>
     </tr>)}</tbody></table>:<div className={styles.empty}>No health checks recorded. This is not proof that every integration is connected.</div>}
  </section>
  <div className={styles.callout}><b>Independent-value firewall:</b> AVUQO Score, organic rankings and cheapest valid grocery basket are never determined by advertiser payments or affiliate commission. Brand Social Marketing cannot publish without its own approval and connection gates.</div>
 </>;
}
