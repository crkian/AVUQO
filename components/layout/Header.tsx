"use client";

import Link from "next/link";
import { LogOut, Shield, Heart, ShoppingBasket, UserRound } from "lucide-react";
import MegaNav from "./MegaNav";
import MobileMenu from "./MobileMenu";
import MobileDock from "./MobileDock";
import {DEFAULT_NAVIGATION,parseNavigation} from "../../lib/content/navigation";
import {Search as SearchIcon} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Header() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
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

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
    <header className="header">
      <div className="shell nav avuqo-header-layout">
        <Link className="logo avuqo-identity" href="/" aria-label="AVUQO homepage"><img src="/branding/avuqo-reference-logo.svg" alt="AVUQO. Find what’s worth it." width="168" height="44" className="avuqo-identity-image"/></Link>

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
        <Suspense fallback={<nav className="primary-nav header-nav-fallback" id="avuqo-primary-nav" aria-label="Primary navigation">
          <Link href="/discover">Discover</Link><Link href="/sales">Deals &amp; Sales</Link>
          <Link href="/compare">Compare</Link><Link href="/groceries">Groceries</Link>
          <Link href="/categories">Categories</Link><Link href="/travel">Travel</Link>
          <Link href="/about">More</Link>
        </nav>}>
          <MegaNav navigation={navigation} ownerPreview={admin}/>
        </Suspense>
        <Suspense fallback={null}>
          <MobileMenu navigation={navigation} signedIn={!!email} ownerPreview={admin}/>
        </Suspense>

        <div className="header-actions">
        {!ready ? (
          <span className="signin auth-loading">...</span>
        ) : email ? (
          <div className="auth-menu">
            <Link href="/wishlist" title="My wishlist" aria-label="My wishlist"><Heart size={17}/></Link>
            <Link href="/basket" title="My comparison basket" aria-label="My comparison basket"><ShoppingBasket size={17}/></Link>
            {admin && (
              <Link className="control-centre-link" href="/control-centre" title="Private Control Centre">
                <Shield size={16} />
              </Link>
            )}
            <Link className="auth-email" href="/account" aria-label="My AVUQO">
              <UserRound size={19} aria-hidden="true"/><span>Account</span>
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
    <Suspense fallback={null}><MobileDock signedIn={!!email}/></Suspense>
    </>
  );
}
