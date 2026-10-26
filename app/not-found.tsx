import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 32,
        background: "#f7f5ef",
        color: "#17142b",
      }}
    >
      <section style={{ textAlign: "center", maxWidth: 620 }}>
        <span
          style={{
            width: 58,
            height: 58,
            margin: "0 auto 22px",
            display: "grid",
            placeItems: "center",
            borderRadius: 18,
            color: "#fff",
            background: "linear-gradient(140deg,#5b35f5,#3478f6)",
            fontSize: 22,
            fontWeight: 950,
          }}
        >
          Q
        </span>

        <p
          style={{
            color: "#5b35f5",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          404
        </p>

        <h1 style={{ fontSize: 48, letterSpacing: "-.05em" }}>
          Nothing worth finding here.
        </h1>

        <p style={{ color: "#716d80", lineHeight: 1.7 }}>
          The page may have moved, expired or never existed.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            marginTop: 18,
            padding: "13px 18px",
            borderRadius: 13,
            color: "#fff",
            background: "linear-gradient(135deg,#5b35f5,#3478f6)",
            fontWeight: 850,
          }}
        >
          Back to AVUQO
        </Link>
      </section>
    </main>
  );
}
