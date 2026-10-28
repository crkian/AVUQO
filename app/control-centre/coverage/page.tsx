import { connection } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import styles from "../control-centre.module.css";

export const instant = false;

const sectors = [
  { name: "Mobile & SIM", metric: "Contract total, data, roaming, annual rises", keys: [] as string[] },
  { name: "Broadband & fibre", metric: "Address, speeds, minimum term, total cost", keys: [] as string[] },
  { name: "Sky, TV & streaming", metric: "Channels, bundles, activation, term and fees", keys: [] as string[] },
  { name: "Energy & household bills", metric: "Usage, standing charges, tariffs and exit fees", keys: [] as string[] },
  { name: "Insurance", metric: "Coverage, excess, personalised regulated quotes", keys: [] as string[] },
  { name: "MOT & vehicle services", metric: "Garage location, scope, appointment and price", keys: [] as string[] },
  { name: "Motoring, tyres & leasing", metric: "Mileage, fees, term and total payable", keys: [] as string[] },
  { name: "Groceries", metric: "Exact packs, store prices and complete baskets", keys: [] as string[] },
  { name: "Retail & general shopping", metric: "Exact product, price, fees and stock", keys: ["awin", "cj", "impact", "ebay", "direct-feed"] },
  { name: "Travel & accommodation", metric: "Live dates, availability, taxes and inclusions", keys: ["booking", "skyscanner"] },
  { name: "Home & local services", metric: "Service scope, area, provider and full price", keys: [] as string[] },
  { name: "Finance", metric: "Fees, personalised terms and regulated disclosure", keys: [] as string[] },
];
type Source = { connector_key: string | null; name: string; status: string; sync_enabled: boolean; credential_status: string | null; last_successful_sync_at: string | null };
export default async function CoveragePage() {
  await connection();
  const db = await createClient();
  const { data, error } = await db.from("sources")
    .select("connector_key,name,status,sync_enabled,credential_status,last_successful_sync_at");
  const sources = (data ?? []) as Source[];
  return <>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>Universal Comparison Engine</p><h1>Coverage & Connections</h1><p className={styles.sub}>A truthful map of every AVUQO comparison vertical. Planned categories are not live data integrations. A registered source is not a verified comparison feed.</p></div></div>
    {error && <div className={styles.callout}>Source registry cannot be read: {error.message}. All connections must be treated as unverified.</div>}
    <section className={styles.panel}><div className={styles.panelHead}><h2>Category coverage</h2><span>Real source readiness, not promotional claims</span></div>
    <table className={styles.table}><thead><tr><th>Category</th><th>Comparison basis</th><th>Registered integrations</th><th>Data status</th></tr></thead><tbody>
    {sectors.map(s => {
      const connected = sources.filter(x => x.connector_key && s.keys.includes(x.connector_key));
      const succeeded = connected.filter(x => x.last_successful_sync_at);
      return <tr key={s.name}><td><b>{s.name}</b></td><td>{s.metric}</td><td>{connected.length ? connected.map(x => x.name).join(", ") : "No source registered"}</td><td>{error ? "Unknown" : succeeded.length ? "Previous sync recorded; verify offer rights and freshness" : connected.length ? "Registered only; no successful sync" : "Not connected"}</td></tr>;
    })}
    </tbody></table></section>
    <div className={styles.callout}><b>Truth wall:</b> A healthcheck, API credential, or previous sync does not prove current offers or eligibility. Only licensed, evidence-backed, category-comparable data can advance to review and eventual publication. AKKO imports remain private until publication rights are verified.</div>
  </>;
}
