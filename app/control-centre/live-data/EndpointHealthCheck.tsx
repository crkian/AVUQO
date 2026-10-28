"use client";

import { useState } from "react";
import { checkApprovedEndpoints, type EndpointResult } from "./actions";

export default function EndpointHealthCheck() {
  const [working, setWorking] = useState(false);
  const [results, setResults] = useState<EndpointResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setWorking(true);
    setError(null);
    try {
      setResults(await checkApprovedEndpoints());
    } catch {
      setError("The endpoint check could not be completed. Confirm admin access and server configuration.");
    } finally {
      setWorking(false);
    }
  }

  return <div>
    <p>Checks up to five operator-approved HTTPS endpoints using bounded HEAD requests. Redirects are not followed. This is a connectivity diagnostic, never evidence of a current price or stock.</p>
    <button type="button" onClick={run} disabled={working}>{working ? "Checking…" : "Check approved endpoints"}</button>
    {error && <p role="alert">{error}</p>}
    {results && (results.length ? <ul>{results.map((result, i) =>
      <li key={i}><b>{result.host}</b>: {result.outcome} {result.httpStatus ? `(HTTP ${result.httpStatus})` : ""}. {result.detail}. Checked {result.checkedAt}</li>
    )}</ul> : <p>No endpoints configured. An operator must set both AVUQO_HEALTHCHECK_URLS and AVUQO_HEALTHCHECK_HOSTS in server environment settings.</p>)}
  </div>;
}
