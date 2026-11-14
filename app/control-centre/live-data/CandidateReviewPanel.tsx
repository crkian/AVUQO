import {createClient} from "../../../lib/supabase/server";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import styles from "../control-centre.module.css";

// This bounded private scan is deliberately isolated from the faster monitor cards.
// It never approves, updates or publishes merchant products.
type Candidate = { metadata: { tracking_link_present?: boolean; source_update_present?: boolean; gtin_present?: boolean } | null; merchant_id: string | null; merchant_product_id: string | null; awin_product_id: string | null; id: string; title: string | null; brand: string | null; category: string | null; price: number | null; currency: string | null; image_url: string | null; created_at: string; reasons: string[] | null; status: string; review_decision: string | null };

const fmt = (value: string | null) => value ? new Date(value).toLocaleString("en-GB") : "Never";

export default async function CandidateReviewPanel({
 restrictedMerchantIds,permissionsUnavailable
}:{restrictedMerchantIds:string[];permissionsUnavailable:boolean}){
 // Defence in depth: never stream candidate data if the panel is reused.
 await requireControlCentreAccess();
 const db=await createClient();
 const candidates=await db.from("feed_import_records").select("id,merchant_id,merchant_product_id,awin_product_id,title,brand,category,price,currency,image_url,created_at,reasons,status,review_decision,metadata").eq("status", "review").eq("review_decision", "pending").gt("price", 0).not("title", "is", null).order("created_at", { ascending: false }).limit(200);
 const restrictedMerchants=new Set(restrictedMerchantIds);
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
  const restrictedCandidates = allUniqueCandidates.filter(r => r.merchant_id && restrictedMerchants.has(r.merchant_id)).length;
 return <>
  {candidateError && <div role="alert" className={styles.callout}><b>Candidate review unavailable.</b> The private scan failed; do not interpret missing rows as an empty queue. Check owner access and database logs.</div>}
    <div className={styles.callout}><b>Publication permission gate:</b> {candidateError || permissionsUnavailable
      ? "Private candidate or recent merchant-permission data is unavailable. No approval can be inferred."
      : `${restrictedCandidates} of ${allUniqueCandidates.length} distinct scanned candidates belong to merchants whose recent import permission is not marked verified.`} These remain private research candidates and must not be automatically published. Permission checks here cover the latest 10 import batches, not all historic batches.</div>
    <section className={styles.panel}><div className={styles.panelHead}><h2>Potential review candidates</h2><span>Up to 40 unique pending products</span></div><p className={styles.sub}>Screening only. The monitor reads up to 5,000 pending records and deduplicates by merchant and product identifier. Beyond that cap, this is a partial view. {candidateError ? "The scan could not complete; candidate counts are unavailable." : queuePartial ? "Limit reached: more records may exist." : `Scanned ${candidateRows.length} matching records, finding ${allUniqueCandidates.length} distinct merchant products.`} This is a shortlist for human investigation, not a verified deal ranking. A feed-level tracking-link flag is not a validated URL. Price and merchant evidence, live URL, stock and rights must still be checked.</p>{!candidateError && uniqueCandidates.length ? <table className={styles.table}><thead><tr><th>Imported product</th><th>Recorded price</th><th>Category</th><th>Permission</th><th>Link indicator</th><th>Screening flags</th><th>Imported</th></tr></thead><tbody>{uniqueCandidates.map(r=><tr key={r.id}><td><b>{r.title}</b><div>{r.brand ?? "Brand unknown"}</div></td><td>{r.currency ?? "?"} {Number(r.price).toFixed(2)}</td><td>{r.category ?? "Unclassified"}</td><td>{permissionsUnavailable ? "Not confirmed: lineage unavailable" : r.merchant_id && restrictedMerchants.has(r.merchant_id) ? "Blocked: unverified" : "Not confirmed"}</td><td>{r.metadata?.tracking_link_present ? "Present in feed" : "Not indicated"}</td><td>{flag(r)}</td><td>{fmt(r.created_at)}</td></tr>)}</tbody></table> : <div className={styles.empty}>{candidateError ? "Candidate list unavailable" : "No matching candidates"}</div>}</section>

 </>;
}
