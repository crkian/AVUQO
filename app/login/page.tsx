"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/layout/Header";
import { createClient } from "../../lib/supabase/client";

function currentDestination() {
  if (typeof window === "undefined") return "/watches";

  const value = new URLSearchParams(window.location.search).get("next");

  return value &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/watches";
}

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");

    if (authError) {
      const timer = window.setTimeout(() => {
        setError("That authentication link could not be completed. Please try again.");
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        setBusy(false);
        return;
      }

      router.push(currentDestination());
      router.refresh();
      return;
    }

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      router.push(currentDestination());
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your AVUQO account, then sign in."
    );
    setBusy(false);
  }

  return (
    <main>
      <Header />
      <section className="auth-page">
        <div className="auth-card">
          <Link className="back-link" href="/">
            <ArrowLeft size={17} />
            Back to AVUQO
          </Link>

          <span className="q-mark large auth-q">Q</span>
          <p className="kicker">Your AVUQO</p>

          <h1>
            {mode === "signin"
              ? "Welcome back."
              : "Create your account."}
          </h1>

          <p className="auth-intro">
            Save Watches, build shared lists and let AVUQO learn what is
            worth your attention.
          </p>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Email</span>
              <div className="auth-input-wrap">
                <Mail size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    mode === "signin"
                      ? "current-password"
                      : "new-password"
                  }
                  placeholder="At least 8 characters"
                />
              </div>
            </label>

            {error && (
              <div className="auth-message auth-error">{error}</div>
            )}

            {message && (
              <div className="auth-message auth-success">{message}</div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Working..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          {mode === "signin" && (
            <Link
              className="auth-switch"
              href="/forgot-password"
            >
              Forgot your password?
            </Link>
          )}

          <button
            className="auth-switch"
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "signin"
              ? "New to AVUQO? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
}
