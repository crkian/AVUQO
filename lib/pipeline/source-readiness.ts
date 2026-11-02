/** Fail-closed rights assessment, independent of dashboard labels and registry toggles. */
export type ExternalSource = {
  status: string;
  sync_enabled: boolean;
  credential_status: string | null;
  source_type?: string | null;
  connector_key: string | null;
  metadata: unknown;
};

type EvidenceContext = { advertiserId?: string; connectorConfigured?: boolean; now?: number };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}
const ref = (value: unknown): boolean => typeof value === "string" && value.trim().length >= 5;
const future = (value: unknown, now: number): boolean =>
  typeof value === "string" && value.trim().length > 0 &&
  Number.isFinite(Date.parse(value)) && Date.parse(value) > now;

export function sourceEvidenceFailures(source: ExternalSource, context: EvidenceContext = {}): string[] {
  const problems: string[] = [];
  const meta = record(source.metadata);
  const now = context.now ?? Date.now();
  if (!source.connector_key || source.connector_key === "demo" || source.source_type === "internal_test")
    problems.push("An external connector must be registered");
  if (source.credential_status !== "ready" || context.connectorConfigured === false)
    problems.push("Approved server credentials are not confirmed");
  if (meta.usage_rights_confirmed !== true || !ref(meta.rights_evidence_ref))
    problems.push("Documented source usage permission is missing");
  if (meta.feed_permission_confirmed !== true || !ref(meta.feed_evidence_ref))
    problems.push("Documented feed access permission is missing");
  if (!Array.isArray(meta.allowed_territories) || !meta.allowed_territories.includes("GB"))
    problems.push("GB usage territory is not confirmed");
  if (!future(meta.rights_valid_until, now))
    problems.push("Current rights expiry evidence is missing or expired");

  if (source.connector_key === "awin") {
    const id = context.advertiserId;
    const advertisers = Array.isArray(meta.awin_advertisers) ? meta.awin_advertisers : [];
    const match = advertisers.map(record).find(x => id && String(x.advertiser_id) === id);
    if (!id || !/^\d{2,12}$/.test(id) || !match ||
        match.feed_permission_confirmed !== true ||
        !ref(match.approval_evidence_ref) ||
        match.allowed_territory !== "GB" ||
        !future(match.valid_until, now)) {
      problems.push("Current advertiser-specific Awin approval and feed rights are missing");
    }
  }
  return problems;
}

/** Only evidence and owner activation may permit external ingestion. */
export function sourceIngestionFailures(source: ExternalSource, context: EvidenceContext = {}): string[] {
  const problems = sourceEvidenceFailures(source, context);
  if (source.status !== "active" || source.sync_enabled !== true)
    problems.unshift("Source is paused or synchronisation is disabled");
  return problems;
}

/** Require every critical row. A missing/error response must never enable ingestion/publishing. */
export function evaluateSourceControls(
  rows: Array<{ control_key: string; enabled: boolean }> | null | undefined,
  failed = false,
): { ingestion: boolean; publishing: boolean; emergencyStop: boolean } {
  if (failed || !rows) return { ingestion: false, publishing: false, emergencyStop: true };
  const byKey = new Map(rows.map(row => [row.control_key, row.enabled]));
  const emergencyStop = byKey.get("global_emergency_stop") !== false;
  return {
    emergencyStop,
    ingestion: !emergencyStop && byKey.get("source_ingestion") === true,
    publishing: !emergencyStop && byKey.get("deal_publishing") === true,
  };
}
