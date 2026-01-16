"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="grid min-h-screen lg:grid-cols-5">
        <div className="relative hidden lg:block lg:col-span-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.28),transparent_32%)]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-[var(--text)]">
            <div className="text-sm text-[var(--text-muted)]">
              Discord AI Copilot
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-[var(--text)]">
                Sharper responses with trusted guardrails.
              </h1>
              <p className="text-[var(--text-muted)] text-base leading-relaxed">
                Manage allowed channels, system instructions, and rolling memory
                so your bot stays on-brand.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="h-px w-10 bg-[var(--border)]" />
              Production-ready admin controls for Discord AI.
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-card p-8 sm:p-10 transition hover:shadow-card-strong">
            <div className="space-y-2">
              <div className="text-sm font-medium text-primary">
                Welcome back
              </div>
              <h2 className="text-2xl font-semibold text-[var(--text)]">
                Sign in to dashboard
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Control channels, instructions, and memory summaries from one
                place.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-[var(--text)]"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium text-[var(--text)]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary transition hover:text-primary/80"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  placeholder="••••••••"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Use your admin credentials.
                </p>
              </div>

              {error && (
                <p
                  className="rounded-md border border-[color:var(--error)] bg-[color:rgba(220,38,38,0.08)] px-3 py-2 text-sm text-[var(--text)]"
                  role="status"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:opacity-60"
              >
                {loading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[var(--text-muted)] leading-relaxed">
              By signing in you agree to use the configured guardrails
              responsibly.
            </div>
            <div className="mt-4 text-center text-sm">
              <a
                href="/"
                className="text-primary transition hover:text-primary/80"
              >
                ← Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
