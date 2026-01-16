"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Hash,
  PlusCircle,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBanner } from "@/app/(admin)/components/banners/StatusBanner";
import { ConfirmDialog } from "@/app/(admin)/components/dialogs/ConfirmDialog";
import { EmptyState } from "@/app/(admin)/components/empty-states/EmptyState";
import { channelCopy } from "@/app/(admin)/constants/channels";
import { apiDelete, apiGet, apiPost, toastHelpers } from "@/lib/api/client";

interface Channel {
  id: string;
  channel_id: string;
  channel_name: string | null;
  added_at: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Channel | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const load = async (showFeedback = false) => {
    setLoading(true);
    const refreshToast = showFeedback
      ? toastHelpers.loading("Refreshing channels...")
      : null;
    try {
      const { data, error } = await apiGet<Channel[]>("/api/channels");
      if (data) {
        setLoadError(null);
        setLastSuccess(null);
        setChannels(data);
        if (refreshToast) {
          toastHelpers.success("Channels updated", {
            id: refreshToast,
            duration: 1800,
          });
        }
      } else {
        const message = error || "Could not load channels. Please try again.";
        setLoadError(message);
        toastHelpers.error(message, {
          id: refreshToast,
        });
      }
    } catch (error) {
      const message = "Could not load channels. Please try again.";
      setLoadError(message);
      toastHelpers.error(message, {
        id: refreshToast,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, []);

  const sortedChannels = useMemo(
    () =>
      [...channels].sort((a, b) =>
        (a.channel_name || a.channel_id).localeCompare(
          b.channel_name || b.channel_id
        )
      ),
    [channels]
  );

  const onAddChannel = async () => {
    if (!channelId.trim()) {
      toastHelpers.error("Channel ID is required");
      return;
    }

    const displayName = channelName.trim() || channelId.trim();
    const addToast = toastHelpers.loading("Adding channel...");
    setSaving(true);
    try {
      const { data, error } = await apiPost<Channel>("/api/channels", {
        channelId: channelId.trim(),
        channelName: channelName.trim() || null,
      });
      if (data) {
        toastHelpers.success(`Channel ${displayName} added successfully`, {
          id: addToast,
        });
        setLastSuccess(`Channel ${displayName} added successfully`);
        setChannelId("");
        setChannelName("");
        await load();
      } else {
        const message =
          error || "Could not add channel. Check the ID and try again.";
        toastHelpers.error(message, { id: addToast });
      }
    } catch (error) {
      toastHelpers.error("Network error. Please try again.", { id: addToast });
    } finally {
      setSaving(false);
    }
  };

  const onConfirmRemoval = async () => {
    if (!pendingRemoval) return;

    const removeToast = toastHelpers.loading("Removing channel...");
    setSaving(true);
    try {
      const { error } = await apiDelete(
        `/api/channels?id=${pendingRemoval.channel_id}`
      );
      if (error) {
        toastHelpers.error("Could not remove channel. Please try again.", {
          id: removeToast,
        });
      } else {
        await load();
        toastHelpers.success(
          `${pendingRemoval.channel_name || pendingRemoval.channel_id} removed`,
          { id: removeToast }
        );
        setLastSuccess(
          `${pendingRemoval.channel_name || pendingRemoval.channel_id} removed`
        );
      }
    } catch (error) {
      toastHelpers.error("Could not remove channel. Please try again.", {
        id: removeToast,
      });
    } finally {
      setSaving(false);
      setPendingRemoval(null);
    }
  };

  const isAddDisabled = !channelId.trim() || saving;
  const removalLabel =
    pendingRemoval?.channel_name || pendingRemoval?.channel_id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text">Allowed Channels</h1>
          <p className="mt-1 text-text-muted">
            Manage which Discord channels the bot can reply in.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-success bg-surfaceMuted px-3 py-1 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            {channelCopy.activeSettings}
          </div>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => load(true)}
          disabled={loading}
          className="hidden sm:inline-flex"
        >
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text">Add New Channel</h2>
        <p className="mt-1 text-xs text-text-muted">
          {channelCopy.addDescription}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr,2fr,auto]">
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="channel-id-input"
              value={channelId}
              onChange={(event) => setChannelId(event.target.value)}
              placeholder="Channel ID (required)"
              className="w-full rounded-lg border border-border bg-surface px-9 py-2.5 text-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              disabled={saving}
            />
          </div>
          <input
            value={channelName}
            onChange={(event) => setChannelName(event.target.value)}
            placeholder="Channel name (optional)"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            disabled={saving}
          />
          <Button
            onClick={onAddChannel}
            disabled={isAddDisabled}
            variant="primary"
            size="md"
            isLoading={saving}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Add Channel
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-surfaceMuted px-6 py-4">
          <h2 className="text-lg font-semibold text-text">
            Active Channels
            {!loading && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                ({sortedChannels.length})
              </span>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => load(true)}
            disabled={loading}
            className="sm:hidden"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="p-6">
          {loadError && (
            <StatusBanner
              tone="error"
              message={loadError}
              className="mb-4"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => load(true)}
                  disabled={loading}
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
              className="mb-4"
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
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedChannels.length === 0 ? (
            <EmptyState
              icon={<Hash className="h-4 w-4 text-primary" />}
              title="No allowed channels"
              description={channelCopy.emptyDescription}
              primaryAction={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("channel-id-input");
                    if (el) el.focus();
                  }}
                >
                  Add first channel
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {sortedChannels.map((channel, index) => (
                <motion.li
                  key={channel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition hover:border-accent hover:shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-surfaceMuted px-2 py-0.5 text-xs font-medium text-accent">
                        <Hash className="h-3 w-3" />
                        {channel.channel_id}
                      </span>
                      {channel.channel_name && (
                        <span className="rounded-full bg-surfaceMuted px-2 py-0.5 text-xs font-medium text-text">
                          {channel.channel_name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Added {new Date(channel.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingRemoval(channel)}
                    disabled={saving}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {sortedChannels.length > 0 && (
        <div className="rounded-lg border border-border bg-surfaceMuted p-4">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-surface p-2 text-accent">
              <AlertCircle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-accent">
                Channel Permissions
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                The bot will only respond in the channels listed above.
                Double-check that it can read and send messages before going
                live.
              </p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingRemoval}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setPendingRemoval(null);
          }
        }}
        title="Remove channel?"
        description={
          <span>
            The bot will stop responding in{" "}
            <span className="font-semibold text-text">
              {removalLabel || "this channel"}
            </span>
            . This action cannot be undone.
          </span>
        }
        confirmLabel="Remove"
        onConfirm={onConfirmRemoval}
        confirmLoading={saving}
      />
    </div>
  );
}
