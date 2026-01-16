"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Settings2,
  Thermometer,
  ClipboardList,
  Save,
  Undo2,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBanner } from "@/app/(admin)/components/banners/StatusBanner";
import { EmptyState } from "@/app/(admin)/components/empty-states/EmptyState";
import { instructionsCopy } from "@/app/(admin)/constants/instructions";
import { apiGet, apiPut, toastHelpers } from "@/lib/api/client";

interface SettingsResponse {
  success: boolean;
  data?: {
    instructions: string;
    aiConfig: {
      model: string;
      temperature: number;
      provider: string;
    };
  };
  error?: string;
}

type MetricCard = {
  label: string;
  value: string;
  icon: ReactNode;
  subtext?: string;
};

function InfoCard({ label, value, icon, subtext }: MetricCard) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surfaceMuted text-text">
          {icon}
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-success bg-surfaceMuted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
          <span className="h-2 w-2 rounded-full bg-success" />
          {instructionsCopy.activeBadge}
        </span>
      </div>
      <div>
        <p className="mt-2 font-mono text-sm font-semibold text-text">
          {value}
        </p>
        {subtext && <p className="mt-1 text-xs text-text-muted">{subtext}</p>}
      </div>
    </div>
  );
}

export default function InstructionsPage() {
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState("");
  const [provider, setProvider] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialInstructions, setInitialInstructions] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = async (showFeedback = true) => {
    setLoading(true);
    const loadingToast = showFeedback
      ? toastHelpers.loading("Loading settings...")
      : null;
    try {
      const { data, error } = await apiGet<SettingsResponse["data"]>(
        "/api/settings"
      );
      if (data) {
        setLoadError(null);
        const inst = data.instructions;
        setInstructions(inst);
        setInitialInstructions(inst);
        setModel(data.aiConfig.model);
        setProvider(data.aiConfig.provider);
        setTemperature(data.aiConfig.temperature);
        if (loadingToast) {
          toastHelpers.success("Settings loaded", {
            id: loadingToast,
            duration: 1800,
          });
        }
      } else {
        const message = error || "Could not load settings. Please try again.";
        setLoadError(message);
        toastHelpers.error(message, {
          id: loadingToast || undefined,
        });
      }
    } catch (error) {
      const message = "Could not load settings. Please try again.";
      setLoadError(message);
      toastHelpers.error(message, { id: loadingToast || undefined });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    setHasChanges(instructions !== initialInstructions);
  }, [instructions, initialInstructions]);

  const onSave = async () => {
    if (!instructions.trim()) {
      toastHelpers.error("Instructions cannot be empty");
      return;
    }

    setSaving(true);
    const savingToast = toastHelpers.loading("Saving instructions...");
    try {
      const { error } = await apiPut<unknown>("/api/settings", {
        instructions: instructions.trim(),
      });
      if (!error) {
        const clean = instructions.trim();
        setInitialInstructions(clean);
        setInstructions(clean);
        setHasChanges(false);
        toastHelpers.success("Instructions saved successfully", {
          id: savingToast,
        });
      } else {
        const message =
          error || "Could not save instructions. Please try again.";
        toastHelpers.error(message, {
          id: savingToast,
        });
      }
    } catch (error) {
      toastHelpers.error("Network error. Please try again.", {
        id: savingToast,
      });
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setInstructions(initialInstructions);
    setHasChanges(false);
    toastHelpers.info("Changes discarded");
  };

  const applyTemplate = () => {
    const template =
      "You are a Discord copilot for our server. Be concise, warm, and professional.\n" +
      "Do: summarize when asked, provide actionable next steps, escalate sensitive topics.\n" +
      "Don't: invent data, share private info, or take destructive actions without confirmation.";
    setInstructions(template);
    setHasChanges(true);
    toastHelpers.success("Starter template loaded");
  };

  const wordCount = instructions.trim().split(/\s+/).filter(Boolean).length;
  const charCount = instructions.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  const metricCards = useMemo<MetricCard[]>(
    () => [
      {
        label: "Provider",
        value: provider || "gemini",
        icon: <Bot className="h-4 w-4 text-primary" />,
      },
      {
        label: "Model",
        value: model || "gemini-1.5-flash",
        icon: <Settings2 className="h-4 w-4 text-primary" />,
      },
      {
        label: "Temperature",
        value: temperature.toFixed(1),
        icon: <Thermometer className="h-4 w-4 text-primary" />,
        subtext: "Creativity level",
      },
    ],
    [provider, model, temperature]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">System Instructions</h1>
        <p className="mt-1 text-text-muted">
          Define how your AI bot responds to users.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:auto-rows-fr sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-3 sm:auto-rows-fr sm:grid-cols-3">
          {metricCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
            >
              <InfoCard {...card} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface shadow-card">
        <div className="border-b border-border bg-surfaceMuted px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text">
                Bot Instructions
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                {wordCount} words | {charCount} characters | ~{estimatedTokens}{" "}
                tokens
              </p>
            </div>
            {loadError && (
              <StatusBanner
                tone="error"
                message={loadError}
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void loadSettings()}
                  >
                    Retry
                  </Button>
                }
              />
            )}
            {hasChanges && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                <ClipboardList className="h-3.5 w-3.5" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : instructions.trim().length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-4 w-4" />}
              title={instructionsCopy.emptyTitle}
              description={
                <div className="space-y-1 text-left text-xs text-text-muted">
                  <p>
                    Define how the copilot should answer so replies follow your
                    tone and guardrails.
                  </p>
                  <p>Tips:</p>
                  {instructionsCopy.emptyTips.map((tip) => (
                    <p key={tip}>- {tip}</p>
                  ))}
                </div>
              }
              primaryAction={
                <Button variant="primary" size="sm" onClick={applyTemplate}>
                  Load starter template
                </Button>
              }
              secondaryAction={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInstructions("")}
                >
                  Start from scratch
                </Button>
              }
            />
          ) : (
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-[300px] w-full rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              placeholder="You are a helpful Discord assistant that..."
              disabled={saving}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={onSave}
                disabled={
                  saving || loading || !hasChanges || !instructions.trim()
                }
                variant="primary"
                size="md"
                isLoading={saving}
              >
                <Save className="h-4 w-4" />
                Save Instructions
              </Button>
              {hasChanges && (
                <Button
                  onClick={onReset}
                  disabled={saving}
                  variant="outline"
                  size="md"
                >
                  <Undo2 className="h-4 w-4" />
                  Discard
                </Button>
              )}
            </div>

            {!hasChanges && !loading && initialInstructions && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <ClipboardList className="h-3.5 w-3.5" />
                All changes saved
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surfaceMuted p-4">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-surface p-2 text-accent">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-accent">
              Best Practices
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              <li>- Be specific about the bot&apos;s role and personality.</li>
              <li>- Include guidelines for tone, style, and guardrails.</li>
              <li>- Mention any restrictions or escalation paths.</li>
              <li>
                - Keep it concise; shorter instructions often work better.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
