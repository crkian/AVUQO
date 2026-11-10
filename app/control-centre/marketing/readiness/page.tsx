import Link from "next/link";
import {connection} from "next/server";
import type {Metadata} from "next";
import {Activity,ArrowRight,CheckCircle2,LockKeyhole,ShieldAlert,ShieldCheck} from "lucide-react";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../lib/supabase/server";
import {assessMarketingReadiness,MARKETING_CHANNEL_ROADMAP,type MarketingSource} from "../../../../lib/marketing/launch-readiness";
import styles from "./page.module.css";
export const instant=false;
export const metadata:Metadata={title:"Marketing launch readiness | AVUQO Control Centre",robots:{index:false,follow:false}};
const paths={avuqo:"/control-centre/marketing?brand=avuqo", "fantasy-lockr":"/control-centre/marketing?brand=fantasy-lockr",
 capshur:"/control-centre/marketing?brand=capshur",cluedoku:"/control-centre/marketing?brand=cluedoku"};
export default async function MarketingReadiness(){
 await connection();const {role}=await requireControlCentreAccess();
 const db=await createClient();
 const [
  system,brands,facts,posts,channels,rules,jobs,assets,placements,
  promotion,advertisers
 ]=await Promise.all([
  db.from("marketing_system").select("publishing_enabled,emergency_stop,ai_enabled").eq("singleton",true).maybeSingle(),
  db.from("marketing_brands").select("slug,name,publishing_enabled,ai_enabled"),
  db.from("marketing_facts").select("brand_slug,status,expires_at").limit(1500),
  db.from("marketing_posts").select("brand_slug,status,kind,platform,source_fact_id").limit(1500),
  db.from("marketing_channels").select("brand_slug,platform,connection_state,publishing_enabled,buffer_channel_id").limit(1500),
  db.from("marketing_automation_rules").select("brand_slug,enabled,platform,last_error").limit(1000),
  db.from("marketing_publication_jobs").select("brand_slug,state").limit(1500),
  db.from("marketing_assets").select("brand_slug,status,rights_note").limit(1000),
  db.from("marketing_home_placements").select("brand_slug,status").limit(1000),
  db.from("promotion_candidates").select("id",{count:"exact",head:true}).eq("status","review"),
  db.from("site_advertisers").select("id",{count:"exact",head:true})
 ]);
 const queryIssues=[system,brands,facts,posts,channels,rules,jobs,assets,placements,promotion,advertisers]
   .some(q=>!!q.error);
 const source:MarketingSource={
  system:queryIssues?null:system.data as MarketingSource["system"],
  env:{live:process.env.MARKETING_LIVE_PUBLISH==="YES",
   worker:process.env.MARKETING_WORKER_ENABLED==="YES",
   draftWorker:process.env.MARKETING_AUTOMATION_DRAFTS==="YES",
   aiConfigured:process.env.MARKETING_AI_GENERATION==="YES"&&!!process.env.OPENAI_API_KEY},
  brands:queryIssues?[]:(brands.data??[]) as MarketingSource["brands"],
  facts:queryIssues?[]:(facts.data??[]) as MarketingSource["facts"],
  posts:queryIssues?[]:(posts.data??[]) as MarketingSource["posts"],
  channels:queryIssues?[]:(channels.data??[]) as MarketingSource["channels"],
  rules:queryIssues?[]:(rules.data??[]) as MarketingSource["rules"],
  jobs:queryIssues?[]:(jobs.data??[]) as MarketingSource["jobs"],
  assets:queryIssues?[]:(assets.data??[]) as MarketingSource["assets"],
  placements:queryIssues?[]:(placements.data??[]) as MarketingSource["placements"]
 };
 const health=assessMarketingReadiness(source);
 return <div className={styles.page}>
  <header className={styles.hero}><p className={styles.kicker}>AVUQO CONTROL CENTRE / MARKETING COMMAND</p>
   <h1>One creative system.<br/><em>Every release gate visible.</em></h1>
   <p>Review existing brand knowledge, creative assets, publishing routes, promotional campaigns and automation. This page reads actual operational records. It never connects channels, approves claims or publishes for you.</p>
   <div className={styles.actions}><Link href="/control-centre/marketing">Open Marketing Studio <ArrowRight size={17}/></Link>
    <Link href="/control-centre/site-advertising">Direct advertising <ArrowRight size={17}/></Link></div>
  </header>
  {queryIssues&&<div className={styles.warning}><ShieldAlert size={18}/> Some operational tables could not be read. Counts and readiness are deliberately treated as unavailable. Check access and schema before relying on this view.</div>}
  <section className={styles.summary} aria-label="Marketing system status">
   <article><small>Live social publishing</small><strong>{health.state==="ready"?"Preflight eligible":health.state==="attention"?"Review needed":"STOPPED"}</strong><p>{source.system?.emergency_stop?"Owner emergency stop active":"All environment, owner and provider gates must agree"}</p></article>
   <article><small>Tracked brands</small><strong>4</strong><p>AVUQO, Fantasy Lockr, Capshur and Cluedoku</p></article>
   <article><small>Affiliate candidate reviews</small><strong>{promotion.error?"Unknown":promotion.count??0}</strong><p>Not publisher-approved deals or social posts</p></article>
   <article><small>Advertisers onboarded</small><strong>{advertisers.error?"Unknown":advertisers.count??0}</strong><p>Separate from affiliate sources and organic rankings</p></article>
  </section>
  <section className={styles.panel}><div className={styles.heading}><div><p className={styles.kicker}>THE FOUR-BRAND CONTROLLED PIPELINE</p><h2>What is actually ready?</h2>
   <p>Automated draft generation, creative approval, social posting and paid advertising are different systems with independent permissions.</p></div>
   <span className={styles.status}><LockKeyhole size={16}/> {role==="owner"?"Owner controls available in Marketing Studio":"Read-only operating view"}</span></div>
   <div className={styles.brandGrid}>{health.brands.map(b=><article key={b.slug} className={styles.brand}>
    <div className={styles.brandHead}><h3>{b.name}</h3><span className={b.deliveryReady?styles.ready:styles.paused}>{b.deliveryReady?"GATES PASSED":"NOT LIVE"}</span></div>
    <dl><div><dt>Current approved facts</dt><dd>{b.approvedFacts}</dd></div>
     <div><dt>Approved social posts</dt><dd>{b.approvedPosts}</dd></div>
     <div><dt>Verified enabled channels</dt><dd>{b.verifiedChannels}</dd></div>
     <div><dt>Approved media assets</dt><dd>{b.approvedAssets}</dd></div>
     <div><dt>Editorial draft rules</dt><dd>{b.enabledDraftRules}</dd></div>
     <div><dt>Provider reconciliation</dt><dd>{b.needsReconciliation}</dd></div></dl>
    <p className={styles.draftNote}>Automatic factual drafts: <strong>{b.draftReady?"Ready for approved schedule":"Not fully configured"}</strong></p>
    {b.reasons.length?<ul className={styles.reasons}>{b.reasons.slice(0,5).map(r=><li key={r}>{r}</li>)}</ul>:
     <p className={styles.good}><CheckCircle2 size={17}/> Core distribution checks satisfied; post-specific gates still apply.</p>}
    <Link className={styles.open} href={paths[b.slug]}>Review this brand <ArrowRight size={16}/></Link>
   </article>)}</div>
  </section>
  <section className={styles.panel}><div className={styles.heading}><div><p className={styles.kicker}>AUTOPILOT / SAFETY-FIRST</p><h2>Automatic where authorised. Human review where needed.</h2></div></div>
   <div className={styles.gates}>{[
    {title:"Editorial drafts",active:source.env.draftWorker,desc:"Daily protected worker can create review-required captions only from current owner-approved facts."},
    {title:"Live social dispatch",active:source.env.live&&source.env.worker&&!!source.system?.publishing_enabled&&!source.system.emergency_stop,desc:"Requires enabled environment, no global stop, approved post, valid media, verified channel and consent."},
    {title:"AI creative requests",active:source.env.aiConfigured&&!!source.system?.ai_enabled,desc:"Owner-initiated and budget-limited. No unattended AI image claims or supplier-image reuse."},
    {title:"Homepage campaign approval",active:health.approvedHomePlacements>0,desc:"Independent AVUQO editorial placements use reviewed factual evidence; advertising has a separate owner workflow."}
   ].map(x=><article key={x.title}><span>{x.active?<Activity size={20}/>:<LockKeyhole size={20}/>}</span><div><h3>{x.title}</h3><p>{x.desc}</p><strong>{x.active?"Configured, subject to remaining checks":"Off or not approved"}</strong></div></article>)}</div>
   <div className={styles.warning}><ShieldCheck size={18}/> A schedule does not equal distribution. Marketing never bypasses source/image rights, affiliate disclosure, third-party platform rules, consent or independent product scoring.</div>
  </section>
  <section className={styles.panel}><div className={styles.heading}><div><p className={styles.kicker}>PINTEREST FIRST / CHANNEL ROADMAP</p><h2>One premium style. Content suited to the platform.</h2>
   <p>The owner's original marketing specification calls for Pinterest vertical discovery graphics, factual captions, an AVUQO landing page and independent attribution. Pinterest is not yet a verified connector in this application's marketing channel schema, so scheduling is not falsely presented as active.</p></div></div>
   <div className={styles.channelGrid}>{MARKETING_CHANNEL_ROADMAP.map(x=><article key={x.name}><h3>{x.name}</h3><span>{x.state}</span><p>{x.purpose}</p></article>)}</div>
   <div className={styles.warning}><ShieldAlert size={18}/> Next external dependency: an explicitly approved Pinterest account/integration, platform/affiliate permissions, original reusable creative, verified deal landing pages and consent-aware attribution. Connecting those is not accomplished by creating a draft.</div>
  </section>
  <section className={styles.panel}><h2>Continue in the existing owner tools</h2>
   <nav className={styles.toolLinks}><Link href="/control-centre/marketing?tab=studio">Create and review factual creative <ArrowRight size={16}/></Link>
    <Link href="/control-centre/marketing?tab=automation">Set schedules and kill switches <ArrowRight size={16}/></Link>
    <Link href="/control-centre/promotions">Review affiliate promotion candidates <ArrowRight size={16}/></Link>
    <Link href="/control-centre/site-advertising">Verify direct advertiser briefs <ArrowRight size={16}/></Link>
    <Link href="/control-centre/source-atlas">Inspect actual supplier rights <ArrowRight size={16}/></Link></nav>
  </section>
 </div>;
}
