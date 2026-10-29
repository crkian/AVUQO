import Link from "next/link";
import { connection } from "next/server";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import { BRAND_SLUGS, isBrandSlug } from "../../../lib/marketing/policy";
import {
  addMarketingChannel, addMarketingDraft, addMarketingFact, approveMarketingFact,
  approveMarketingPost, draftFromApprovedFact, editMarketingDraft, updateMarketingBrand
} from "./actions";
import styles from "./marketing.module.css";

type Brand = { slug:string; name:string; tone:string; audience:string; website_url:string|null; weekly_post_cap:number };
type Fact = { id:string; brand_slug:string; claim:string; source_note:string; status:string; expires_at:string|null; created_at:string };
type Post = { id:string; brand_slug:string; kind:string; platform:string; caption:string; status:string; source_fact_id:string|null; planned_date:string|null; created_at:string };
type Channel = { id:string; brand_slug:string; platform:string; handle:string; connection_state:string };
type Audit = { id:number; brand_slug:string|null; entity:string; operation:string; happened_at:string; actor_id:string|null };
const TABS = [
  ["overview","Overview"],["brands","Brands"],["facts","Brand knowledge"],
  ["studio","Content Studio"],["calendar","Calendar"],["channels","Social Connections"],
  ["website","Website Content"],["automation","Automation"],["analytics","Analytics"],["audit","Audit"]
] as const;
const notices: Record<string,string> = {
  "brand-saved":"Brand details saved.","fact-added":"Fact saved privately. It needs owner approval.",
  "fact-approved":"Fact approved for editorial use.","draft-saved":"Draft saved privately.",
  "post-approved":"Content approved for review purposes, not published or scheduled.",
  "channel-added":"Account label saved. No social account has been connected."
};
const href = (tab:string, brand:string) => "/control-centre/marketing?tab=" + tab + "&brand=" + brand;
const shortDate = (s:string) => new Date(s).toLocaleString("en-GB",{dateStyle:"medium"});
const Notice = ({children}:{children:React.ReactNode}) => <div className={styles.banner}>{children}</div>;

