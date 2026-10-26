import { connection } from "next/server";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import { DEFAULT_FOOTER, parseFooter } from "../../../lib/content/footer";
import { publishFooter, saveFooterDraft } from "./actions";
import styles from "../control-centre.module.css";

export default async function ContentPage() {
  await connection();
  const { role } = await requireControlCentreAccess();
  const db = await createClient();
  const [{data: draft}, {data: published}] = await Promise.all([
    db.from("site_content_drafts").select("payload,updated_at").eq("key","footer").maybeSingle(),
    db.from("site_content_published").select("version,published_at").eq("key","footer").maybeSingle(),
  ]);
  const content = draft ? parseFooter(draft.payload) : DEFAULT_FOOTER;
  return <>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>Website & Content</p><h1>Footer editor</h1><p className={styles.sub}>Save changes as a private draft. Publishing updates the public footer. Legal documents and other pages will receive separate approval workflows later.</p></div></div>
    <section className={styles.panel} style={{padding:24}}>
      <p>Live version: <strong>{published?.version ?? "Default source footer"}</strong> · Draft last updated: {draft?.updated_at ? new Date(draft.updated_at).toLocaleString("en-GB") : "No saved draft"}</p>
      <form action={saveFooterDraft} style={{display:"grid",gap:18,maxWidth:800,marginTop:24}}>
        {[{name:"motto",label:"Tagline",value:content.motto,max:150},{name:"description",label:"Brand description",value:content.description,max:600},{name:"disclosure",label:"Affiliate transparency notice",value:content.disclosure,max:600}].map(field => <label key={field.name} style={{display:"grid",gap:5}}><strong>{field.label}</strong><textarea name={field.name} defaultValue={field.value} maxLength={field.max} rows={field.name === "motto" ? 2 : 4} required style={{padding:10,borderRadius:8}}/></label>)}
        {content.groups.map((group,i)=><fieldset key={group.heading} style={{padding:15,borderRadius:8}}><legend><strong>{group.heading}</strong></legend>{group.links.map((link,j)=><label key={link.href} style={{display:"grid",gap:4,marginBottom:10}}><span>{link.href}</span><input name={`label_${i}_${j}`} defaultValue={link.label} maxLength={80} required style={{padding:9,borderRadius:8}}/></label>)}</fieldset>)}
        <button type="submit" style={{padding:12,cursor:"pointer"}}>Save private draft</button>
      </form>
      {role === "owner" && <form action={publishFooter} style={{marginTop:20}}><button type="submit" style={{padding:12,cursor:"pointer"}}>Publish saved draft</button><p>Only publish after reviewing the public-facing wording and affiliate disclosure.</p></form>}
    </section>
  </>;
}
