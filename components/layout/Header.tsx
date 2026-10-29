"use client";

import Link from "next/link";
import { LogOut, Shield, Menu, X } from "lucide-react";
import MegaNav from "./MegaNav";
import MobileDock from "./MobileDock";
import {DEFAULT_NAVIGATION,parseNavigation} from "../../lib/content/navigation";
import {Search as SearchIcon} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Header() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState(DEFAULT_NAVIGATION);
  useEffect(()=>{
    let active=true;
    const load=async()=>{
      const {data,error}=await supabase.from("site_content_published")
       .select("payload").eq("key","navigation").maybeSingle();
      if(active&&!error&&data)setNavigation(parseNavigation(data.payload));
    };
    void load();
    return ()=>{active=false};
  },[supabase]);

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

  useEffect(() => {
    if (!menuOpen) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
    <header className="header">
      <div className="shell nav avuqo-header-layout">
        <Link className="logo" href="/">
          <span className="q-mark">Q</span>
          AVUQO
        </Link>

        <form className="header-search" action="/search" method="get" role="search">
          <SearchIcon size={18} aria-hidden="true"/>
          <input type="search" name="q" aria-label="Search AVUQO"
            placeholder="Search products, guides, groceries..." maxLength={120}
            list="avuqo-search-suggestions"/>
          <datalist id="avuqo-search-suggestions">
            <option value="Groceries"/><option value="Technology"/><option value="Travel"/>
            <option value="Home"/><option value="Broadband"/>
          </datalist>
          <button type="submit" aria-label="Search">Search</button>
        </form>
        <MegaNav navigation={navigation} menuOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="avuqo-primary-nav" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>

        <div className="header-actions">
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
            <button className="signout-button" type="button" aria-label="Sign out" title="Sign out" onClick={signOut}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Link className="signin" href="/login">Sign in</Link>
        )}
        </div>
      </div>
    </header>
    <MobileDock signedIn={!!email}/>
    </>
  );
}