export default async function MarketingPage({
  searchParams
}: { searchParams: Promise<{tab?:string;brand?:string;notice?:string}> }) {
  await connection();
  const {role} = await requireControlCentreAccess();
  const query = await searchParams;
  const brand = isBrandSlug(query.brand??"") ? query.brand! : "avuqo";
  const tab = TABS.some(item=>item[0] === query.tab) ? query.tab! : "overview";
  const db = await createClient();
  const results = await Promise.all([
    db.from("marketing_brands").select("slug,name,tone,audience,website_url,weekly_post_cap").order("name"),
    db.from("marketing_facts").select("id,brand_slug,claim,source_note,status,expires_at,created_at").order("created_at",{ascending:false}).limit(300),
    db.from("marketing_posts").select("id,brand_slug,kind,platform,caption,status,source_fact_id,planned_date,created_at").order("created_at",{ascending:false}).limit(300),
    db.from("marketing_channels").select("id,brand_slug,platform,handle,connection_state").order("created_at",{ascending:false}).limit(100),
    db.from("marketing_audit").select("id,brand_slug,entity,operation,happened_at,actor_id").order("happened_at",{ascending:false}).limit(75)
  ]);
  const problem = results.find(result=>result.error)?.error;
  const brands = (results[0].data??[]) as Brand[];
  const facts = (results[1].data??[]) as Fact[];
  const posts = (results[2].data??[]) as Post[];
  const channels = (results[3].data??[]) as Channel[];
  const audits = (results[4].data??[]) as Audit[];
  const current = brands.find(item=>item.slug===brand);
  const bf = facts.filter(item=>item.brand_slug===brand);
  const bp = posts.filter(item=>item.brand_slug===brand);
  const bc = channels.filter(item=>item.brand_slug===brand);
  const approvedFacts = bf.filter(item=>item.status==="approved");
  const isOwner = role==="owner";

  return <div className={styles.wrap}>
    <div className={styles.head}>
      <div><p className={styles.eyebrow}>AVUQO Control Centre / Marketing</p>
        <h1>Marketing workspace</h1>
        <p className={styles.muted}>One place to plan and review content for four independent brands.</p></div>
      <span className={styles.pill}>Publishing OFF · Draft and review mode</span>
    </div>
    <nav className={styles.tabs} aria-label="Marketing sections">
      {TABS.map(([key,label])=><Link key={key} href={href(key,brand)}
        aria-current={tab===key?"page":undefined}>{label}</Link>)}
    </nav>
    {problem&&<div className={styles.warning} role="alert">
      Marketing tables are not available yet. The reviewed database migration must be applied separately before this workspace can save or load records. No other site data was changed.
    </div>}
    {query.notice&&notices[query.notice]&&<Notice>{notices[query.notice]}</Notice>}
    <div className={styles.panel}>
      <form className={styles.switch} method="GET">
        <input type="hidden" name="tab" value={tab}/>
        <label htmlFor="marketing-brand"><strong>Working on</strong></label>
        <select id="marketing-brand" name="brand" defaultValue={brand}>
          {BRAND_SLUGS.map(slug=><option key={slug} value={slug}>{brands.find(item=>item.slug===slug)?.name ?? slug}</option>)}
        </select>
        <button type="submit">Switch brand</button>
      </form>
      <p className={styles.muted}>Facts, drafts, accounts and history are kept separate. Switching brands never copies content.</p>
    </div>

    {tab==="overview"&&<>
      <div className={styles.stats}>
        {[["Brands",brands.length],["Approved facts",facts.filter(f=>f.status==="approved").length],
          ["Private drafts",posts.filter(p=>p.status==="draft").length],
          ["Live posts sent",0]].map(([label,total])=><div className={styles.stat} key={label}>
            <b>{total}</b><span>{label}</span></div>)}
      </div>
      <section className={styles.panel}><h2>Choose a brand</h2><p className={styles.muted}>All brands have the same marketing tools, but completely separate evidence and content.</p>
        <div className={styles.grid}>{brands.map(b=><div key={b.slug} className={styles.profile}>
          <h3>{b.name}</h3><p className={styles.muted}>{facts.filter(f=>f.brand_slug===b.slug&&f.status==="approved").length} approved facts · {posts.filter(p=>p.brand_slug===b.slug).length} items</p>
          <Link href={href("brands",b.slug)}>Manage brand</Link>
        </div>)}</div>
      </section>
      <Notice>Next steps: set up a brand profile, add evidence-backed facts, create a post, then review it. Social accounts and website publishers remain unconnected.</Notice>
    </>}

    {tab==="brands"&&<section className={styles.panel}>
      <h2>{current?.name??brand} brand identity</h2>
      <p className={styles.muted}>Write a short audience description and a tone of voice. This informs future creative work without accessing brand websites.</p>
      {current&&<form action={updateMarketingBrand} className={styles.form}>
        <input type="hidden" name="brand" value={brand}/>
        <label>Official website (destination link only)<input type="url" name="website_url" defaultValue={current.website_url??""} placeholder="https://…" disabled={!isOwner}/></label>
        <label>Who is this brand for?<textarea name="audience" defaultValue={current.audience} maxLength={350} disabled={!isOwner}/></label>
        <label>Brand voice and style<textarea name="tone" defaultValue={current.tone} maxLength={350} placeholder="Clear, friendly, practical…" disabled={!isOwner}/></label>
        {isOwner?<button type="submit">Save brand identity</button>:<p className={styles.muted}>Only the owner can edit brand settings.</p>}
      </form>}
      {brand==="fantasy-lockr"&&<p className={styles.warning}>Fantasy Lockr marketing is based solely on facts entered and approved in this workspace. No Fantasy Lockr website, feed, API, database, fixtures or results may be accessed.</p>}
    </section>}

    {tab==="facts"&&<>
      <section className={styles.panel}><h2>Add a verified brand fact</h2>
        <p className={styles.muted}>Examples: a product feature you personally verified, an approved description, or a permitted call to action. New facts start as drafts.</p>
        <form className={styles.form} action={addMarketingFact}>
          <input type="hidden" name="brand" value={brand}/>
          <label>Fact or approved wording<textarea name="claim" required minLength={12} maxLength={500} placeholder="Enter the exact approved statement…"/></label>
          <label>Where did you verify it?<input name="source_note" required minLength={5} maxLength={300} placeholder="Owner-approved product description, dated…" /></label>
          <button type="submit">Save fact for review</button>
        </form>
      </section>
      <section className={styles.panel}><h2>Brand knowledge</h2>
        <div className={styles.list}>{bf.length?bf.map(f=><div className={styles.item} key={f.id}>
          <span className={styles.status}>{f.status}</span><p>{f.claim}</p>
          <div className={styles.meta}>Evidence: {f.source_note} · Added {shortDate(f.created_at)}</div>
          {isOwner&&f.status==="draft"&&<form className={styles.actionRow} action={approveMarketingFact}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="id" value={f.id}/>
            <button type="submit">Approve this fact</button>
          </form>}
        </div>):<p className={styles.empty}>No brand facts yet. Add your first verified fact above.</p>}</div>
      </section>
    </>}

    {tab==="studio"&&<>
      <section className={styles.panel}><h2>Create a social post</h2>
        <p className={styles.muted}>Use an approved fact, select Facebook or Instagram, and save a private draft. This does not post anything.</p>
        <form className={styles.form} action={addMarketingDraft}>
          <input type="hidden" name="brand" value={brand}/><input type="hidden" name="kind" value="social"/>
          <label>Platform<select name="platform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select></label>
          <label>Supporting approved fact<select name="fact_id"><option value="">Not chosen: draft only</option>
            {approvedFacts.map(f=><option key={f.id} value={f.id}>{f.claim.slice(0,110)}</option>)}</select></label>
          <label>Caption<textarea name="caption" minLength={12} maxLength={2500} required placeholder="Write your caption using only verified brand claims…"/></label>
          <label>Editorial target date (optional, not a scheduled post)<input type="date" name="planned_date"/></label>
          <button type="submit">Save private draft</button>
        </form>
      </section>
      <section className={styles.panel}><h2>Quick evergreen draft</h2>
        <p className={styles.muted}>Turn an approved fact into a simple draft with its original wording. Edit and review before approval.</p>
        {approvedFacts.length?<div className={styles.list}>{approvedFacts.map(f=>
          <form key={f.id} action={draftFromApprovedFact} className={styles.item}>
            <p>{f.claim}</p><input type="hidden" name="brand" value={brand}/><input type="hidden" name="id" value={f.id}/>
            <div className={styles.actionRow}><select name="platform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select>
              <button type="submit">Create draft from this fact</button></div>
          </form>)}</div>:<div className={styles.empty}>Approve a brand fact first to unlock evergreen drafts.</div>}
      </section>
      <section className={styles.panel}><h2>Social content review</h2>
        <div className={styles.list}>{bp.filter(p=>p.kind==="social").length?bp.filter(p=>p.kind==="social").map(p=><article key={p.id} className={styles.item}>
          <span className={styles.status}>{p.status}</span><span className={styles.meta}> · {p.platform} · {shortDate(p.created_at)}</span>
          {p.status==="draft"?<form action={editMarketingDraft} className={styles.form}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="id" value={p.id}/>
            <label>Caption<textarea name="caption" defaultValue={p.caption} maxLength={2500} minLength={12} required/></label>
            <label>Planned date<input type="date" name="planned_date" defaultValue={p.planned_date??""}/></label>
            <button className={styles.secondary} type="submit">Save edits</button>
          </form>:<p>{p.caption}</p>}
          {isOwner&&p.status==="draft"&&<form action={approveMarketingPost} className={styles.actionRow}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="id" value={p.id}/>
            <button type="submit">Review and approve</button>
          </form>}
        </article>):<p className={styles.empty}>No social drafts yet.</p>}</div>
      </section>
    </>}

    {tab==="calendar"&&<section className={styles.panel}><h2>Editorial calendar</h2>
      <p className={styles.muted}>Dates here are planning notes only. Nothing is sent to Facebook, Instagram or a website.</p>
      <div className={styles.list}>{bp.filter(p=>p.planned_date).sort((a,b)=>(a.planned_date??"").localeCompare(b.planned_date??"")).map(p=>
        <article key={p.id} className={styles.item}><b>{p.planned_date}</b> · {p.platform} · <span className={styles.status}>{p.status}</span>
          <p>{p.caption.slice(0,250)}</p></article>)}
        {!bp.some(p=>p.planned_date)&&<p className={styles.empty}>No planned dates yet. Add an editorial date in Content Studio.</p>}</div>
    </section>}

    {tab==="channels"&&<>
      <section className={styles.panel}><h2>Social account inventory</h2>
        <p className={styles.muted}>Record which accounts belong to this brand. This is not a live connection and stores no social passwords or tokens.</p>
        <form className={styles.form} action={addMarketingChannel}>
          <input type="hidden" name="brand" value={brand}/>
          <label>Platform<select name="platform"><option value="facebook">Facebook Page</option><option value="instagram">Instagram Professional</option></select></label>
          <label>Page/account name<input name="handle" maxLength={120} minLength={2} required placeholder="Official brand account"/></label>
          <button type="submit">Record account (unconnected)</button>
        </form>
      </section>
      <section className={styles.panel}><h2>Accounts for {current?.name??brand}</h2>
        <div className={styles.list}>{bc.length?bc.map(c=><div className={styles.item} key={c.id}>
          <strong>{c.platform==="facebook"?"Facebook":"Instagram"}</strong> · {c.handle}
          <p className={styles.meta}>Not connected · No permission to post · No account credentials stored</p>
        </div>):<p className={styles.empty}>No accounts recorded. Add a label above.</p>}</div>
      </section>
    </>}

    {tab==="website"&&<>
      <section className={styles.panel}><h2>Website article drafts</h2>
        <p className={styles.muted}>Write useful help content and guides using approved brand facts. Approval does not publish to external websites.</p>
        <form className={styles.form} action={addMarketingDraft}>
          <input type="hidden" name="brand" value={brand}/><input type="hidden" name="kind" value="website_article"/>
          <input type="hidden" name="platform" value="website"/>
          <label>Supporting approved fact<select name="fact_id"><option value="">Not chosen: draft only</option>
            {approvedFacts.map(f=><option key={f.id} value={f.id}>{f.claim.slice(0,110)}</option>)}</select></label>
          <label>Article outline / body<textarea name="caption" required maxLength={2500} minLength={12} placeholder="Draft a helpful FAQ, guide or product explanation…"/></label>
          <label>Editorial date<input type="date" name="planned_date"/></label>
          <button type="submit">Save website draft</button>
        </form>
      </section>
      <section className={styles.panel}><h2>Website review queue</h2>
        <div className={styles.list}>{bp.filter(p=>p.kind==="website_article").length?bp.filter(p=>p.kind==="website_article").map(p=>
          <div className={styles.item} key={p.id}><span className={styles.status}>{p.status}</span><p>{p.caption}</p>
            {isOwner&&p.status==="draft"&&<form action={approveMarketingPost} className={styles.actionRow}>
              <input type="hidden" name="brand" value={brand}/><input type="hidden" name="id" value={p.id}/>
              <button type="submit">Approve article draft</button></form>}
          </div>):<div className={styles.empty}>No article drafts yet.</div>}</div>
      </section>
    </>}

    {tab==="automation"&&<section className={styles.panel}>
      <h2>Automation and safety</h2><p className={styles.muted}>This initial release is private editorial work only. Live publishing must remain disabled.</p>
      <div className={styles.grid}>
        <div className={styles.profile}><h3>Global publishing</h3><span className={styles.pill}>OFF</span><p className={styles.muted}>No publishing worker, API credential, queue dispatch or cron job has been installed.</p></div>
        <div className={styles.profile}><h3>AI creation</h3><span className={styles.pill}>NOT CONNECTED</span><p className={styles.muted}>Approved-fact evergreen drafts work. External generative AI needs separate verification and spending approval.</p></div>
        <div className={styles.profile}><h3>External websites</h3><span className={styles.pill}>OFF</span><p className={styles.muted}>No site crawler, RSS polling or API source is enabled for any brand.</p></div>
        <div className={styles.profile}><h3>Posting limit</h3><b>{current?.weekly_post_cap??3} per week, planned</b><p className={styles.muted}>Future scheduler must enforce limits per brand and platform.</p></div>
      </div>
      <p className={styles.warning}>Fantasy Lockr remains permanently Avugo-managed content only for this phase. No access to its site, results, scoring, deadlines or Rival systems.</p>
    </section>}

    {tab==="analytics"&&<section className={styles.panel}>
      <h2>Content status and reporting</h2><p className={styles.muted}>Editorial counts below are from this workspace. Provider reach, clicks, publication and revenue data are not connected and must never be estimated.</p>
      <div className={styles.stats}>{[["Drafts",bp.filter(p=>p.status==="draft").length],
        ["Approved",bp.filter(p=>p.status==="approved").length],
        ["Confirmed published",0],["Verified attribution",0]].map(([label,n])=>
        <div className={styles.stat} key={label}><b>{n}</b><span>{label}</span></div>)}</div>
      <p className={styles.warning}>No Facebook, Instagram or website analytics integration has been authorised. Zero here means no verified data from this marketing module, not zero real-world activity.</p>
    </section>}

    {tab==="audit"&&<section className={styles.panel}><h2>Recent changes</h2>
      <p className={styles.muted}>Database audit events are written on edits and approvals. Most recent 75 events across brands.</p>
      {audits.length?<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>When</th><th>Brand</th><th>Area</th><th>Change</th></tr></thead><tbody>
        {audits.map(a=><tr key={a.id}><td>{shortDate(a.happened_at)}</td><td>{a.brand_slug}</td><td>{a.entity.replace("marketing_","")}</td><td>{a.operation}</td></tr>)}
      </tbody></table></div>:<p className={styles.empty}>No marketing changes have been recorded yet.</p>}
    </section>}
  </div>;
}
