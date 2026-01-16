"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary",
  secondary:
    "bg-surface text-secondary border border-border hover:bg-surfaceElevated",
  outline:
    "bg-transparent text-text border border-border hover:bg-surfaceElevated",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger-dark focus-visible:ring-2 focus-visible:ring-danger",
  ghost: "bg-transparent text-secondary hover:bg-surfaceElevated",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs font-medium",
  md: "h-10 rounded-lg px-4 text-sm font-semibold",
  lg: "h-12 rounded-xl px-5 text-base font-semibold",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
