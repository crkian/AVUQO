"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import { ArrowRight, Bell, Bookmark, Heart, ListChecks, Scale, ShoppingBasket, LayoutDashboard, SlidersHorizontal } from "lucide-react";
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

  const greeting = signedIn ? (name.trim() || email.split("@")[0] || "there") : "you";
  const avatarLetter = signedIn ? greeting.charAt(0).toUpperCase() : "A";

  return <main className={styles.page}>
    <Header/>
    <section className={styles.dashboardHero} aria-labelledby="my-avuqo-title">
      <div className={`shell ${styles.dashboardHeroInner}`}>
        <div className={styles.avatar} aria-hidden="true">{avatarLetter}</div>
        <div>
          <p className={styles.kicker}>Your personal shopping space</p>
          <h1 id="my-avuqo-title">My AVUQO</h1>
          <p>{loading ? "Opening your shopping space…" : signedIn ? `Welcome back, ${greeting}.` : "Welcome. Sign in to keep your shopping ideas together."}</p>
        </div>
      </div>
    </section>
    <div className={`shell ${styles.dashboardLayout}`}>
      <aside className={styles.sidebar}>
        <nav aria-label="My AVUQO sections">
          <Link className={styles.currentNav} href="/account" aria-current="page"><LayoutDashboard size={19} aria-hidden="true"/>Overview <ArrowRight size={17}/></Link>
          {journeys.map(({href,label,icon:Icon})=><Link key={href} href={href}><Icon size={19} aria-hidden="true"/>{label}<ArrowRight size={15}/></Link>)}
          <a href="#preferences"><SlidersHorizontal size={19} aria-hidden="true"/>Preferences <ArrowRight size={15}/></a>
        </nav>
      </aside>
      <div className={styles.dashboardMain}>
        <section className={styles.overviewPanel} aria-labelledby="account-overview">
          <div className={styles.panelHeading}>
            <div><p className={styles.kicker}>Your overview</p><h2 id="account-overview">The good things, all together.</h2></div>
          </div>
          <div className={styles.overviewGrid}>
            {journeys.slice(0,4).map(({href,label,description,icon:Icon,tone})=>
              <Link href={href} key={href} className={styles.overviewTile} data-tone={tone}>
                <Icon size={27} aria-hidden="true"/><strong>{label}</strong><small>{description}</small><span>Open <ArrowRight size={15}/></span>
              </Link>
            )}
          </div>
          <p className={styles.overviewNote}>These are shortcuts to your actual account tools. No invented counts, price alerts or spending estimates are shown.</p>
        </section>
        <section className={styles.activityPanel} aria-labelledby="continue-heading">
          <div className={styles.panelHeading}><div><p className={styles.kicker}>Pick up where you left off</p><h2 id="continue-heading">Ready when you are.</h2></div></div>
          <div className={styles.activityLinks}>
            <Link href="/groceries"><ShoppingBasket size={23} aria-hidden="true"/><span><strong>Plan the weekly shop</strong><small>Explore your supermarket basket</small></span><ArrowRight size={18} aria-hidden="true"/></Link>
            <Link href="/lists"><ListChecks size={23} aria-hidden="true"/><span><strong>Organise a shared list</strong><small>Bring household plans and gift ideas together</small></span><ArrowRight size={18} aria-hidden="true"/></Link>
            <Link href="/reality-check"><Scale size={23} aria-hidden="true"/><span><strong>Check the real value</strong><small>Make sense of price claims before deciding</small></span><ArrowRight size={18} aria-hidden="true"/></Link>
          </div>
        </section>
        <section className={styles.preferencePanel} id="preferences" aria-labelledby="profile-heading">
          <div className={styles.panelHeading}><div><p className={styles.kicker}>In your hands</p><h2 id="profile-heading">Profile &amp; preferences</h2><p>Control the information you choose to save.</p></div></div>
          <p className={styles.profileStatus}>{loading ? "Checking your account…" : signedIn ? email : "Sign in to save preferences across devices."}</p>
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
        </section>
      </div>
    </div>
    <Footer/>
  </main>;
}
