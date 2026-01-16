import {
  getAllowedChannels,
  getSystemInstructions,
} from "@/lib/supabase/queries";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Discord AI Copilot",
};

// Always fetch fresh setup data
export const revalidate = 0;

export default async function DashboardPage() {
  const [channels, instructions] = await Promise.all([
    getAllowedChannels(),
    getSystemInstructions(),
  ]);

  const hasChannels = channels.length > 0;
  const hasInstructions = instructions.text.length > 0;

  return (
    <div className="mx-auto space-y-6 px-4 pb-10 text-text sm:px-6 lg:max-w-6xl lg:px-8">
      {/* Header with status */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-muted">Overview</p>
          <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-sm text-text-muted">
            Track setup state, instructions, and memory health at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold">
          <span
            className={
              hasChannels && hasInstructions
                ? "h-2 w-2 rounded-full bg-green-500"
                : "h-2 w-2 rounded-full bg-amber-500"
            }
          />
          <span className="text-text">
            {hasChannels && hasInstructions ? "Ready to use" : "Pending setup"}
          </span>
        </div>
      </div>

      {/* Setup checklist (only show if incomplete) */}
      {(!hasChannels || !hasInstructions) && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="text-sm font-semibold text-text">Complete setup</h3>
          <p className="mt-1 text-sm text-text-muted">
            Finish these items to go live with confidence.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-text">
            {!hasInstructions && (
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <Link
                  href="/instructions"
                  className="font-medium text-text hover:text-primary"
                >
                  Add system instructions
                </Link>
              </li>
            )}
            {!hasChannels && (
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <Link
                  href="/channels"
                  className="font-medium text-text hover:text-primary"
                >
                  Add at least one Discord channel
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Allowed Channels"
          value={channels.length}
          icon="📡"
          subtext={
            channels.length === 0
              ? "Add channels to get started"
              : `Bot active in ${channels.length} ${
                  channels.length === 1 ? "channel" : "channels"
                }`
          }
          action={
            <Link
              href="/channels"
              className="text-xs font-medium text-primary hover:text-primary-strong"
            >
              Manage →
            </Link>
          }
        />
        <StatCard
          label="System Instructions"
          value={
            instructions.text.length > 0
              ? `${instructions.text.length} chars`
              : "Not set"
          }
          icon="📝"
          subtext={
            instructions.text.length > 0
              ? `${Math.round(instructions.text.length / 4)} tokens approx`
              : "Define bot personality"
          }
          action={
            <Link
              href="/instructions"
              className="text-xs font-medium text-primary hover:text-primary-strong"
            >
              Edit →
            </Link>
          }
        />
        <StatCard
          label="Memory System"
          value="Active"
          icon="🧠"
          subtext="Phase 5: Rolling summaries"
          action={
            <Link
              href="/memory"
              className="text-xs font-medium text-primary hover:text-primary-strong"
            >
              View →
            </Link>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text">Quick Actions</h2>
        <p className="mt-1 text-sm text-text-muted">
          Common admin controls at your fingertips.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <QuickAction
            href="/instructions"
            title="Update Instructions"
            description="Refine how the bot responds"
          />
          <QuickAction
            href="/channels"
            title="Manage Channels"
            description="Add or remove bot access"
          />
          <QuickAction
            href="/memory"
            title="View Conversations"
            description="See AI memory summaries"
          />
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_BOT_INVITE_URL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <h3 className="text-sm font-semibold text-text group-hover:text-primary">
              Add Bot to Server
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              Invite the bot to your Discord server ↗
            </p>
          </a>
        </div>
      </div>

      {/* Instructions Preview (collapsible feel) */}
      {hasInstructions && (
        <details
          className="group rounded-xl border border-border bg-surface shadow-card"
          open
        >
          <summary className="cursor-pointer list-none px-6 py-4 transition hover:bg-surfaceElevated">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text">
                  Active Instructions
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  Click to <span className="group-open:hidden">expand</span>
                  <span className="hidden group-open:inline">collapse</span>
                </p>
              </div>
              <span className="text-text-muted transition group-open:rotate-180">
                ▼
              </span>
            </div>
          </summary>
          <div className="border-t border-border px-6 py-4">
            <div className="max-h-60 overflow-y-auto rounded-md bg-surfaceElevated p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                {instructions.text}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-text-muted">
                {instructions.text.split(/\s+/).length} words · Updated{" "}
                {new Date(
                  (instructions as any).updated_at || Date.now()
                ).toLocaleDateString()}
              </p>
              <Link
                href="/instructions"
                className="text-xs font-semibold text-primary hover:text-primary-strong"
              >
                Edit Instructions →
              </Link>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtext,
  action,
}: {
  label: string;
  value: string | number;
  icon: string;
  subtext: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-strong">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {label}
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold text-text">{value}</p>
          <p className="mt-1 text-xs text-text-muted">{subtext}</p>
        </div>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <h3 className="text-sm font-semibold text-text group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs text-text-muted">{description}</p>
    </Link>
  );
}
