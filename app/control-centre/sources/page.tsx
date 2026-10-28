import { connection } from "next/server";

import { createClient } from "../../../lib/supabase/server";
import { setSourceStatus } from "../actions";
import styles from "../control-centre.module.css";

type SourceRow = { id: string; name: string; source_type: string; status: string; reliability_score: number | null; connector_key: string | null; sync_enabled: boolean; credential_status: string | null; health_status: string | null; last_sync_at: string | null; last_successful_sync_at: string | null; metadata: unknown };

export const instant = false;

function stamp(value: string | null) {
  return value ? new Date(value).toLocaleString("en-GB") : "Never";
}

export default async function SourcesPage() {
  await connection();
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("sources")
    .select("id,name,source_type,status,reliability_score,connector_key,sync_enabled,credential_status,health_status,last_sync_at,last_successful_sync_at,metadata")
    .order("name");

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Universal Source Connector</p>
          <h1>Sources</h1>
          <p className={styles.sub}>
            One registry for affiliate networks, merchant feeds, travel sources and direct APIs. Secrets remain server-side; this surface controls whether a configured connector may actually run.
          </p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Connector registry</h2>
          <span>{rows?.length ?? 0} source definitions</span>
        </div>
        {rows?.length ? (
          <table className={styles.table}>
            <thead><tr><th>Source</th><th>Connector</th><th>Reliability</th><th>Health</th><th>Credentials</th><th>Last success</th><th>Control</th></tr></thead>
            <tbody>
              {(rows as SourceRow[]).map((row) => (
                <tr key={row.id}>
                  <td><b>{row.name}</b><br/><span>{row.source_type}</span></td>
                  <td>{row.connector_key ?? "custom"}</td>
                  <td>{Number(row.reliability_score).toFixed(0)}%</td>
                  <td><span className={`${styles.pill} ${row.health_status === "healthy" ? styles.good : row.health_status === "error" ? styles.bad : styles.warn}`}>{row.health_status}</span></td>
                  <td><span className={`${styles.pill} ${row.credential_status === "ready" ? styles.good : styles.warn}`}>{row.credential_status}</span></td>
                  <td>{stamp(row.last_successful_sync_at)}</td>
                  <td>
                    <div className={styles.actions}>
                      <form action={setSourceStatus.bind(null, row.id, row.status === "active" ? "paused" : "active")}>
                        <button>{row.status === "active" ? "Pause" : "Resume"}</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className={styles.empty}>No sources configured yet.</div>}
      </section>

      <div className={styles.callout}>
        <b>Connector-ready is not the same as connected.</b> AVUQO only runs a source when its server credentials exist, the registry row is active, sync is enabled and the global ingestion controls permit it.
      </div>
    </>
  );
}
