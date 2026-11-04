import { connection } from "next/server";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";



export default async function AwinPage({
  searchParams,
}: {
  searchParams: Promise<{ check?: string }>;
}) {
  await connection();
  await requireControlCentreAccess();
  const check = (await searchParams).check === "1";
  const token = process.env.AWIN_ACCESS_TOKEN;
  const publisher = process.env.AWIN_PUBLISHER_ID;
  let result = "Not checked";
  let programmes: Array<{ id: number; name: string }> = [];

  if (check) {
    if (!token || !publisher || !/^\d+$/.test(publisher)) {
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
            programmes = payload
              .filter((p) => typeof p?.id === "number" && typeof p?.name === "string")
              .slice(0, 100)
              .map((p) => ({ id: p.id, name: p.name.slice(0, 150) }));
            result = "Connected successfully";
          }
        }
      } catch {
        result = "Awin connection failed";
      }
    }
  }

  return (
    <section>
      <h1>Awin connection diagnostic</h1>
      <p>Private read-only test. No feeds, links or publishing are activated.</p>
      <a href="/control-centre/awin?check=1">Run connection check</a>
      <p role="status">{result}</p>
      <ul>{programmes.map((p) => <li key={p.id}>{p.name} (ID {p.id})</li>)}</ul>
    </section>
  );
}
