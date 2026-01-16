"use client";

import { ReactNode, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AppToaster } from "@/components/ui/toaster";
import { LogOut } from "lucide-react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
        isActive
          ? "bg-surfaceElevated text-text font-semibold border border-border"
          : "text-text-muted hover:bg-surfaceElevated hover:text-text"
      )}
    >
      {children}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Prefetch core admin routes to make tab switching feel snappier.
  useEffect(() => {
    [
      "/dashboard",
      "/instructions",
      "/channels",
      "/memory",
      "/knowledge",
    ].forEach((path) => router.prefetch(path));
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 shrink-0 text-lg font-bold text-primary hover:text-primary-dark"
            >
              <Image
                src="/logo.svg"
                alt="Discord AI Copilot logo"
                width={36}
                height={36}
                className="rounded-md border border-border bg-surface"
                priority
              />
              <span className="transition group-hover:text-primary-dark">
                Discord AI
              </span>
            </Link>
            <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 shadow-card sm:flex">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/instructions">Instructions</NavLink>
              <NavLink href="/channels">Channels</NavLink>
              <NavLink href="/memory">Memory</NavLink>
              <NavLink href="/knowledge">Knowledge</NavLink>
            </nav>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border bg-surface px-4 py-2 sm:hidden">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/instructions">Instructions</NavLink>
          <NavLink href="/channels">Channels</NavLink>
          <NavLink href="/memory">Memory</NavLink>
          <NavLink href="/knowledge">Knowledge</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="animate-fade-in">{children}</div>
      </main>
      <AppToaster />
    </div>
  );
}
