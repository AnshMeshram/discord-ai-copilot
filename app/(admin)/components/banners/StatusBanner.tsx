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
    classes: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    classes: "border-amber-500/30 bg-amber-500/10 text-amber-400",
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
