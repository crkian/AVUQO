import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="shell footer-content">
        <Link className="logo" href="/"><span className="q-mark">Q</span>AVUQO</Link>
        <div className="footer-links">
          <Link href="/score">How scoring works</Link>
          <Link href="/reality-check">Reality Check</Link>
          <Link href="/lists">Shared Lists</Link>
        </div>
        <span>Find what’s worth it.</span>
      </div>
    </footer>
  );
}
