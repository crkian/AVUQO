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
import {createAdminClient} from "../../../lib/supabase/admin";
import {
  createAIMarketingDraft, createAIMarketingImage, uploadMarketingImage,
  approveMarketingImage, attachMarketingImage, verifyMarketingBufferChannel,
  setMarketingSwitch, queueMarketingPost, cancelMarketingPublication, planMarketingWeek
} from "./advanced-actions";

type Brand = {slug:string;name:string;tone:string;audience:string;website_url:string|null;weekly_post_cap:number;publishing_enabled:boolean;ai_enabled:boolean};
type Fact = { id:string; brand_slug:string; claim:string; source_note:string; status:string; expires_at:string|null; created_at:string };
type Post = {id:string;brand_slug:string;kind:string;platform:string;caption:string;status:string;source_fact_id:string|null;planned_date:string|null;created_at:string;asset_id:string|null;ai_assisted:boolean};
type Channel = {id:string;brand_slug:string;platform:string;handle:string;connection_state:string;publishing_enabled:boolean;buffer_channel_id:string|null};
type Asset = {id:string;brand_slug:string;status:string;alt_text:string;storage_path:string;public_url:string|null;rights_note:string;created_at:string};
type Job = {id:string;post_id:string;brand_slug:string;state:string;due_at:string;last_error:string|null;provider_post_id:string|null;provider_metrics: {type:string;name:string;value:number;unit:string}[]|null;metrics_updated_at:string|null};
type GlobalControls = {publishing_enabled:boolean;ai_enabled:boolean;emergency_stop:boolean};
type Audit = { id:number; brand_slug:string|null; entity:string; operation:string; happened_at:string; actor_id:string|null };
const TABS = [
  ["overview","Overview"],["brands","Brands"],["facts","Brand knowledge"],
  ["studio","Content Studio"],["media","Images"],["calendar","Calendar"],["channels","Social Connections"],["queue","Publishing Queue"],
  ["website","Website Content"],["automation","Automation"],["analytics","Analytics"],["audit","Audit"]
] as const;
const notices: Record<string,string> = {
  "brand-saved":"Brand details saved.","fact-added":"Fact saved privately. It needs owner approval.",
  "fact-approved":"Fact approved for editorial use.","draft-saved":"Draft saved privately.",
  "post-approved":"Content approved for review purposes, not published or scheduled.",
  "channel-added":"Account label saved. No social account has been connected.",
  "ai-draft":"AI draft created for owner review. It is not approved or published.",
  "image-draft":"Image saved privately for review.","image-approved":"Approved image is available for publishing after all other checks.",
  "image-attached":"Approved image attached to draft.","channel-verified":"Buffer account verified, but publishing remains disabled.",
  "switch-saved":"Safety settings updated.","post-queued":"Approved post queued for the future provider worker.","post-cancelled":"Publication cancelled, pending external provider confirmation where applicable.", "week-planned":"A fresh batch of review-required evergreen drafts was placed in the editorial calendar."
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
    db.from("marketing_brands").select("slug,name,tone,audience,website_url,weekly_post_cap,publishing_enabled,ai_enabled").order("name"),
    db.from("marketing_facts").select("id,brand_slug,claim,source_note,status,expires_at,created_at").order("created_at",{ascending:false}).limit(300),
    db.from("marketing_posts").select("id,brand_slug,kind,platform,caption,status,source_fact_id,planned_date,created_at,asset_id,ai_assisted").order("created_at",{ascending:false}).limit(300),
    db.from("marketing_channels").select("id,brand_slug,platform,handle,connection_state,publishing_enabled,buffer_channel_id").order("created_at",{ascending:false}).limit(100),
    db.from("marketing_audit").select("id,brand_slug,entity,operation,happened_at,actor_id").order("happened_at",{ascending:false}).limit(75)
  ]);
  const extended = await Promise.all([
    db.from("marketing_system").select("publishing_enabled,ai_enabled,emergency_stop").eq("singleton",true).maybeSingle(),
    db.from("marketing_assets").select("id,brand_slug,status,alt_text,storage_path,public_url,rights_note,created_at").order("created_at",{ascending:false}).limit(100),
    db.from("marketing_publication_jobs").select("id,post_id,brand_slug,state,due_at,last_error,provider_post_id,provider_metrics,metrics_updated_at").order("created_at",{ascending:false}).limit(100)
  ]);
  const system = (extended[0].data??null) as GlobalControls|null;
  const assets = (extended[1].data??[]) as Asset[];
  const jobs = (extended[2].data??[]) as Job[];
  const myAssets=assets.filter(a=>a.brand_slug===brand);
  const approvedImages=myAssets.filter(a=>a.status==="approved");
  const myJobs=jobs.filter(j=>j.brand_slug===brand);
  const safeMode=process.env.MARKETING_LIVE_PUBLISH!=="YES";
  const canGenerate=process.env.MARKETING_AI_GENERATION==="YES" && !!process.env.OPENAI_API_KEY &&
    !!system?.ai_enabled;
  const pendingPreviews = myAssets.filter(a=>a.status==="draft");
  const previewEntries=await Promise.all(pendingPreviews.map(async asset=>{
    try {
      const {data}=await createAdminClient().storage.from("marketing-media").createSignedUrl(asset.storage_path,300);
      return [asset.id,data?.signedUrl??""] as const;
    } catch {return [asset.id,""] as const;}
  }));
  const previewById=new Map<string,string>(previewEntries);
  const problem = results.find(result=>result.error)?.error || extended.find(result=>result.error)?.error;
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
      <span className={styles.pill}>{safeMode?"Live publishing OFF":system?.emergency_stop?"Emergency stop ON":"Publishing controls configured"}</span>
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
          ["Confirmed published",jobs.filter(j=>j.state==="published").length]].map(([label,total])=><div className={styles.stat} key={label}>
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
      <section className={styles.panel}><h2>Generate an AI caption</h2>
        <p className={styles.muted}>Owner-triggered only. Starts as a draft and requires separate factual review. AI generation is off until the account, spending limits and permissions are connected.</p>
        <form className={styles.form} action={createAIMarketingDraft}>
          <input type="hidden" name="brand" value={brand}/>
          <label>Approved factual source<select name="fact_id" required>{approvedFacts.map(f=><option key={f.id} value={f.id}>{f.claim.slice(0,100)}</option>)}</select></label>
          <label>Destination<select name="platform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="website">Website article</option></select></label>
          <button disabled={!isOwner||!canGenerate||!approvedFacts.length}>Generate private AI draft</button>
        </form>
      </section>
      <section className={styles.panel}><h2>Plan the next seven days</h2>
        <p className={styles.muted}>One click creates up to your brand's weekly cap in varied evergreen drafts from approved facts. Repeated captions are skipped. All require review and approval.</p>
        <form className={styles.form} action={planMarketingWeek}>
          <input type="hidden" name="brand" value={brand}/>
          <label>Channel<select name="platform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select></label>
          <button type="submit" disabled={!isOwner||!approvedFacts.length}>Create my week's drafts</button>
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
          {isOwner&&p.status==="draft"&&approvedImages.length>0&&<form action={attachMarketingImage} className={styles.actionRow}>
            <input type="hidden" name="brand" value={brand}/>
            <input type="hidden" name="post_id" value={p.id}/>
            <select name="asset_id" defaultValue={p.asset_id??""}>
              <option value="">Select approved image</option>
              {approvedImages.map(a=><option key={a.id} value={a.id}>{a.alt_text.slice(0,50)}</option>)}
            </select><button type="submit">Attach image</button>
          </form>}
          {isOwner&&p.status==="draft"&&<form action={approveMarketingPost} className={styles.actionRow}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="id" value={p.id}/>
            <button type="submit">Review and approve</button>
          </form>}
        </article>):<p className={styles.empty}>No social drafts yet.</p>}</div>
      </section>
    </>}

    {tab==="media"&&<>
      <section className={styles.panel}><h2>Creative image library</h2>
        <p className={styles.muted}>Generate or upload images, inspect them, record usage rights and approve them. Drafts stay private; approved images are copied to a public media bucket only when you explicitly approve.</p>
        <div className={styles.grid}>
          <form className={styles.form} action={createAIMarketingImage}>
            <input type="hidden" name="brand" value={brand}/>
            <h3>Generate an image with AI</h3>
            <label>Based on an approved fact<select name="fact_id" required>{approvedFacts.map(f=><option key={f.id} value={f.id}>{f.claim.slice(0,90)}</option>)}</select></label>
            <label>Visual direction<input name="visual_style" maxLength={250} placeholder="Premium graphic, deep navy and violet"/></label>
            <button type="submit" disabled={!isOwner||!canGenerate||!approvedFacts.length}>Generate private image draft</button>
            <p className={styles.muted}>{canGenerate?"AI requests may incur a provider charge. Usage caps apply.":"AI is off until configured and enabled by the owner."}</p>
          </form>
          <form className={styles.form} action={uploadMarketingImage}>
            <input type="hidden" name="brand" value={brand}/>
            <h3>Upload your own approved artwork</h3>
            <label>Image PNG/JPEG, up to 5 MB<input type="file" accept="image/png,image/jpeg" name="image" required/></label>
            <label>Alternative text<input name="alt_text" minLength={5} maxLength={300} required/></label>
            <button type="submit" disabled={!isOwner}>Upload privately</button>
          </form>
        </div>
      </section>
      <section className={styles.panel}><h2>Image approval queue</h2>
        <div className={styles.grid}>{myAssets.length?myAssets.map(asset=>
          <article key={asset.id} className={styles.item}>
            <span className={styles.status}>{asset.status}</span>
            {(asset.public_url||previewById.get(asset.id))&&
              <img src={asset.public_url||previewById.get(asset.id)||""} alt={asset.alt_text} loading="lazy"
                style={{maxWidth:"100%",maxHeight:250,objectFit:"contain",display:"block",marginTop:12}}/>}
            <p>{asset.alt_text}</p>
            {asset.status==="draft"&&isOwner&&<form className={styles.form} action={approveMarketingImage}>
              <input type="hidden" name="brand" value={brand}/>
              <input type="hidden" name="asset_id" value={asset.id}/>
              <label>Proof of image ownership / licence<input name="rights_note" minLength={8} maxLength={400} required placeholder="My original artwork or approved commercial-use AI image"/></label>
              <button type="submit">Approve image and prepare public asset</button>
            </form>}
          </article>):<p className={styles.empty}>No images added for this brand yet.</p>}</div>
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
          <p className={styles.meta}>Connection: {c.connection_state} · Publishing: {c.publishing_enabled?"enabled":"off"} · {c.buffer_channel_id?"Buffer channel verified":"No provider mapping"}</p>
          {isOwner&&c.connection_state==="unconnected"&&<form action={verifyMarketingBufferChannel} className={styles.form}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="channel_id" value={c.id}/>
            <label>Matching Buffer channel ID<input name="buffer_channel_id" placeholder="Buffer channel ID from your account" required/></label>
            <button disabled={process.env.MARKETING_CONNECT_PROVIDERS!=="YES"}>Verify exact account identity</button>
          </form>}
          {isOwner&&c.connection_state==="verified"&&<form action={setMarketingSwitch} className={styles.actionRow}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="scope" value="channel"/>
            <input type="hidden" name="channel_id" value={c.id}/><input type="hidden" name="enabled" value={String(!c.publishing_enabled)}/>
            <button>{c.publishing_enabled?"Disable publishing":"Enable channel (after testing)"}</button>
          </form>}
        </div>):<p className={styles.empty}>No accounts recorded. Add a label above.</p>}</div>
      </section>
    </>}

    {tab==="queue"&&<>
      <section className={styles.panel}><h2>Schedule reviewed content</h2>
        <p className={styles.muted}>Choose a previously approved social post and a verified channel belonging to the same brand. Enter a UTC publishing time between 20 minutes and 14 days ahead. No posting occurs until every safety switch is on.</p>
        <form className={styles.form} action={queueMarketingPost}>
          <input type="hidden" name="brand" value={brand}/>
          <label>Approved social post<select name="post_id" required>{bp.filter(p=>p.kind==="social"&&p.status==="approved").map(p=><option key={p.id} value={p.id}>{p.platform}: {p.caption.slice(0,95)}</option>)}</select></label>
          <label>Verified social account<select name="channel_id" required>{bc.filter(c=>c.connection_state==="verified").map(c=><option value={c.id} key={c.id}>{c.platform}: {c.handle}</option>)}</select></label>
          <label>Publishing time (UTC)<input type="datetime-local" name="due_at" required/></label>
          <button disabled={!isOwner||safeMode||!system?.publishing_enabled||system.emergency_stop}>Add to guarded queue</button>
        </form>
      </section>
      <section className={styles.panel}><h2>Delivery and reconciliation</h2>
        <p className={styles.muted}>Scheduled means Buffer acknowledged the request. Published appears only after Buffer reports sent. Uncertain requests must be reconciled, never blindly retried. The global stop prevents new dispatches but cannot unsend posts already accepted by Buffer.</p>
        <div className={styles.list}>{myJobs.length?myJobs.map(j=><article className={styles.item} key={j.id}>
          <span className={styles.status}>{j.state}</span> <span className={styles.meta}>{new Date(j.due_at).toLocaleString("en-GB",{timeZone:"Europe/London"})}</span>
          <p>{bp.find(p=>p.id===j.post_id)?.caption.slice(0,180)??"Approved post"}</p>
          {j.last_error&&<p className={styles.warning}>{j.last_error}</p>}
          {j.provider_post_id&&<p className={styles.meta}>Provider reference: {j.provider_post_id}</p>}
          {isOwner&&["queued","scheduled"].includes(j.state)&&
            <form action={cancelMarketingPublication} className={styles.actionRow}>
              <input type="hidden" name="brand" value={brand}/>
              <input type="hidden" name="job_id" value={j.id}/>
              <button type="submit">Cancel publication</button>
            </form>}
        </article>):<p className={styles.empty}>No scheduled publications yet.</p>}</div>
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
      <h2>Automation and emergency controls</h2>
      <p className={styles.muted}>All settings are off by default. Server switches and explicit owner consent are also required. These controls cannot override a stopped environment.</p>
      <div className={styles.grid}>
        <div className={styles.profile}><h3>Global publishing</h3>
          <span className={styles.status}>{system?.publishing_enabled&&!system.emergency_stop?"Configured":"STOPPED"}</span>
          <p className={styles.muted}>Server gate: {safeMode?"OFF":"ENABLED"} · Emergency stop: {system?.emergency_stop?"ON":"OFF"}</p>
          {isOwner&&<form className={styles.actionRow} action={setMarketingSwitch}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="scope" value="global"/>
            <input type="hidden" name="enabled" value={String(!system?.publishing_enabled)}/>
            <button disabled={safeMode&&!system?.publishing_enabled}>{system?.publishing_enabled?"STOP ALL PUBLISHING":"Enable global publishing"}</button>
          </form>}
        </div>
        <div className={styles.profile}><h3>{current?.name??brand} publishing</h3>
          <span className={styles.status}>{current?.publishing_enabled?"ON":"OFF"}</span>
          {isOwner&&<form action={setMarketingSwitch} className={styles.actionRow}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="scope" value="brand"/>
            <input type="hidden" name="enabled" value={String(!current?.publishing_enabled)}/>
            <button disabled={safeMode&&!current?.publishing_enabled}>{current?.publishing_enabled?"Stop brand":"Enable brand"}</button>
          </form>}
        </div>
        <div className={styles.profile}><h3>AI creative</h3>
          <span className={styles.status}>{canGenerate?"READY":"OFF"}</span>
          <p className={styles.muted}>Daily limit: 3 requests per brand. Monthly cap: 15 by default. Costs are recorded as unknown until provider billing is reconciled.</p>
          {isOwner&&<form action={setMarketingSwitch} className={styles.actionRow}>
            <input type="hidden" name="brand" value={brand}/><input type="hidden" name="scope" value="ai"/>
            <input type="hidden" name="enabled" value={String(!system?.ai_enabled)}/>
            <button>{system?.ai_enabled?"Disable AI":"Enable AI after budget setup"}</button>
          </form>}
        </div>
        <div className={styles.profile}><h3>Publishing frequency</h3>
          <b>{current?.weekly_post_cap??3} posts per rolling week</b>
          <p className={styles.muted}>No automatic ad spending, DMs, account monitoring or third-party website crawling is implemented.</p>
        </div>
      </div>
      <p className={styles.warning}>Fantasy Lockr uses ONLY owner-approved facts in AVUQO, never its live website, runtime, results, database, fixtures or Rival services.</p>
    </section>}

    {tab==="analytics"&&<section className={styles.panel}>
      <h2>Real marketing performance</h2><p className={styles.muted}>Content lifecycle and provider-reported outcomes are kept separate. Missing metrics mean unavailable, not zero. Website/affiliate conversions require separate attribution integrations.</p>
      <div className={styles.stats}>{[
        ["Drafts",bp.filter(p=>p.status==="draft").length],
        ["Editorial approved",bp.filter(p=>p.status==="approved").length],
        ["Buffer scheduled",myJobs.filter(j=>j.state==="scheduled").length],
        ["Confirmed sent",myJobs.filter(j=>j.state==="published").length]
      ].map(([label,n])=><div className={styles.stat} key={label}><b>{n}</b><span>{label}</span></div>)}</div>
      <div className={styles.list}>{myJobs.filter(j=>j.state==="published").map(j=>
        <article key={j.id} className={styles.item}>
          <strong>{bp.find(p=>p.id===j.post_id)?.platform??"Social"} post</strong>
          <p className={styles.meta}>Provider metrics checked: {j.metrics_updated_at?shortDate(j.metrics_updated_at):"not available"}</p>
          <p>{j.provider_metrics?.length?j.provider_metrics.map(m=>m.name+": "+m.value+" "+m.unit).join(" · "):"No verified provider metrics yet"}</p>
        </article>)}</div>
      <p className={styles.warning}>Affiliate commission, post clicks and conversions are not inferred from Buffer engagement data. Integrate authorised attribution later.</p>
    </section>}

    {tab==="audit"&&<section className={styles.panel}><h2>Recent changes</h2>
      <p className={styles.muted}>Database audit events are written on edits and approvals. Most recent 75 events across brands.</p>
      {audits.length?<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>When</th><th>Brand</th><th>Area</th><th>Change</th></tr></thead><tbody>
        {audits.map(a=><tr key={a.id}><td>{shortDate(a.happened_at)}</td><td>{a.brand_slug}</td><td>{a.entity.replace("marketing_","")}</td><td>{a.operation}</td></tr>)}
      </tbody></table></div>:<p className={styles.empty}>No marketing changes have been recorded yet.</p>}
    </section>}
  </div>;
}
