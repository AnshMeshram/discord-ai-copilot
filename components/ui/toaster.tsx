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
          success: "border-green-200 bg-green-50 text-green-700",
          error: "border-red-200 bg-red-50 text-red-700",
          info: "border-blue-200 bg-blue-50 text-blue-800",
        },
      }}
      position="bottom-right"
    />
  );
}
