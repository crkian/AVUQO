import {connection} from "next/server";
import {currentEvidenceCutoff} from "../../../lib/products/current-evidence-cutoff";
import {redirect} from "next/navigation";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {createClient} from "../../../lib/supabase/server";
import styles from "../development-register/register.module.css";
export const instant=false;
export const maxDuration=300;
export const metadata={title:"Shopping release review | AVUQO",robots:{index:false,follow:false}};

async function review(form:FormData){
 "use server";
 const {role}=await requireControlCentreAccess();
 if(role!=="owner")redirect("/unauthorized");
 const id=String(form.get("offerId")??""),status=String(form.get("status")??""),
  price=Number(form.get("price")),digest=String(form.get("digest")??""),note=String(form.get("note")??"").trim();
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||
  !["approved","withdrawn"].includes(status)||note.length>300||
  (status==="approved"&&(!Number.isFinite(price)||price<=0||!/^[a-f0-9]{64}$/.test(digest))))
  redirect("/control-centre/shopping-release?result=invalid");
 const db=await createClient();
 const {error}=await db.rpc("review_shopping_as_owner",{p_offer_id:id,p_status:status,
  p_expected_price:status==="approved"?price:null,p_expected_digest:status==="approved"?digest:null,p_note:note});
 redirect("/control-centre/shopping-release?result="+(error?"rejected":"recorded"));
}
async function refreshPortfolio(form:FormData){
 "use server";
 const {role}=await requireControlCentreAccess();
 if(role!=="owner")redirect("/unauthorized");
 const ordinal=String(form.get("offset")??"");
 if(!/^[0-8]$/.test(ordinal))redirect("/control-centre/shopping-release?refresh=invalid");
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16)redirect("/control-centre/shopping-release?refresh=unavailable");
 // Prevent overlapping manual retries with an observed active/recent run.
 // The underlying importer additionally uses immutable digest and sequence guards.
 const db=createAdminClient();
 const {data,error}=await db.from("awin_private_cron_attempts").select("started_at,state")
  .eq("job_key","portfolio_rotation").order("started_at",{ascending:false}).limit(1).maybeSingle();
 if(error)redirect("/control-centre/shopping-release?refresh=unavailable");
 const age=data?Date.now()-Date.parse(data.started_at):Infinity;
 if(age<60_000||(data?.state==="started"&&age<300_000))
  redirect("/control-centre/shopping-release?refresh=busy");
 let result="unavailable";
 try{
  const {GET}=await import("../../api/internal/awin-portfolio-private-rotation/route");
  const {NextRequest}=await import("next/server");
  const url=new URL("https://www.avuqo.com/api/internal/awin-portfolio-private-rotation");
  url.searchParams.set("offset",ordinal);
  const response=await GET(new NextRequest(url,{headers:{authorization:"Bearer "+secret}}));
  const body=await response.json();
  result=response.ok&&body?.status==="private_rotation_checked"?"checked":response.ok?"no_work":"rejected";
 }catch{result="unavailable";}
 redirect("/control-centre/shopping-release?refresh="+result);
}
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export default async function Page({searchParams}:{searchParams:Promise<{result?:string;refresh?:string}>}){
 await connection();
 const {role}=await requireControlCentreAccess();
 if(role!=="owner")redirect("/unauthorized");
 const {result,refresh}=await searchParams;
 const db=createAdminClient(),cutoff=await currentEvidenceCutoff();
 const [candidates,reviews,control]=await Promise.all([
  db.from("offers").select("id,title,price,last_seen_at,raw_data").eq("status","active").eq("currency","GBP")
   .in("stock_status",["in_stock","low_stock"]).or("raw_data->>source_currency_explicit.eq.true,raw_data->>currency_source.in.(tooled_up_uk_GBP_storefront_and_exact_staged_price_match,petlibro_uk_programme_gbp,cadbury_uk_programme_gbp)")
   .gte("last_seen_at",cutoff).order("last_seen_at",{ascending:false}).limit(60),
  db.from("awin_shopping_release_reviews").select("offer_id,status,reviewed_price,updated_at")
   .eq("status","approved").order("updated_at",{ascending:false}).limit(60),
  db.from("system_controls").select("enabled").eq("control_key","shopping_publishing").maybeSingle()
 ]);
 return <div className={styles.page}><header className={styles.hero}><h1>Independent shopping release review</h1>
 <p>Review exact fresh evidence without deal scoring. Recording approval does not enable publication, activate a draft product, or bypass runtime verification.</p>
 <p>Shopping publication: {control.error||!control.data?"Unknown / fail closed":control.data.enabled?"Enabled":"Disabled"}</p>
 <Link href="/control-centre/development-register">Development Register</Link>
 {result&&<p role="status">{result==="recorded"?"Review recorded.":result==="rejected"?"Review rejected or gateway unavailable. No approval is claimed.":"Invalid review request."}</p>}
 </header><section className={styles.panel}><h2>Refresh eligible retailer feeds</h2>
 <p>Run one bounded portfolio refresh using the current approved feed registry. The worker records its attempt before downloading. Existing source, global stop, product evidence and deal release controls still apply. This does not enable ordinary shopping publication.</p>
 <form action={refreshPortfolio}><label>Rotation offset <select name="offset" defaultValue="0">{Array.from({length:9},(_,i)=><option key={i} value={i}>{i===0?"Current scheduled selection":String(i)+" slots ahead"}</option>)}</select></label><button type="submit">Run one retailer refresh</button></form>
 {refresh&&<p role="status">{refresh==="checked"?"Worker completed its bounded refresh. Check the journal and candidate counts; this does not prove new published stock.":refresh==="no_work"?"Worker returned without a completed import. Check the register.":refresh==="busy"?"A recent attempt exists; review the journal before retrying.":refresh==="rejected"?"Worker rejected the import; see the recorded outcome.":"Refresh unavailable or invalid."}</p>}
 <Link href="/control-centre/development-register#portfolio-health">View audited portfolio attempts</Link></section>
 <section className={styles.panel}><h2>Initial review candidates</h2><p>Up to 60 recent active GBP records with explicit or recognised UK-feed currency provenance. Exact feed identity, rights and all other admission checks still apply.</p>
 {candidates.error?<p>Candidate query unavailable.</p>:!candidates.data?.length?<p>No initial fresh candidates.</p>:<div className={styles.scroll}><table><thead><tr><th>Offer</th><th>Price / checked</th><th>Review</th></tr></thead><tbody>{candidates.data.map(row=>{
 const raw=row.raw_data&&typeof row.raw_data==="object"?row.raw_data as Record<string,unknown>:{};
 const digest=typeof raw.live_feed_digest==="string"?raw.live_feed_digest:"";
 if(!/^[a-f0-9]{64}$/.test(digest))return null;
 return <tr key={row.id}><td>{row.title}<small>{row.id}</small></td><td>{money(Number(row.price))}<small>{row.last_seen_at}</small><small>{raw.source_currency_explicit===true?"Explicit GBP": "UK feed basis: "+String(raw.currency_source??"Unknown")}</small></td><td><form action={review}>
 <input type="hidden" name="offerId" value={row.id}/><input type="hidden" name="status" value="approved"/>
 <input type="hidden" name="price" value={row.price}/><input type="hidden" name="digest" value={digest}/>
 <label>Review note <input name="note" maxLength={300}/></label><button type="submit">Record approval</button></form></td></tr>})}</tbody></table></div>}
 </section><section className={styles.panel}><h2>Current approval records</h2>{reviews.error?<p>Review query unavailable.</p>:!reviews.data?.length?<p>No approval records.</p>:<div className={styles.scroll}><table><thead><tr><th>Offer</th><th>Reviewed price</th><th>Withdrawal</th></tr></thead><tbody>{reviews.data.map(row=><tr key={row.offer_id}><td>{row.offer_id}</td><td>{money(Number(row.reviewed_price))}</td><td><form action={review}><input type="hidden" name="offerId" value={row.offer_id}/><input type="hidden" name="status" value="withdrawn"/><label>Reason <input name="note" maxLength={300}/></label><button type="submit">Withdraw</button></form></td></tr>)}</tbody></table></div>}</section></div>;
}
