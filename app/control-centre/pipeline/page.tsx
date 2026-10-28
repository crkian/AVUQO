import { connection } from "next/server";

import { connectorStatus } from "../../../lib/connectors/registry";
import { createClient } from "../../../lib/supabase/server";
import styles from "../control-centre.module.css";
import { runAwinPipeline, runDemoPipeline } from "./actions";

type PipelineRun = {
  id: string;
  status: string;
  records_seen: number | null;
  records_accepted: number | null;
  records_rejected: number | null;
  started_at: string | null;
  finished_at: string | null;
  error_summary: string | null;
  metrics: { connector?: string } | null;
  source: { name: string; connector_key: string | null } | null;
};
type PipelineEvent = { id: string; event_type: string; level: string; message: string; created_at: string | null };

export const instant = false;

function stamp(value: string | null) {
  return value ? new Date(value).toLocaleString("en-GB") : "—";
}

export default async function PipelinePage() {
  await connection();
  const supabase = await createClient();

  const [{ data: runs }, { count: queued }, { count: published }, { count: scored }, { data: events }] =
    await Promise.all([
      supabase
        .from("source_sync_runs")
        .select("id,status,records_seen,records_accepted,records_rejected,started_at,finished_at,error_summary,metrics,source:sources(name,connector_key)")
        .order("started_at", { ascending: false })
        .limit(10),
      supabase.from("source_ingestion_items").select("*", { count: "exact", head: true }).eq("status", "normalized"),
      supabase.from("published_deals").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("deal_scores").select("*", { count: "exact", head: true }),
      supabase
        .from("pipeline_events")
        .select("id,event_type,level,message,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const connectors = connectorStatus();
  const awin = connectors.find((item) => item.key === "awin");
  const backendReady = Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Deal Intelligence Pipeline</p>
          <h1>From source data to AVUQO value.</h1>
          <p className={styles.sub}>
            Ingest → normalise → match → record price history → score → publish → create promotion candidates.
            Commission is never part of AVUQO Score.
          </p>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}><span>Scored offers</span><strong>{scored ?? 0}</strong></div>
        <div className={styles.metric}><span>Live published deals</span><strong>{published ?? 0}</strong></div>
        <div className={styles.metric}><span>Awaiting processing</span><strong>{queued ?? 0}</strong></div>
        <div className={styles.metric}><span>Pipeline backend</span><strong>{backendReady ? "Ready" : "Missing"}</strong></div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Run the pipeline</h2>
            <span>Demo works immediately. Awin stays server-only and needs credentials.</span>
          </div>
        </div>

        <div className={styles.controlGrid}>
          <article className={styles.control}>
            <div className={styles.controlTop}>
              <div>
                <h3>AVUQO Demo Feed</h3>
                <p>Exercises real database ingestion, matching, history, scoring and publication using synthetic offers.</p>
              </div>
              <span className={`${styles.pill} ${styles.good}`}>Ready</span>
            </div>
            <form action={runDemoPipeline} className={styles.pipelineAction}>
              <button className={styles.primaryAction} disabled={!backendReady}>Run demo pipeline</button>
            </form>
          </article>

          <article className={styles.control}>
            <div className={styles.controlTop}>
              <div>
                <h3>Awin Enhanced Feed</h3>
                <p>Streams an approved advertiser feed through the same canonical AVUQO pipeline.</p>
              </div>
              <span className={`${styles.pill} ${awin?.configured ? styles.good : styles.warn}`}>
                {awin?.configured ? "Configured" : "Needs env"}
              </span>
            </div>
            <form action={runAwinPipeline} className={styles.pipelineAction}>
              <button className={styles.primaryAction} disabled={!backendReady || !awin?.configured}>Run Awin pipeline</button>
            </form>
          </article>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Latest source runs</h2>
          <span>Each run preserves its counts, outcome and metrics.</span>
        </div>
        {runs?.length ? (
          <table className={styles.table}>
            <thead><tr><th>Source</th><th>Status</th><th>Seen</th><th>Accepted</th><th>Rejected</th><th>Started</th><th>Finished</th></tr></thead>
            <tbody>
              {(runs as unknown as PipelineRun[]).map((run) => (
                <tr key={run.id}>
                  <td><b>{run.source?.name ?? run.metrics?.connector ?? "Source"}</b></td>
                  <td><span className={`${styles.pill} ${run.status === "completed" ? styles.good : run.status === "failed" ? styles.bad : styles.warn}`}>{run.status}</span></td>
                  <td>{run.records_seen}</td>
                  <td>{run.records_accepted}</td>
                  <td>{run.records_rejected}</td>
                  <td>{stamp(run.started_at)}</td>
                  <td>{stamp(run.finished_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className={styles.empty}>No pipeline runs yet. Run the demo feed to create the first real AVUQO data lineage.</div>}
      </section>

      <section className={`${styles.panel} ${styles.spacedPanel}`}>
        <div className={styles.panelHead}>
          <h2>Pipeline event stream</h2>
          <span>Recent processing evidence and failures.</span>
        </div>
        {events?.length ? (
          <div className={styles.eventList}>
            {(events as PipelineEvent[]).map((item) => (
              <div className={styles.eventRow} key={item.id}>
                <span className={`${styles.statusDot} ${item.level === "error" ? styles.dotBad : item.level === "warning" ? styles.dotWarn : styles.dotGood}`} />
                <div><b>{item.event_type.replaceAll("_", " ")}</b><p>{item.message}</p></div>
                <time>{stamp(item.created_at)}</time>
              </div>
            ))}
          </div>
        ) : <div className={styles.empty}>No pipeline events yet.</div>}
      </section>

      {!backendReady ? <div className={`${styles.callout} ${styles.spacedPanel}`}><b>Backend key required:</b> add a server-only SUPABASE_SECRET_KEY to .env.local before running ingestion. Never prefix it with NEXT_PUBLIC_.</div> : null}

      <div className={styles.callout}>
        <b>Safety boundary:</b> live source secrets never enter browser code. Automated ingestion obeys the source-ingestion and emergency-stop controls, while promotion remains review-first.
      </div>
    </>
  );
}
