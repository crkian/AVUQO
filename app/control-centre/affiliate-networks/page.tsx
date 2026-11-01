import Link from "next/link";
import { connection } from "next/server";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import { AFFILIATE_NETWORKS, AFFILIATE_PUBLICATION_GATES } from "../../../lib/affiliate-networks/catalogue";
import styles from "../control-centre.module.css";

export const instant = false;

type SourceRow = {
  id: string;
  name: string;
  status: string | null;
  credential_status: string | null;
  health_status: string | null;
  last_successful_sync_at: string | null;
};

function matchesSource(name: string, aliases: readonly string[]): boolean {
  const canonical = name.trim().toLocaleLowerCase("en-GB");
  return aliases.some((alias) => alias.toLocaleLowerCase("en-GB") === canonical);
}

export default async function AffiliateNetworksPage() {
  await connection();
  await requireControlCentreAccess();
  const db = await createClient();
  const { data, error } = await db
    .from("sources")
    .select("id,name,status,credential_status,health_status,last_successful_sync_at")
    .eq("source_type", "affiliate_network")
    .limit(200);
  const sources = (data ?? []) as SourceRow[];

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Affiliate expansion · private planning</p>
          <h1>Affiliate network readiness</h1>
          <p className={styles.sub}>
            Eight target networks, one AVUQO catalogue. This inventory does not create
            connections, grant advertiser permission, import products or enable publishing.
          </p>
        </div>
      </div>

      <div className={styles.callout}>
        <b>Fail closed:</b> A registered source, credential status or successful sync
        never proves approval to use product prices, images or links. All advertiser
        rights and live evidence require independent verification.
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Planned rollout</h2>
          <span>{AFFILIATE_NETWORKS.length} networks · publication off by default</span>
        </div>
        {error ? (
          <p role="alert">Source registry currently unavailable. No connection or approval status can be confirmed: {error.message}</p>
        ) : null}
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order &amp; network</th>
                <th>Code in main</th>
                <th>Private source registry</th>
                <th>Required integration work</th>
                <th>Provider links</th>
              </tr>
            </thead>
            <tbody>
              {AFFILIATE_NETWORKS.map((network) => {
                const source = error ? undefined : sources.find((row) => matchesSource(row.name, network.sourceAliases));
                return (
                  <tr key={network.id}>
                    <td><b>{network.order}. {network.name}</b><br/><small>{network.providerChecks}</small></td>
                    <td>{network.currentCode === "awin_adapter_exists" ? "Awin adapter exists; live access not verified" : "Adapter not built"}</td>
                    <td>
                      {error ? "Unavailable" : source ? (
                        <>Registry: {source.status ?? "unknown"}<br/>
                        <small>Credentials: {source.credential_status ?? "unknown"}; health: {source.health_status ?? "unknown"}</small><br/>
                        <small>Last reported success: {source.last_successful_sync_at ? new Date(source.last_successful_sync_at).toLocaleDateString("en-GB") : "none"}</small></>
                      ) : "No matching registered source"}
                    </td>
                    <td>{network.dataPlan}</td>
                    <td>
                      <a href={network.applicationUrl} target="_blank" rel="noopener noreferrer">Apply / provider</a>
                      <br/>
                      <a href={network.developerUrl} target="_blank" rel="noopener noreferrer">Technical documentation</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Mandatory review before any public offer</h2>
          <span>{AFFILIATE_PUBLICATION_GATES.length} evidence gates</span>
        </div>
        <ol style={{ display: "grid", gap: 9, lineHeight: 1.6, paddingLeft: 22 }}>
          {AFFILIATE_PUBLICATION_GATES.map((gate) => (
            <li key={gate}>{gate.replaceAll("_", " ")}</li>
          ))}
        </ol>
        <p>
          Register external sources as paused drafts in <Link href="/control-centre/source-readiness">Source approvals</Link>.
          Review existing imports in <Link href="/control-centre/feed-imports">Private feed imports</Link>.
          Monitor approved connections in <Link href="/control-centre/sources">Sources</Link>.
        </p>
        <p>Do not enter API keys on these pages. Use protected server secrets once each provider grants access.</p>
      </section>
    </>
  );
}
