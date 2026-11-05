"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import { ArrowRight, Bell, Bookmark, Heart, ListChecks, Scale, ShoppingBasket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { createClient } from "../../lib/supabase/client";
import styles from "./page.module.css";

const journeys = [
  { href: "/saved", label: "Saved", description: "Keep the things worth revisiting.", icon: Bookmark, tone: "rose" },
  { href: "/watches", label: "Watches", description: "Organise the products you keep an eye on.", icon: Bell, tone: "violet" },
  { href: "/lists", label: "Your lists", description: "Make space for gifts and household plans.", icon: ListChecks, tone: "amber" },
  { href: "/wishlist", label: "Wishlist", description: "Collect your favourite finds.", icon: Heart, tone: "rose" },
  { href: "/basket", label: "Comparison basket", description: "Bring useful choices together.", icon: ShoppingBasket, tone: "teal" },
  { href: "/reality-check", label: "Reality Check", description: "A little more clarity before you buy.", icon: Scale, tone: "blue" },
] as const;

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("GB");
  const [budget, setBudget] = useState("balanced");
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!active || !auth.user) return;
        setSignedIn(true);
        setEmail(auth.user.email ?? "");
        const { data: profile } = await supabase.from("profiles")
          .select("display_name,home_country,preferences")
          .eq("id", auth.user.id).maybeSingle();
        if (!active) return;
        setName(profile?.display_name ?? "");
        setCountry(profile?.home_country ?? "GB");
        const preferences = (profile?.preferences ?? {}) as Record<string, unknown>;
        if (typeof preferences.shoppingStyle === "string") setBudget(preferences.shoppingStyle);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [supabase]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/login?next=/account");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: auth.user.id,
      display_name: name || null,
      home_country: country,
      preferences: { shoppingStyle: budget },
    });
    setMessage(error ? error.message : "Your preferences have been saved.");
  }

  return <main className={styles.page}>
    <Header/>
    <section className={styles.hero}>
      <div className={`shell ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Your AVUQO</p>
          <h1>A little space for <em>what matters to you.</em></h1>
          <p>Keep your ideas close, plan the next purchase and make every choice at your own pace. Your personal shopping tools belong in one welcoming place.</p>
          <div className={styles.heroActions}>
            <Link href="/saved">Explore your saved items <ArrowRight size={17}/></Link>
            {!loading && !signedIn && <Link href="/login?next=/account" className={styles.secondaryAction}>Sign in to your space</Link>}
          </div>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <div className={styles.artCircle}/>
          <div className={styles.artMain}><Bookmark size={34}/><strong>The good things</strong><span>All in one place</span></div>
          <div className={styles.artSmall}><Heart size={27}/><span>Find what’s worth it.</span></div>
        </div>
      </div>
    </section>
    <section className={`shell ${styles.content}`}>
      <div className={styles.sectionIntro}>
        <p className={styles.kicker}>A thoughtful shopping space</p>
        <h2>All your useful tools, together.</h2>
        <p>Explore the features available now. Saved records and Watches are not a promise of automated alerts or verified savings.</p>
      </div>
      <div className={styles.links}>
        {journeys.map(({href,label,description,icon:Icon,tone}) =>
          <Link key={href} href={href} className={styles.toolCard} data-tone={tone}>
            <span className={styles.toolIcon}><Icon size={25} aria-hidden="true"/></span>
            <strong>{label}</strong><span>{description}</span>
            <span className={styles.toolArrow}>Explore <ArrowRight size={16} aria-hidden="true"/></span>
          </Link>
        )}
      </div>
    </section>
    <section className={`shell ${styles.preferencesSection}`} aria-labelledby="profile-heading">
      <article className={styles.card}>
        <p className={styles.kicker}>Your choices</p>
        <h2 id="profile-heading">Profile &amp; preferences</h2>
        <p>{loading ? "Checking your account…" : signedIn ? email : "Sign in to save your preferences across devices."}</p>
        <form className={styles.form} onSubmit={save}>
          <label>Display name
            <input value={name} onChange={event => setName(event.target.value)} disabled={!signedIn || loading} autoComplete="name"/>
          </label>
          <label>Home market
            <select value={country} onChange={event => setCountry(event.target.value)} disabled={!signedIn || loading}>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="IE">Ireland</option>
            </select>
          </label>
          <label>Shopping style
            <select value={budget} onChange={event => setBudget(event.target.value)} disabled={!signedIn || loading}>
              <option value="value-first">Value first</option>
              <option value="balanced">Balanced</option>
              <option value="premium">Premium when worth it</option>
            </select>
          </label>
          <button type="submit" disabled={!signedIn || loading}>Save preferences</button>
          {message && <span className={styles.message} role="status">{message}</span>}
        </form>
      </article>
      <aside className={styles.accountNote}>
        <p className={styles.kicker}>Made for a clearer choice</p>
        <h2>Preferences should be yours to control.</h2>
        <p>What you choose here is different from a temporary shopping mission. We won&apos;t claim to understand your tastes from imaginary activity or show made-up account statistics.</p>
        <Link href="/trust">Read our approach to trust <ArrowRight size={17}/></Link>
      </aside>
    </section>
    <Footer/>
  </main>;
}
