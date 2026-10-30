import {connection} from "next/server";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
import {AD_ZONES} from "../../../lib/site-advertising/policy";
import {addSiteAdvertiser,addSiteAdCampaign,verifySiteAdvertiser,reviewSiteAdCampaign} from "./actions";
import styles from "./site-advertising.module.css";

type Advertiser={id:string;company_name:string;contact_name:string;contact_email:string;website:string;status:string;verification_note:string};
type Campaign={id:string;advertiser_id:string;title:string;headline:string;body:string;target_url:string;zone:string;starts_at:string;ends_at:string;status:string;rights_note:string};
const messages:Record<string,string>={
 "advertiser-added":"Advertiser saved for verification. No bookings or payments have been taken.",
 "advertiser-reviewed":"Advertiser verification decision recorded.",
 "campaign-added":"Campaign brief saved privately. No advertisement has been scheduled or served.",
 "campaign-reviewed":"Campaign review decision recorded. Approval does not enable ad serving."
};
export default async function SiteAdvertising({searchParams}:{searchParams:Promise<{notice?:string}>}){
 await connection();
 const {role}=await requireControlCentreAccess();
 const {notice}=await searchParams;
 const db=await createClient();
 const [advertisersR,campaignsR,auditR]=await Promise.all([
  db.from("site_advertisers").select("id,company_name,contact_name,contact_email,website,status,verification_note")
   .order("created_at",{ascending:false}).limit(100),
  db.from("site_ad_campaigns").select("id,advertiser_id,title,headline,body,target_url,zone,starts_at,ends_at,status,rights_note")
   .order("created_at",{ascending:false}).limit(100),
  db.from("site_ad_audit").select("id,operation,entity,recorded_at").order("recorded_at",{ascending:false}).limit(10)
 ]);
 const advertisers=(advertisersR.data??[]) as Advertiser[];
 const campaigns=(campaignsR.data??[]) as Campaign[];
 const isOwner=role==="owner";
 return <div className={styles.page}>
  <div className={styles.header}><p className={styles.kicker}>Advertising & Growth / Site Advertising</p>
   <h1>Advertising on AVUQO</h1>
   <p>Manage outside businesses interested in advertising on AVUQO. These records are entirely separate from marketing AVUQO, Fantasy Lockr, Capshur and Cluedoku on social media, and separate from affiliate offers.</p>
   <div className={styles.blocked}><strong>Ad serving OFF · Bookings OFF · Payments NOT CONNECTED</strong>
    <span>Campaigns can be reviewed and marked ready, but nothing here creates a public advertisement, invoice or billable impression. Advertising inventory, contracts, payment collection and consent-aware measurement require separate release approval.</span></div>
  </div>
  {notice&&messages[notice]&&<p className={styles.notice}>{messages[notice]}</p>}
  {(advertisersR.error||campaignsR.error||auditR.error)&&<p className={styles.warning}>The private advertising tables are unavailable. Check the versioned migration and your role permissions before using this workspace.</p>}
  <div className={styles.stats}>
   <div><span>Advertisers</span><strong>{advertisersR.error?"Unavailable":advertisers.length}</strong></div>
   <div><span>Verified organisations</span><strong>{advertisersR.error?"Unavailable":advertisers.filter(x=>x.status==="verified").length}</strong></div>
   <div><span>Private campaign briefs</span><strong>{campaignsR.error?"Unavailable":campaigns.length}</strong></div>
   <div><span>Public ads served</span><strong>Not enabled</strong></div>
  </div>
  <section className={styles.panel}><h2>1. Advertisers</h2><p>Record the organisation and contact. Verify business legitimacy and rights before approving a campaign.</p>
   {isOwner&&<form className={styles.form} action={addSiteAdvertiser}>
    <div className={styles.cols}><label>Company name<input name="company_name" maxLength={120} required/></label>
      <label>Contact name<input name="contact_name" maxLength={120} required/></label></div>
    <div className={styles.cols}><label>Business email<input type="email" name="contact_email" maxLength={200} required/></label>
      <label>Official HTTPS website<input type="url" name="website" placeholder="https://example.com" required/></label></div>
    <button>Add private advertiser prospect</button>
   </form>}
   <div className={styles.list}>{advertisers.length?advertisers.map(a=><article key={a.id} className={styles.item}>
    <div><strong>{a.company_name}</strong> <span className={styles.status}>{a.status}</span></div>
    <p>{a.contact_name} · {a.contact_email}</p><p>{a.website}</p>
    {a.status==="prospect"&&isOwner&&<div className={styles.review}>
     <form action={verifySiteAdvertiser}><input type="hidden" name="advertiser_id" value={a.id}/>
      <label>Verification evidence and notes<input name="verification_note" minLength={8} maxLength={750} required placeholder="Company registration, authorised contact and approved rights"/></label>
      <div className={styles.buttons}><button name="decision" value="verify">Verify advertiser</button>
        <button name="decision" value="decline" className={styles.secondary}>Decline</button></div>
     </form></div>}
   </article>):<div className={styles.empty}>No external advertisers recorded yet.</div>}</div>
  </section>
  <section className={styles.panel}><h2>2. Campaign briefs</h2>
   <p>Keep each requested placement, advertiser, disclosure and planned schedule together. A ready brief still does not mean an ad is delivering.</p>
   {isOwner&&advertisers.length>0&&<form className={styles.form} action={addSiteAdCampaign}>
    <label>Advertiser<select name="advertiser_id" required>{advertisers.map(a=><option key={a.id} value={a.id}>{a.company_name} · {a.status}</option>)}</select></label>
    <div className={styles.cols}><label>Internal campaign name<input name="title" maxLength={110} minLength={6} required/></label>
      <label>Placement zone<select name="zone">{AD_ZONES.map(z=><option key={z.id} value={z.id}>{z.label}</option>)}</select></label></div>
    <label>Creative headline<input name="headline" minLength={8} maxLength={120} required/></label>
    <label>Creative body<textarea name="body" minLength={15} maxLength={350} rows={3} required/></label>
    <div className={styles.cols}><label>CTA text<input name="cta_label" maxLength={35} defaultValue="Learn more" required/></label>
      <label>Approved destination URL (HTTPS)<input type="url" name="target_url" placeholder="https://advertiser.example/landing" required/></label></div>
    <div className={styles.cols}><label>Proposed start (UTC)<input type="datetime-local" name="starts_at" required/></label>
      <label>Proposed end (UTC)<input type="datetime-local" name="ends_at" required/></label></div>
    <button>Create private campaign brief</button>
   </form>}
   <div className={styles.list}>{campaigns.length?campaigns.map(c=><article key={c.id} className={styles.item}>
    <div><strong>{c.title}</strong> <span className={styles.status}>{c.status}</span></div>
    <p className={styles.meta}>{advertisers.find(a=>a.id===c.advertiser_id)?.company_name??"Unknown advertiser"} · {AD_ZONES.find(z=>z.id===c.zone)?.label??c.zone} · {new Date(c.starts_at).toLocaleDateString("en-GB")} to {new Date(c.ends_at).toLocaleDateString("en-GB")}</p>
    <h3>{c.headline}</h3><p>{c.body}</p><p className={styles.meta}>Landing destination: {c.target_url}</p>
    {isOwner&&c.status==="draft"&&<form action={reviewSiteAdCampaign} className={styles.buttons}>
      <input type="hidden" name="campaign_id" value={c.id}/><button name="decision" value="review">Move to editorial review</button>
      <button name="decision" value="decline" className={styles.secondary}>Decline brief</button>
    </form>}
    {isOwner&&c.status==="in_review"&&<form action={reviewSiteAdCampaign} className={styles.form}>
      <input type="hidden" name="campaign_id" value={c.id}/>
      <label>Creative rights and approval evidence<input name="rights_note" minLength={8} maxLength={750} required placeholder="Licence and advertiser permission confirmed"/></label>
      <div className={styles.buttons}><button name="decision" value="approve">Approve creative for future setup</button>
        <button name="decision" value="decline" className={styles.secondary}>Decline</button></div>
    </form>}
    {isOwner&&c.status==="ready"&&<form action={reviewSiteAdCampaign}>
      <input type="hidden" name="campaign_id" value={c.id}/><button name="decision" value="pause">Pause approved brief</button>
    </form>}
   </article>):<div className={styles.empty}>No third-party campaigns recorded.</div>}</div>
  </section>
  <section className={styles.panel}><h2>3. What is still needed before taking bookings</h2>
   <div className={styles.requirements}>
    <p><strong>Inventory & rotations:</strong> reserved zones, capacity, fair delivery and frequency caps.</p>
    <p><strong>Commercial terms:</strong> signed agreements, rates, cancellation/refunds and payment or invoice reconciliation.</p>
    <p><strong>Compliance:</strong> creative files, intellectual-property permissions, landing-page approval, required disclosures and independent rankings.</p>
    <p><strong>Reporting:</strong> consent-aware impressions, clicks, delivery audits, bot filtering and accurate advertiser reports.</p>
   </div>
   <Link href="/control-centre/marketing">Go to Brand Social Marketing (our four brands)</Link>
  </section>
  <section className={styles.panel}><h2>Recent private audit events</h2>
   <div className={styles.list}>{auditR.data?.length?auditR.data.map(event=><p className={styles.audit} key={event.id}>
    {event.entity} · {event.operation} · {new Date(event.recorded_at).toLocaleString("en-GB")}
   </p>):<p>No recorded advertising changes.</p>}</div>
  </section>
 </div>;
}
