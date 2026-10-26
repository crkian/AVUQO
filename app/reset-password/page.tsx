"use client";

import { LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/layout/Header";
import { createClient } from "../../lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main>
      <Header />
      <section className="auth-page">
        <div className="auth-card">
          <span className="q-mark large auth-q">Q</span>
          <p className="kicker">Secure your account</p>
          <h1>Choose a new password.</h1>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>New password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label>
              <span>Confirm password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </label>

            {error && (
              <div className="auth-message auth-error">{error}</div>
            )}

            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
