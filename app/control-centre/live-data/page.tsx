import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import styles from "../control-centre.module.css";

export const instant = false;
type Source = { id: string; name: string; source_type: string; status: string; health_status: string | null; sync_enabled: boolean | null; last_successful_sync_at: string | null; connector_key: string | null };
type Run = { id: string; status: string; records_seen: number | null; records_accepted: number | null; records_rejected: number | null; started_at: string | null; finished_at: string | null; error_summary: string | null };
type Candidate = { id: string; title: string | null; brand: string | null; category: string | null; price: number | null; currency: string | null; image_url: string | null; created_at: string; reasons: string[] | null; status: string; review_decision: string | null };
type CountResult = { count: number | null; error: { message: string } | null };
const fmt = (value: string | null) => value ? new Date(value).toLocaleString("en-GB") : "Never";
function freshness(value: string | null) {
  return value ? "Successful sync recorded" : "No successful sync";
}
export default async function LiveDataPage() {
  await connection();
  const db = await createClient();
  const [sources, runs, feeds, deals, groceries, evidence, needsReview, excluded, checked, candidates] = await Promise.all([
    db.from("sources").select("id,name,source_type,status,health_status,sync_enabled,last_successful_sync_at,connector_key").order("name"),
    db.from("source_sync_runs").select("id,status,records_seen,records_accepted,records_rejected,started_at,finished_at,error_summary").order("started_at", { ascending: false }).limit(8),
    db.from("feed_import_records").select("*", { count: "exact", head: true }),
    db.from("published_deals").select("*", { count: "exact", head: true }).eq("status", "published"),
    db.from("grocery_prices").select("*", { count: "exact", head: true }),
    db.from("grocery_price_evidence").select("*", { count: "exact", head: true }),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "review").eq("review_decision", "pending"),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "excluded"),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("review_decision", "checked"),
    db.from("feed_import_records").select("id,title,brand,category,price,currency,image_url,created_at,reasons,status,review_decision").eq("status", "review").eq("review_decision", "pending").gt("price", 0).not("title", "is", null).order("created_at", { ascending: false }).limit(40),
  ]);
  const counts: { label: string; result: CountResult; note: string }[] = [
    { label: "Feed import records", result: feeds, note: "Imported records are not automatically approved offers" },
    { label: "Published deal records", result: deals, note: "Publication alone does not confirm current price or availability" },
    { label: "Grocery prices", result: groceries, note: "Requires retailer-backed price evidence before comparison" },
    { label: "Grocery evidence", result: evidence, note: "Evidence entries are separate from published grocery prices" },
    { label: "Feed records awaiting review", result: needsReview, note: "Not approved for publication" },
    { label: "Excluded feed records", result: excluded, note: "Held out of the review-to-publication path" },
    { label: "Feed records checked", result: checked, note: "Reviewed does not automatically mean published" },
  ];
  const errors = [sources.error?.message, runs.error?.message, candidates.error?.message, ...counts.map(x => x.result.error?.message)].filter(Boolean);
  return <>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>Evidence before claims</p><h1>Live Data Monitor</h1><p className={styles.sub}>Read-only operational snapshot from the connected Supabase database. Nothing on this screen imports, approves, publishes or changes data.</p></div></div>
    {errors.length > 0 && <div className={styles.callout}><b>Some data could not be loaded.</b> Counts with access errors show Unavailable, not zero. Check permissions and logs.<ul>{errors.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    <div className={styles.metrics}>{counts.map(x=><div className={styles.metric} key={x.label}><span>{x.label}</span><strong>{x.result.error ? "Unavailable" : (x.result.count ?? 0).toLocaleString("en-GB")}</strong><small>{x.note}</small></div>)}</div>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Registered source health</h2><span>Current database status and last successful sync</span></div>{sources.data?.length ? <table className={styles.table}><thead><tr><th>Source</th><th>State</th><th>Health</th><th>Sync</th><th>Last success</th><th>Freshness</th></tr></thead><tbody>{(sources.data as Source[]).map(s=><tr key={s.id}><td><b>{s.name}</b><div>{s.connector_key ?? s.source_type}</div></td><td>{s.status}</td><td>{s.health_status ?? "Unknown"}</td><td>{s.sync_enabled ? "Enabled" : "Disabled"}</td><td>{fmt(s.last_successful_sync_at)}</td><td>{freshness(s.last_successful_sync_at)}</td></tr>)}</tbody></table> : <div className={styles.empty}>{sources.error ? "Source registry unavailable" : "No registered sources"}</div>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Recent pipeline execution</h2><span>Actual persisted runs, not simulated activity</span></div>{runs.data?.length ? <table className={styles.table}><thead><tr><th>Started</th><th>Status</th><th>Seen</th><th>Accepted</th><th>Rejected</th><th>Reason</th></tr></thead><tbody>{(runs.data as Run[]).map(r=><tr key={r.id}><td>{fmt(r.started_at)}</td><td>{r.status}</td><td>{r.records_seen ?? "—"}</td><td>{r.records_accepted ?? "—"}</td><td>{r.records_rejected ?? "—"}</td><td>{r.error_summary ?? "—"}</td></tr>)}</tbody></table> : <div className={styles.empty}>{runs.error ? "Run history unavailable" : "No runs recorded"}</div>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Potential review candidates</h2><span>Latest 40 pending records with title and positive price</span></div><p className={styles.sub}>Screening only. This is a shortlist for human investigation, not a verified deal ranking. Price and merchant evidence, live URL, stock and rights must still be checked.</p>{candidates.data?.length ? <table className={styles.table}><thead><tr><th>Imported product</th><th>Recorded price</th><th>Category</th><th>Image</th><th>Review blockers</th><th>Imported</th></tr></thead><tbody>{(candidates.data as Candidate[]).map(r=><tr key={r.id}><td><b>{r.title}</b><div>{r.brand ?? "Brand unknown"}</div></td><td>{r.currency ?? "?"} {Number(r.price).toFixed(2)}</td><td>{r.category ?? "Unclassified"}</td><td>{r.image_url ? "Present" : "Missing"}</td><td>{r.reasons?.length ? r.reasons.slice(0,3).join(", ") : "Evidence not yet confirmed"}</td><td>{fmt(r.created_at)}</td></tr>)}</tbody></table> : <div className={styles.empty}>{candidates.error ? "Candidate list unavailable" : "No matching candidates"}</div>}</section>
    <div className={styles.callout}><b>Safety note:</b> A source being configured or a row being published does not prove a live retail offer. Validate timestamps, source evidence, merchant terms and stock before promoting claims. <Link href="/control-centre/pipeline">View pipeline</Link> · <Link href="/control-centre/sources">View source controls</Link></div>
  </>;
}
