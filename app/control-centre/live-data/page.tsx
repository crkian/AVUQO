import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import styles from "../control-centre.module.css";
import EndpointHealthCheck from "./EndpointHealthCheck";

export const instant = false;
type Source = { id: string; name: string; source_type: string; status: string; health_status: string | null; sync_enabled: boolean | null; last_successful_sync_at: string | null; connector_key: string | null };
type Run = { id: string; status: string; records_seen: number | null; records_accepted: number | null; records_rejected: number | null; started_at: string | null; finished_at: string | null; error_summary: string | null };
type Candidate = { metadata: { tracking_link_present?: boolean; source_update_present?: boolean; gtin_present?: boolean } | null; merchant_id: string | null; merchant_product_id: string | null; awin_product_id: string | null; id: string; title: string | null; brand: string | null; category: string | null; price: number | null; currency: string | null; image_url: string | null; created_at: string; reasons: string[] | null; status: string; review_decision: string | null };
type CountResult = { count: number | null; error: { message: string } | null };
const fmt = (value: string | null) => value ? new Date(value).toLocaleString("en-GB") : "Never";
function freshness(value: string | null) {
  return value ? "Successful sync recorded" : "No successful sync";
}
export default async function LiveDataPage() {
  await connection();
  const db = await createClient();
  const [sources, runs, feeds, deals, groceries, evidence, needsReview, excluded, checked, candidates, timestamped, linkIndicated, gtinIndicated, sampleMetadata, importRuns] = await Promise.all([
    db.from("sources").select("id,name,source_type,status,health_status,sync_enabled,last_successful_sync_at,connector_key").order("name"),
    db.from("source_sync_runs").select("id,status,records_seen,records_accepted,records_rejected,started_at,finished_at,error_summary").order("started_at", { ascending: false }).limit(8),
    db.from("feed_import_records").select("*", { count: "exact", head: true }),
    db.from("published_deals").select("*", { count: "exact", head: true }).eq("status", "published"),
    db.from("grocery_prices").select("*", { count: "exact", head: true }),
    db.from("grocery_price_evidence").select("*", { count: "exact", head: true }),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "review").eq("review_decision", "pending"),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "excluded"),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("review_decision", "checked"),
    db.from("feed_import_records").select("id,merchant_id,merchant_product_id,awin_product_id,title,brand,category,price,currency,image_url,created_at,reasons,status,review_decision,metadata").eq("status", "review").eq("review_decision", "pending").gt("price", 0).not("title", "is", null).order("created_at", { ascending: false }).limit(200),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "review").eq("review_decision", "pending").contains("metadata", { source_update_present: true }),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "review").eq("review_decision", "pending").contains("metadata", { tracking_link_present: true }),
    db.from("feed_import_records").select("*", { count: "exact", head: true }).eq("status", "review").eq("review_decision", "pending").contains("metadata", { gtin_present: true }),
    db.from("feed_import_records").select("metadata").eq("status", "review").eq("review_decision", "pending").limit(100),
    db.from("feed_import_runs").select("id,merchant_name,merchant_id,filename,total_count,review_count,excluded_count,status,permission_status,created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const counts: { label: string; result: CountResult; note: string }[] = [
    { label: "Feed import records", result: feeds, note: "Imported records are not automatically approved offers" },
    { label: "Published deal records", result: deals, note: "Publication alone does not confirm current price or availability" },
    { label: "Grocery prices", result: groceries, note: "Requires retailer-backed price evidence before comparison" },
    { label: "Grocery evidence", result: evidence, note: "Evidence entries are separate from published grocery prices" },
    { label: "Feed records awaiting review", result: needsReview, note: "Not approved for publication" },
    { label: "Excluded feed records", result: excluded, note: "Held out of the review-to-publication path" },
    { label: "Feed records checked", result: checked, note: "Reviewed does not automatically mean published" },
    { label: "Source update indicated", result: timestamped, note: "Pending records whose metadata indicates a source update; not live verification" },
    { label: "Tracking link indicated", result: linkIndicated, note: "Presence is not a successful retailer HTTP check" },
    { label: "GTIN indicated", result: gtinIndicated, note: "Identifier presence is not product-match verification" },
  ];
  // Page through the pending feed, preserving imported rows and avoiding false unique counts.
  const allCandidates: Candidate[] = (candidates.data ?? []) as Candidate[];
  let candidateError: string | null = candidates.error?.message ?? null;
  let cursor = 200;
  let finalPage = allCandidates.length < 200;
  while (!candidateError && !finalPage && cursor < 5000) {
    const batch = await db.from("feed_import_records")
      .select("id,merchant_id,merchant_product_id,awin_product_id,title,brand,category,price,currency,image_url,created_at,reasons,status,review_decision,metadata")
      .eq("status", "review").eq("review_decision", "pending").gt("price", 0)
      .not("title", "is", null).order("created_at", { ascending: false })
      .range(cursor, cursor + 199);
    if (batch.error) { candidateError = batch.error.message; break; }
    const rows = (batch.data ?? []) as Candidate[];
    allCandidates.push(...rows);
    finalPage = rows.length < 200;
    cursor += 200;
  }
  const candidateRows = candidateError ? [] : allCandidates; 
  const queuePartial = !candidateError && !finalPage;
  const allUniqueCandidates = candidateRows.filter((row, i, rows) => {
    const id = row.merchant_product_id ?? row.awin_product_id;
    if (!id) return true;
    return rows.findIndex(other => other.merchant_id === row.merchant_id && (other.merchant_product_id ?? other.awin_product_id) === id) === i;
  });
  const uniqueCandidates = allUniqueCandidates.slice(0, 40);
  const repeatedKeys = new Map<string, number>();
  for (const row of candidateRows) {
    const productId = row.merchant_product_id ?? row.awin_product_id;
    if (productId) {
      const key = `${row.merchant_id ?? "unknown"}:${productId}`;
      repeatedKeys.set(key, (repeatedKeys.get(key) ?? 0) + 1);
    }
  }
  const flag = (row: Candidate) => {
    const issues: string[] = [];
    if (!row.image_url) issues.push("Image missing");
    if (!row.metadata?.tracking_link_present) issues.push("Tracking link not indicated");
    if (!row.metadata?.source_update_present) issues.push("No source update timestamp");
    if (!row.brand) issues.push("Brand missing");
    if (!row.category) issues.push("Category missing");
    if (!row.merchant_product_id && !row.awin_product_id) issues.push("Retailer product ID missing");
    const id = row.merchant_product_id ?? row.awin_product_id;
    if (id && (repeatedKeys.get(`${row.merchant_id ?? "unknown"}:${id}`) ?? 0) > 1) issues.push("Repeated product ID in sample");
    if (row.reasons?.length) issues.push(...row.reasons.slice(0, 2));
    return issues.length ? issues.join(", ") : "Manual URL, price and stock verification required";
  };
  const metadataRows = sampleMetadata.data ?? [];
  const sampleWithActualUrl = metadataRows.filter(x => x.metadata && typeof x.metadata === "object" && Object.entries(x.metadata).some(([key, value]) => /^(product_url|merchant_url|tracking_url|affiliate_url|url|link)$/i.test(key) && typeof value === "string" && /^https:\/\//i.test(value))).length;
  const errors = [importRuns.error?.message, sources.error?.message, runs.error?.message, candidateError, sampleMetadata.error?.message, ...counts.map(x => x.result.error?.message)].filter(Boolean);
  return <>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>Evidence before claims</p><h1>Live Data Monitor</h1><p className={styles.sub}>Read-only operational snapshot from the connected Supabase database. Nothing on this screen imports, approves, publishes or changes data.</p></div></div>
    {errors.length > 0 && <div className={styles.callout}><b>Some data could not be loaded.</b> Counts with access errors show Unavailable, not zero. Check permissions and logs.<ul>{errors.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    <div className={styles.metrics}>{counts.map(x=><div className={styles.metric} key={x.label}><span>{x.label}</span><strong>{x.result.error ? "Unavailable" : (x.result.count ?? 0).toLocaleString("en-GB")}</strong><small>{x.note}</small></div>)}</div>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Registered source health</h2><span>Current database status and last successful sync</span></div>{sources.data?.length ? <table className={styles.table}><thead><tr><th>Source</th><th>State</th><th>Health</th><th>Sync</th><th>Last success</th><th>Freshness</th></tr></thead><tbody>{(sources.data as Source[]).map(s=><tr key={s.id}><td><b>{s.name}</b><div>{s.connector_key ?? s.source_type}</div></td><td>{s.status}</td><td>{s.health_status ?? "Unknown"}</td><td>{s.sync_enabled ? "Enabled" : "Disabled"}</td><td>{fmt(s.last_successful_sync_at)}</td><td>{freshness(s.last_successful_sync_at)}</td></tr>)}</tbody></table> : <div className={styles.empty}>{sources.error ? "Source registry unavailable" : "No registered sources"}</div>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Recent pipeline execution</h2><span>Actual persisted runs, not simulated activity</span></div>{runs.data?.length ? <table className={styles.table}><thead><tr><th>Started</th><th>Status</th><th>Seen</th><th>Accepted</th><th>Rejected</th><th>Reason</th></tr></thead><tbody>{(runs.data as Run[]).map(r=><tr key={r.id}><td>{fmt(r.started_at)}</td><td>{r.status}</td><td>{r.records_seen ?? "—"}</td><td>{r.records_accepted ?? "—"}</td><td>{r.records_rejected ?? "—"}</td><td>{r.error_summary ?? "—"}</td></tr>)}</tbody></table> : <div className={styles.empty}>{runs.error ? "Run history unavailable" : "No runs recorded"}</div>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Potential review candidates</h2><span>Up to 40 unique pending products</span></div><p className={styles.sub}>Screening only. The monitor reads up to 5,000 pending records and deduplicates by merchant and product identifier. Beyond that cap, this is a partial view. {queuePartial ? "Limit reached: more records may exist." : `Scanned ${candidateRows.length} matching records, finding ${allUniqueCandidates.length} distinct merchant products.`} This is a shortlist for human investigation, not a verified deal ranking. A feed-level tracking-link flag is not a validated URL. Price and merchant evidence, live URL, stock and rights must still be checked.</p>{!candidateError && uniqueCandidates.length ? <table className={styles.table}><thead><tr><th>Imported product</th><th>Recorded price</th><th>Category</th><th>Link indicator</th><th>Screening flags</th><th>Imported</th></tr></thead><tbody>{uniqueCandidates.map(r=><tr key={r.id}><td><b>{r.title}</b><div>{r.brand ?? "Brand unknown"}</div></td><td>{r.currency ?? "?"} {Number(r.price).toFixed(2)}</td><td>{r.category ?? "Unclassified"}</td><td>{r.metadata?.tracking_link_present ? "Present in feed" : "Not indicated"}</td><td>{flag(r)}</td><td>{fmt(r.created_at)}</td></tr>)}</tbody></table> : <div className={styles.empty}>{candidateError ? "Candidate list unavailable" : "No matching candidates"}</div>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Merchant import lineage</h2><span>Latest 10 preserved source batches</span></div><p className={styles.sub}>These are import batches, not distinct offers. Re-imports may repeat the same merchant products. Permission status must be verified before public use.</p>{importRuns.data?.length ? <table className={styles.table}><thead><tr><th>Merchant</th><th>Source file</th><th>Records</th><th>Review</th><th>Excluded</th><th>Permission</th><th>Imported</th></tr></thead><tbody>{importRuns.data.map(r=><tr key={r.id}><td><b>{r.merchant_name ?? r.merchant_id}</b></td><td>{r.filename ?? "Unknown"}</td><td>{r.total_count ?? 0}</td><td>{r.review_count ?? 0}</td><td>{r.excluded_count ?? 0}</td><td>{r.permission_status ?? "Unverified"}</td><td>{fmt(r.created_at)}</td></tr>)}</tbody></table> : <div className={styles.empty}>{importRuns.error ? "Import lineage unavailable" : "No imports recorded"}</div>}</section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>URL evidence audit</h2><span>Sample of up to 100 pending feed records</span></div><p className={styles.sub}>An import flag saying a tracking link exists is not an actionable product URL. In the sampled metadata, {sampleMetadata.error ? "the audit is unavailable" : `${sampleWithActualUrl} of ${metadataRows.length} records include an explicit HTTPS URL under a recognised link field`}. This sample does not assess URLs stored elsewhere in the import pipeline. No URLs are fetched by this audit.</p></section>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Approved endpoint health</h2><span>On-demand connectivity only</span></div><EndpointHealthCheck /></section>
    <div className={styles.callout}><b>Safety note:</b> A source being configured or a row being published does not prove a live retail offer. Validate timestamps, source evidence, merchant terms and stock before promoting claims. <Link href="/control-centre/pipeline">View pipeline</Link> · <Link href="/control-centre/sources">View source controls</Link></div>
  </>;
}
