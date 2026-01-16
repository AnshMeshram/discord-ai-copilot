import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-text md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
        <h1 className="mb-4 text-4xl font-bold md:text-6xl bg-gradient-to-r from-accent to-primary-dark bg-clip-text text-transparent">
          Discord AI Copilot
        </h1>
        <p className="mb-8 text-xl text-text-muted md:text-2xl">
          Admin Console
        </p>
        <div className="space-y-4 border-t border-border pt-8">
          <p className="text-lg text-text">
            Welcome! This is the admin console for managing your Discord AI
            Copilot.
          </p>
          <p className="mb-6 text-text-muted">
            Configure system instructions, manage channels, and control
            conversation memory.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            Log In
          </Link>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-text-muted">
            Phase 1: Project Setup Complete ✅
          </p>
        </div>
      </div>
    </main>
  );
}
