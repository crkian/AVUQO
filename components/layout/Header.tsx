"use client";

import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Header() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);

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

        <nav aria-label="Primary navigation">
          <Link href="/shopping">Shopping</Link>
          <Link href="/travel">Travel</Link>
          <Link href="/home">Home</Link>
          <Link href="/tech">Tech</Link>
          <Link href="/pets">Pets</Link>
          <Link href="/christmas">Christmas</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/watches">Watches</Link>
        </nav>

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
