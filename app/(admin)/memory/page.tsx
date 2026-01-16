"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Trash2, Sparkles, BookOpen, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBanner } from "@/app/(admin)/components/banners/StatusBanner";
import { EmptyState } from "@/app/(admin)/components/empty-states/EmptyState";
import { ConfirmDialog } from "@/app/(admin)/components/dialogs/ConfirmDialog";
import { memoryCopy } from "@/app/(admin)/constants/memory";
import { calculateTokenSavings } from "@/app/(admin)/hooks/useTokenSavings";
import { apiDelete, apiGet, toastHelpers } from "@/lib/api/client";

interface Summary {
  id: string;
  channel_id: string;
  server_id?: string;
  summary: string;
  message_count: number;
  updated_at: string;
  last_message_at?: string;
}

export default function MemoryPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingReset, setPendingReset] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const load = async (showFeedback = false) => {
    setLoading(true);
    const loadToast = showFeedback
      ? toastHelpers.loading("Loading memory data...")
      : null;
    try {
      const { data, error } = await apiGet<Summary[]>("/api/memory");
      if (data) {
        setLoadError(null);
        setSummaries(data || []);
        setLastSuccess(null);
        if (loadToast) {
          toastHelpers.success("Memory data updated", {
            id: loadToast,
            duration: 1800,
          });
        }
      } else {
        const message =
          error || "Could not load memory data. Please try again.";
        setLoadError(message);
        toastHelpers.error(message, {
          id: loadToast ?? undefined,
        });
      }
    } catch (error) {
      const message = "Could not load memory data. Please try again.";
      setLoadError(message);
      toastHelpers.error(message, {
          id: loadToast ?? undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, []);

  const totals = useMemo(() => {
    const totalMessages = summaries.reduce(
      (sum, summary) => sum + summary.message_count,
      0
    );
    const totalChannels = summaries.length;
    const avgTokensSaved = summaries.length
      ? Math.round(
          summaries
            .map(
              (summary) =>
                calculateTokenSavings(
                  summary.message_count,
                  summary.summary.length
                ).savings
            )
            .reduce((sum, value) => sum + value, 0) / summaries.length
        )
      : 0;

    return { totalMessages, totalChannels, avgTokensSaved };
  }, [summaries]);

  const onResetMemory = async () => {
    if (!pendingReset) return;

    setSaving(true);
    const resetToast = toastHelpers.loading("Resetting memory...");
    try {
      const { error } = await apiDelete(
        `/api/memory?channelId=${pendingReset.channel_id}`
      );
      if (!error) {
        await load();
        toastHelpers.success(`Memory cleared for ${pendingReset.channel_id}`, {
          id: resetToast,
        });
        setLastSuccess(`Memory cleared for ${pendingReset.channel_id}`);
      } else {
        toastHelpers.error("Could not reset memory. Please try again.", {
          id: resetToast,
        });
      }
    } catch (error) {
      toastHelpers.error("Could not reset memory. Please try again.", {
        id: resetToast,
      });
    } finally {
      setSaving(false);
      setPendingReset(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-text">Conversation Memory</h1>
          <p className="text-text-muted">
            View rolling summaries for each channel. Summaries are generated
            every 10 messages.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-success bg-surfaceMuted px-3 py-1 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            {memoryCopy.activeBadge}
          </div>
          {loadError && (
            <StatusBanner
              tone="error"
              message={loadError}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => load(true)}
                >
                  Retry
                </Button>
              }
            />
          )}
          {lastSuccess && (
            <StatusBanner
              tone="success"
              message={lastSuccess}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-700"
                  onClick={() => setLastSuccess(null)}
                >
                  Dismiss
                </Button>
              }
            />
          )}
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => load(true)}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-medium text-text-muted">Active Channels</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-text">
            <Sparkles className="h-6 w-6 text-primary" />
            {totals.totalChannels}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-medium text-text-muted">Total Messages</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-text">
            <BookOpen className="h-6 w-6 text-primary" />
            {totals.totalMessages}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-medium text-text-muted">
            Avg. Token Savings
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-green-600">
            <Gauge className="h-5 w-5" />
            {totals.avgTokensSaved}%
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface shadow-card">
        <div className="border-b border-border bg-surfaceMuted px-6 py-4">
          <h2 className="text-lg font-semibold text-text">Channel Summaries</h2>
          <p className="text-sm text-text-muted">
            Read-only view of AI memory for transparency.
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <EmptyState
              icon={<Gauge className="h-5 w-5 text-primary" />}
              title={memoryCopy.emptyTitle}
              description={memoryCopy.emptyDescription}
              primaryAction={
                <Link href="/channels">
                  <Button variant="primary" size="sm">
                    Open Channels
                  </Button>
                </Link>
              }
              secondaryAction={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => load(true)}
                  disabled={loading}
                >
                  Refresh
                </Button>
              }
            />
          ) : (
            <ul className="space-y-4">
              {summaries.map((summary) => {
                const { fullHistoryTokens, summaryTokens, savings } =
                  calculateTokenSavings(
                    summary.message_count,
                    summary.summary.length
                  );
                const nextSummary =
                  Math.ceil((summary.message_count + 1) / 10) * 10;
                const messagesUntilNext = Math.max(
                  nextSummary - summary.message_count,
                  0
                );

                return (
                  <li
                    key={summary.id}
                    className="rounded-lg border border-border bg-surfaceMuted p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-text">
                            Channel ID: {summary.channel_id}
                          </h3>
                          {summary.server_id && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Server: {summary.server_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-text">
                              Messages:
                            </span>
                            <span className="font-semibold text-text">
                              {summary.message_count}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-text">
                              Next summary:
                            </span>
                            <span className="font-semibold text-primary">
                              {messagesUntilNext || 10} messages away
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-text">
                              Updated:
                            </span>
                            <span>
                              {new Date(summary.updated_at).toLocaleString()}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-success bg-surface px-2 py-1 text-xs">
                          <span className="font-medium text-success">
                            Token efficiency:
                          </span>
                          <span className="font-bold text-success">
                            {savings}% saved
                          </span>
                          <span className="text-text-muted">
                            ({fullHistoryTokens} → {summaryTokens} tokens)
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setPendingReset(summary)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                        Reset Memory
                      </Button>
                    </div>

                    <div className="mt-4 rounded-md border border-border bg-surface p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Rolling Summary
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                        {summary.summary}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">
                        {summary.summary.length} characters ~
                        {Math.ceil(summary.summary.length / 4)} tokens
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surfaceMuted p-4">
        <h3 className="text-sm font-semibold text-accent">How Memory Works</h3>
        <ul className="mt-2 space-y-1 text-xs text-text-muted">
          <li>- Summaries are generated every 10 messages (10, 20, 30...)</li>
          <li>
            - Rolling summaries replace full chat history to save ~95% of tokens
          </li>
          <li>- The bot uses summaries to maintain context across restarts</li>
          <li>
            - Reset clears the summary and message count for a fresh start
          </li>
        </ul>
      </div>

      <ConfirmDialog
        open={!!pendingReset}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setPendingReset(null);
          }
        }}
        title="Reset channel memory?"
        description={memoryCopy.resetDescription(pendingReset?.channel_id)}
        confirmLabel="Reset"
        onConfirm={onResetMemory}
        confirmLoading={saving}
      />
    </div>
  );
}
