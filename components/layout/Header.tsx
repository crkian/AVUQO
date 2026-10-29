"use client";

import Link from "next/link";
import { LogOut, Shield, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Header() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const user = data.user;
      setEmail(user?.email ?? null);
      setAdmin(false);

      if (user) {
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();
        if (mounted) setAdmin(role?.role === "admin" || role?.role === "owner");
      }
      if (mounted) setReady(true);
    }

    loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => loadUser());

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="header">
      <div className="shell nav">
        <Link className="logo" href="/">
          <span className="q-mark">Q</span>
          AVUQO
        </Link>

        <nav id="avuqo-primary-nav" className={`primary-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <Link href="/shopping" onClick={() => setMenuOpen(false)}>Shopping</Link>
          <Link href="/travel" onClick={() => setMenuOpen(false)}>Travel</Link>
          <Link href="/home" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/tech" onClick={() => setMenuOpen(false)}>Tech</Link>
          <Link href="/pets" onClick={() => setMenuOpen(false)}>Pets</Link>
          <Link href="/christmas" onClick={() => setMenuOpen(false)}>Christmas</Link>
          <Link href="/compare" onClick={() => setMenuOpen(false)}>Compare</Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link href="/watches" onClick={() => setMenuOpen(false)}>Watches</Link>
        </nav>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="avuqo-primary-nav" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>

        {!ready ? (
          <span className="signin auth-loading">...</span>
        ) : email ? (
          <div className="auth-menu">
            {admin && (
              <Link className="control-centre-link" href="/control-centre" title="Private Control Centre">
                <Shield size={16} />
              </Link>
            )}
            <Link className="auth-email" href="/account" title={email}>
              Account
            </Link>
            <button className="signout-button" type="button" onClick={signOut}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Link className="signin" href="/login">Sign in</Link>
        )}
      </div>
    </header>
  );
}
