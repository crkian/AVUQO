import { connection } from "next/server";
import { requireControlCentreAccess } from "../../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../../lib/supabase/server";
import { LEGAL_SLUGS, validateLegalDoc, type LegalDoc } from "../../../../lib/content/legal";
import { saveLegalDraft, publishLegal } from "./actions";
import styles from "../../control-centre.module.css";
const LABELS: Record<string,string> = {privacy:"Privacy Policy",terms:"Terms of Use",cookies:"Cookie Information","affiliate-disclosure":"Affiliate Disclosure"};
export default async function LegalEditor({searchParams}:{searchParams:Promise<{slug?:string}>}) {
 await connection();
 const { role } = await requireControlCentreAccess();
 const query = await searchParams;
 const slug = LEGAL_SLUGS.find(x=>x===query.slug) ?? "privacy";
 const db = await createClient();
 const [{data:draft},{data:published}] = await Promise.all([
  db.from("legal_content_drafts").select("payload,updated_at").eq("slug",slug).maybeSingle(),
  db.from("legal_content_published").select("version,published_at").eq("slug",slug).maybeSingle()
 ]);
 let doc: LegalDoc = {title:LABELS[slug],introduction:"",body:"",effectiveDate:new Date().toISOString().slice(0,10)};
 if(draft) { try {doc=validateLegalDoc(draft.payload)}catch{} }
 return <><div className={styles.pageHead}><div><p className={styles.eyebrow}>Website & Content</p><h1>Legal documents</h1><p className={styles.sub}>Private drafts and owner-controlled publication. Get qualified legal review before publishing policy changes.</p></div></div>
 <section className={styles.panel} style={{padding:24}}>
 <nav style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:20}}>{LEGAL_SLUGS.map(s=><a key={s} href={`/control-centre/content/legal?slug=${s}`} aria-current={s===slug?"page":undefined}>{LABELS[s]}</a>)}</nav>
 <p>Published: {published?.version ? `Version ${published.version}` : "Current built-in site copy"} · Draft: {draft?.updated_at ? new Date(draft.updated_at).toLocaleString("en-GB") : "None"}</p>
 <p style={{color:"#b45309"}}>These documents must accurately reflect the actual business entity, processing activities, affiliate arrangements, cookies, contact details and applicable law. This editor does not provide legal sign-off.</p>
 <form action={saveLegalDraft} style={{display:"grid",gap:14,maxWidth:860}}><input type="hidden" name="slug" value={slug}/>
 <label>Page title<input name="title" defaultValue={doc.title} required maxLength={160} style={{display:"block",width:"100%",padding:10}}/></label>
 <label>Introduction<textarea name="introduction" defaultValue={doc.introduction} maxLength={1200} rows={3} style={{display:"block",width:"100%",padding:10}}/></label>
 <label>Content (plain text; blank lines separate paragraphs)<textarea name="body" defaultValue={doc.body} required maxLength={30000} rows={18} style={{display:"block",width:"100%",padding:10,fontFamily:"inherit"}}/></label>
 <label>Effective date<input name="effectiveDate" type="date" required defaultValue={doc.effectiveDate} style={{display:"block",padding:10}}/></label>
 <button type="submit" style={{padding:12}}>Save private draft</button></form>
 {role === "owner" && <form action={publishLegal} style={{marginTop:24}}><input type="hidden" name="slug" value={slug}/><label><input name="reviewed" type="checkbox" required/> I confirm this exact draft has received appropriate legal and business review.</label><p><button type="submit" style={{padding:12,marginTop:12}}>Publish reviewed draft</button></p></form>}
 </section></>;
}
