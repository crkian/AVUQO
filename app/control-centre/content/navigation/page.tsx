import {connection} from "next/server";
import Link from "next/link";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../lib/supabase/server";
import {DEFAULT_NAVIGATION,parseNavigation} from "../../../../lib/content/navigation";
import {publishNavigation,restoreNavigation,saveNavigationDraft} from "./actions";
import styles from "./navigation.module.css";
export default async function NavigationEditor(){
 await connection();
 const {role}=await requireControlCentreAccess();
 const db=await createClient();
 const [draftR,liveR,revisionsR]=await Promise.all([
  db.from("site_content_drafts").select("payload,updated_at").eq("key","navigation").maybeSingle(),
  db.from("site_content_published").select("payload,version,published_at").eq("key","navigation").maybeSingle(),
  db.from("site_content_revisions").select("version,published_at").eq("key","navigation")
   .order("version",{ascending:false}).limit(8)
 ]);
 const draft=draftR.data?parseNavigation(draftR.data.payload):DEFAULT_NAVIGATION;
 const published=liveR.data?parseNavigation(liveR.data.payload):DEFAULT_NAVIGATION;
 const valid=draftR.data?JSON.stringify(draft)===JSON.stringify(draftR.data.payload):true;
 return <div className={styles.page}>
  <div className={styles.head}>
    <p className={styles.eyebrow}>Website & Content / Navigation</p>
    <h1>Navigation editor</h1>
    <p>Manage the wording, order and visibility of AVUQO&apos;s customer menu. Links are locked to real site routes. Save a private draft first; only the owner can publish it.</p>
    <p className={styles.meta}>Live: {liveR.data?"Version "+liveR.data.version:"vetted built-in menu"} · Draft: {draftR.data?.updated_at?new Date(draftR.data.updated_at).toLocaleString("en-GB"):"none"}</p>
    <div className={styles.actions}><Link href="/" target="_blank">Open public homepage</Link><Link href="/control-centre/content">Return to Website & Content</Link></div>
  </div>
  {!valid&&<p className={styles.warning}>The stored draft is not valid for the current navigation version. Showing the safe default.</p>}
  {([draftR,liveR,revisionsR].some(x=>x.error))&&<p className={styles.warning}>The menu CMS could not read all data. Confirm the navigation migration is installed.</p>}
  <div className={styles.guide}>
    <strong>Recommended customer journey:</strong> Discover → Deals → Compare → Groceries → Categories → Travel → More.
    Budgeting remains a planned service, so it is not presented as a working menu destination.
  </div>
  <form action={saveNavigationDraft} className={styles.form}>
    {draft.groups.map(g=>{
      const essential=["discover","deals","compare","groceries","categories"].includes(g.id);
      const current=published.groups.find(p=>p.id===g.id);
      return <details key={g.id} className={styles.department} open={essential&&g.order<2}>
        <summary><span><strong>{g.label}</strong><small>{g.href} · {essential?"Essential navigation":"Optional department"} · {current?.enabled?"Public group available":"Public group hidden"}</small></span></summary>
        <div className={styles.groupBody}>
          <div className={styles.cols}>
            <label>Menu heading<input name={"g_"+g.id+"_label"} defaultValue={g.label} maxLength={36} required/></label>
            <label>Position<input type="number" name={"g_"+g.id+"_order"} defaultValue={g.order} min={0} max={50} required/></label>
          </div>
          <label>Brief explanation<input name={"g_"+g.id+"_intro"} defaultValue={g.intro} maxLength={110} required/></label>
          {essential?<p className={styles.note}>This essential customer journey stays visible. Change its wording or order, not its destination.</p>:
            <label className={styles.toggle}><input type="checkbox" name={"g_"+g.id+"_enabled"} value="yes" defaultChecked={g.enabled}/> Show department</label>}
          <h3>Submenu links</h3>
          {g.links.map((link,i)=><div className={styles.linkRow} key={link.href}>
            <div className={styles.cols}>
              <label>Link label<input name={"l_"+g.id+"_"+i+"_label"} defaultValue={link.label} maxLength={45} required/></label>
              <label>Order<input type="number" name={"l_"+g.id+"_"+i+"_order"} defaultValue={link.order} min={0} max={70} required/></label>
            </div>
            <label>Helpful description<input name={"l_"+g.id+"_"+i+"_description"} defaultValue={link.description} maxLength={130} required/></label>
            <div className={styles.linkFoot}><span>Destination: <code>{link.href}</code></span>
              <label className={styles.toggle}><input type="checkbox" name={"l_"+g.id+"_"+i+"_enabled"} value="yes" defaultChecked={link.enabled}/> Show link</label>
            </div>
          </div>)}
        </div>
      </details>;
    })}
    <button type="submit" className={styles.primary}>Save private navigation draft</button>
  </form>
  <div className={styles.publish}>
    <div><h2>Publish the reviewed menu</h2><p>All visitors see the last published menu. Drafts remain private until the owner publishes them.</p></div>
    {role==="owner"&&<form action={publishNavigation}><button type="submit" className={styles.primary} disabled={!draftR.data||!valid}>Publish saved draft</button></form>}
  </div>
  <section className={styles.history}>
    <h2>Published revisions</h2>
    <p>Restore creates a fresh published version using the selected previous copy.</p>
    {revisionsR.data?.length?revisionsR.data.map(rev=><div key={rev.version} className={styles.revision}>
      <span>Version {rev.version} · {new Date(rev.published_at).toLocaleString("en-GB")}</span>
      {role==="owner"&&<form action={restoreNavigation}><input type="hidden" name="version" value={rev.version}/><button type="submit">Restore</button></form>}
    </div>):<p>No previous navigation revisions yet.</p>}
  </section>
 </div>;
}
