import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

export type StatusTone = "info" | "success" | "error";

type Props = {
  tone?: StatusTone;
  message: string;
  action?: ReactNode;
  className?: string;
};

const toneMap: Record<StatusTone, { icon: typeof Info; classes: string }> = {
  info: {
    icon: Info,
    classes: "border-blue-200 bg-blue-50 text-blue-800",
  },
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  error: {
    icon: AlertCircle,
    classes: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

export function StatusBanner({
  tone = "info",
  message,
  action,
  className,
}: Props) {
  const { icon: Icon, classes } = toneMap[tone];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
        classes,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{message}</span>
      {action}
    </div>
  );
}
