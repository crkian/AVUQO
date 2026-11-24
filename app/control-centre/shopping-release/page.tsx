import {connection} from "next/server";
import {redirect} from "next/navigation";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {createClient} from "../../../lib/supabase/server";
import styles from "../development-register/register.module.css";
export const instant=false;
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
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export default async function Page({searchParams}:{searchParams:Promise<{result?:string}>}){
 await connection();
 const {role}=await requireControlCentreAccess();
 if(role!=="owner")redirect("/unauthorized");
 const {result}=await searchParams;
 const db=createAdminClient(),cutoff=new Date(Date.now()-48*3600_000).toISOString();
 const [candidates,reviews,control]=await Promise.all([
  db.from("offers").select("id,title,price,last_seen_at,raw_data").eq("status","active").eq("currency","GBP")
   .in("stock_status",["in_stock","low_stock"]).eq("raw_data->>source_currency_explicit","true")
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
 </header><section className={styles.panel}><h2>Initial review candidates</h2><p>Up to 60 recent active records. Database and public admission checks still apply.</p>
 {candidates.error?<p>Candidate query unavailable.</p>:!candidates.data?.length?<p>No initial fresh candidates.</p>:<div className={styles.scroll}><table><thead><tr><th>Offer</th><th>Price / checked</th><th>Review</th></tr></thead><tbody>{candidates.data.map(row=>{
 const raw=row.raw_data&&typeof row.raw_data==="object"?row.raw_data as Record<string,unknown>:{};
 const digest=typeof raw.live_feed_digest==="string"?raw.live_feed_digest:"";
 if(!/^[a-f0-9]{64}$/.test(digest))return null;
 return <tr key={row.id}><td>{row.title}<small>{row.id}</small></td><td>{money(Number(row.price))}<small>{row.last_seen_at}</small></td><td><form action={review}>
 <input type="hidden" name="offerId" value={row.id}/><input type="hidden" name="status" value="approved"/>
 <input type="hidden" name="price" value={row.price}/><input type="hidden" name="digest" value={digest}/>
 <label>Review note <input name="note" maxLength={300}/></label><button type="submit">Record approval</button></form></td></tr>})}</tbody></table></div>}
 </section><section className={styles.panel}><h2>Current approval records</h2>{reviews.error?<p>Review query unavailable.</p>:!reviews.data?.length?<p>No approval records.</p>:<div className={styles.scroll}><table><thead><tr><th>Offer</th><th>Reviewed price</th><th>Withdrawal</th></tr></thead><tbody>{reviews.data.map(row=><tr key={row.offer_id}><td>{row.offer_id}</td><td>{money(Number(row.reviewed_price))}</td><td><form action={review}><input type="hidden" name="offerId" value={row.offer_id}/><input type="hidden" name="status" value="withdrawn"/><label>Reason <input name="note" maxLength={300}/></label><button type="submit">Withdraw</button></form></td></tr>)}</tbody></table></div>}</section></div>;
}
