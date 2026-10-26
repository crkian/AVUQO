import { requireControlCentreAccess } from "../../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../../lib/supabase/server";
import { DEFAULT_EDITORIAL,defaultsFor,parseEditorial,type EditorialKey } from "../../../../lib/content/editorial";
import { saveEditorial,publishEditorial } from "./actions";
export default async function Editor({searchParams}:{searchParams:Promise<{page?:string;saved?:string;published?:string}>}){
 const {role}=await requireControlCentreAccess();const p=await searchParams;
 const key:EditorialKey=p.page && p.page in DEFAULT_EDITORIAL ? p.page as EditorialKey:"home";
 const db=await createClient();const [{data:draft},{data:published}]=await Promise.all([
 db.from("editorial_drafts").select("payload,updated_at").eq("key",key).maybeSingle(),
 db.from("editorial_published").select("version,published_at").eq("key",key).maybeSingle()]);
 let data=defaultsFor(key);try {if(draft)data=parseEditorial(draft.payload);}catch{}
 const fields=[{key:"eyebrow",label:"Section label",max:100},{key:"headline",label:"Headline",max:140},{key:"description",label:"Introductory description",max:700},{key:"seoTitle",label:"SEO title",max:75},{key:"seoDescription",label:"SEO description",max:170}] as const;
 return <main style={{padding:"2rem",maxWidth:950,margin:"auto"}}><p>Control Centre / Website & Content</p><h1>Public page editor</h1><p>Draft changes are private until published. Structural website sections are not editable here.</p>
 <nav aria-label="Edit page" style={{display:"flex",gap:16,margin:"1.5rem 0"}}>{Object.keys(DEFAULT_EDITORIAL).map(k=><a key={k} href={`/control-centre/content/pages?page=${k}`}>{k===key?<strong>{k.toUpperCase()}</strong>:k.toUpperCase()}</a>)}</nav>
 <p>Live version: {published?.version??"Source default"} · Draft: {draft?.updated_at??"None"}</p>
 {p.saved&&<p role="status">Draft saved. Public site unchanged.</p>}{p.published&&<p role="status">Published successfully.</p>}
 <form action={saveEditorial} style={{display:"grid",gap:16}}><input type="hidden" name="key" value={key}/>
 {fields.map(f=><label key={f.key} style={{display:"grid",gap:5}}><strong>{f.label}</strong><textarea required name={f.key} maxLength={f.max} rows={f.key==="description"?4:2} defaultValue={data[f.key]} style={{padding:10,borderRadius:8}}/></label>)}
 <button type="submit" style={{padding:12}}>Save private draft</button></form>
 {role==="owner"&&<form action={publishEditorial} style={{marginTop:18}}><input type="hidden" name="key" value={key}/><button type="submit" style={{padding:12}}>Publish reviewed draft</button></form>}
 <p>SEO changes are subject to search-engine recrawling. Legal pages are handled separately.</p></main>;
}
