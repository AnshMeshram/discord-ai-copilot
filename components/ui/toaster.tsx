"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-border bg-surface text-text shadow-lg",
          success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          error: "border-red-500/30 bg-red-500/10 text-red-400",
          info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
          loading: "border-border bg-surfaceMuted text-text-muted",
          closeButton:
            "bg-surface border-border text-text-muted hover:bg-surfaceMuted hover:text-text",
        },
      }}
      position="bottom-right"
    />
  );
}
