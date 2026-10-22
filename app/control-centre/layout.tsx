import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { requireControlCentreAccess } from "../../lib/auth/requireControlCentreAccess";

async function SecureControlCentre({
  children
}: {
  children: ReactNode;
}) {
  // The Control Centre is private, user-specific and reads request-time
  // authentication/database state. Tell Next.js explicitly that everything
  // below this point must render for the incoming request rather than during
  // build-time prerendering.
  await connection();

  await requireControlCentreAccess();

  return <>{children}</>;
}

function ControlCentreLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "#f8f6f2",
        color: "#17172a"
      }}
    >
      <section
        style={{
          width: "min(520px, 100%)",
          padding: "36px",
          border: "1px solid rgba(24,24,48,.08)",
          borderRadius: "26px",
          background: "#fff",
          textAlign: "center",
          boxShadow: "0 18px 60px rgba(29,26,56,.06)"
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 18px",
            display: "grid",
            placeItems: "center",
            borderRadius: "17px",
            color: "#fff",
            background: "linear-gradient(145deg,#6c3df4,#3478f6)",
            fontSize: 23,
            fontWeight: 950
          }}
        >
          Q
        </div>

        <p
          style={{
            margin: 0,
            color: "#6c3df4",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: ".1em",
            textTransform: "uppercase"
          }}
        >
          AVUQO Control Centre
        </p>

        <h1
          style={{
            margin: "10px 0 8px",
            fontSize: 28,
            letterSpacing: "-.04em"
          }}
        >
          Verifying access
        </h1>

        <p
          style={{
            margin: 0,
            color: "#706d7b",
            lineHeight: 1.55,
            fontSize: 13
          }}
        >
          Loading your private operational workspace.
        </p>
      </section>
    </main>
  );
}

export default function ControlCentreLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ControlCentreLoading />}>
      <SecureControlCentre>{children}</SecureControlCentre>
    </Suspense>
  );
}
