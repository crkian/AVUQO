import Link from "next/link";
import { connection } from "next/server";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";

type JoinedProgramme = { id: number; name: string };

const PILOT_PROGRAMMES = [
  { id: 736, name: "Cadbury Gifts Direct" },
  { id: 77952, name: "Petlibro UK Affiliate Program" },
] as const;

export default async function AwinPage({
  searchParams,
}: {
  searchParams: Promise<{ check?: string }>;
}) {
  await connection();

  // Authorise the signed-in owner/admin before reading credentials or
  // making an authenticated call to Awin. This page never mutates provider or DB data.
  await requireControlCentreAccess();
  const check = (await searchParams).check === "1";

  let result = "Not checked";
  let programmes: JoinedProgramme[] = [];
  let joinedPilotIds: number[] = [];
  let returnedProgrammeCount: number | null = null;

  if (check) {
    const token = process.env.AWIN_ACCESS_TOKEN;
    const publisher = process.env.AWIN_PUBLISHER_ID;
    if (!token || !publisher || !/^\d{1,12}$/.test(publisher)) {
      result = "Missing server-side Awin configuration";
    } else {
      try {
        const response = await fetch(
          "https://api.awin.com/publishers/" + publisher + "/programmes?relationship=joined",
          {
            headers: { Authorization: "Bearer " + token, Accept: "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok) {
          result = "Connection unsuccessful (HTTP " + response.status + ")";
        } else {
          const payload: unknown = await response.json();
          if (!Array.isArray(payload)) {
            result = "Unexpected Awin response";
          } else {
            const valid: JoinedProgramme[] = payload
              .filter((p) => Number.isSafeInteger(p?.id) && p.id > 0 && typeof p?.name === "string")
              .map((p) => ({ id: p.id, name: p.name.slice(0, 150) }));
            returnedProgrammeCount = valid.length;
            joinedPilotIds = PILOT_PROGRAMMES.filter(p => valid.some(x => x.id === p.id)).map(p => p.id);
            programmes = valid.slice(0, 100);
            result = valid.length ? "Joined programmes retrieved" : "Connected, but no joined programmes returned";
          }
        }
      } catch {
        // Do not log provider response bodies, request headers or token.
        result = "Awin connection failed";
      }
    }
  }

  return (
    <section>
      <h1>Awin connection diagnostic</h1>
      <p>Private, owner/admin-only, read-only check. No feeds, links or publishing are activated.</p>
      <p><Link href="/control-centre/awin-advertisers">Return to Awin advertiser reviews</Link></p>
      <a href="/control-centre/awin?check=1">Run joined-programmes check</a>
      <p role="status">{result}</p>
      {check && returnedProgrammeCount !== null && (
        <>
          <p>Valid joined programmes returned: {returnedProgrammeCount}. Displaying up to 100.</p>
          <h2>First two AVUQO pilot advertisers</h2>
          <ul>
            {PILOT_PROGRAMMES.map(p => (
              <li key={p.id}>{p.name} (ID {p.id}): {joinedPilotIds.includes(p.id) ? "Found in joined programmes" : "Not found in this API response"}</li>
            ))}
          </ul>
          <h2>Joined programme IDs</h2>
          <ul>{programmes.map(p => <li key={p.id}>{p.name} (ID {p.id})</li>)}</ul>
          <p>Programme membership alone does not verify feed, price, image or republication rights.</p>
        </>
      )}
    </section>
  );
}
