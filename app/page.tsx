import Link from "next/link";
import Image from "next/image";
import { LogIn, Bot, Settings, MessageSquare, Database } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="Discord AI Copilot"
              width={64}
              height={64}
              className="rounded-xl border border-border bg-surface p-2"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">Discord AI Copilot</h1>
            <p className="mt-2 text-text-muted">Admin Console</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-border bg-surface p-8 shadow-card">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-text">
              Manage Your AI Bot
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Configure instructions, control channels, and monitor conversation
              memory from one dashboard.
            </p>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 gap-3"></div>

          {/* Login Button */}
          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            <LogIn className="h-4 w-4" />
            Sign In to Dashboard
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          Secure admin access for authorized users only
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>Discord AI Copilot Admin Console</h1>
    </main>
  );
}
{
  /* Footer */
}
