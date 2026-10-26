import type { ReactNode } from "react";

import Header from "../layout/Header";
import Footer from "../layout/Footer";
import styles from "./LegalPage.module.css";

export default function LegalPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className="shell">
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className={styles.intro}>{intro}</p>
        </div>
      </section>

      <article className={styles.content}>
        {children}
      </article>

      <Footer />
    </main>
  );
}

export { styles };
