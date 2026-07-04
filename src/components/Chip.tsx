import type { HTMLAttributes } from "react";

export type ChipVariant = "default" | "success" | "info" | "warn" | "danger";
export type ChipSize = "sm" | "md";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
}

const variantClasses: Record<ChipVariant, string> = {
  default: "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
  success:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
  info: "bg-sky-500/15 text-sky-700 dark:bg-sky-400/15 dark:text-sky-400",
  warn: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 dark:bg-red-400/15 dark:text-red-400",
};

const sizeClasses: Record<ChipSize, string> = {
  sm: "px-1.5 py-0 text-xs",
  md: "px-2.5 py-0.5 text-sm",
};

export default function Chip({
  variant = "default",
  size = "md",
  className,
  ...rest
}: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`}
      {...rest}
    />
  );
}
