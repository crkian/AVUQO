"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import Header from "../../components/layout/Header";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      setError(resetError.message);
      setBusy(false);
      return;
    }

    setMessage(
      "If an AVUQO account exists for that email, a password-reset link has been sent."
    );
    setBusy(false);
  }

  return (
    <main>
      <Header />
      <section className="auth-page">
        <div className="auth-card">
          <Link className="back-link" href="/login">
            <ArrowLeft size={17} />
            Back to sign in
          </Link>

          <span className="q-mark large auth-q">Q</span>
          <p className="kicker">Account recovery</p>
          <h1>Reset your password.</h1>
          <p className="auth-intro">
            Enter your account email and AVUQO will send a secure reset link.
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

            {error && (
              <div className="auth-message auth-error">{error}</div>
            )}

            {message && (
              <div className="auth-message auth-success">{message}</div>
            )}

            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
