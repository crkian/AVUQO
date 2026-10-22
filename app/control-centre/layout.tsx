import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";

import ControlCentreNav from "../../components/control-centre/ControlCentreNav";
import { requireControlCentreAccess } from "../../lib/auth/requireControlCentreAccess";
import styles from "./control-centre.module.css";

/**
 * The AVUQO Control Centre is private, authenticated, and backed by live
 * request-time Supabase data. Blocking request-time rendering is intentional.
 */
export const instant = false;

async function SecureControlCentre({
  children
}: {
  children: ReactNode;
}) {
  await connection();

  const { role } = await requireControlCentreAccess();

  return (
    <div className={styles.frame}>
      <header className={styles.top}>
        <div className={styles.topInner}>
          <Link className={styles.logo} href="/control-centre">
            <span className={styles.mark}>Q</span>
            <span>AVUQO</span>
          </Link>

          <span className={styles.private}>
            Private Control Centre · {role}
          </span>

          <Link className={styles.back} href="/">
            ← Consumer AVUQO
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        <ControlCentreNav />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

function ControlCentreLoading() {
  return (
    <div className={styles.loadingFrame}>
      <section className={styles.loadingCard}>
        <div className={styles.loadingMark}>Q</div>

        <p className={styles.eyebrow}>
          AVUQO Control Centre
        </p>

        <h1>Verifying access</h1>

        <p>
          Loading your private operational workspace.
        </p>
      </section>
    </div>
  );
}

export default function ControlCentreLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ControlCentreLoading />}>
      <SecureControlCentre>
        {children}
      </SecureControlCentre>
    </Suspense>
  );
}
