"use client";

import React from "react";
import { clsx } from "clsx";

/* ── Button ────────────────────────────────────────────────────────────── */
interface MacButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function MacButton({ variant = "secondary", size = "md", className, children, ...props }: MacButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "select-none cursor-default rounded-[7px] whitespace-nowrap",
        "active:scale-[0.97] disabled:opacity-35 disabled:pointer-events-none",
        size === "sm" && "px-3 py-[5px] text-[12px] gap-1",
        size === "md" && "px-4 py-[7px] text-[13px] gap-1.5",
        size === "lg" && "px-5 py-2.5 text-[14px] gap-2",
        variant === "primary" && "bg-accent text-white shadow-sm hover:brightness-110",
        variant === "secondary" && [
          "bg-page dark:bg-white/[0.06] text-ink dark:text-white/70",
          "border border-ink/[0.10] dark:border-white/[0.10]",
          "shadow-sm hover:bg-parchment-2 dark:hover:bg-white/[0.10]",
        ],
        variant === "destructive" && "bg-danger text-white shadow-sm hover:brightness-110",
        variant === "ghost" && "text-ink-3 dark:text-white/40 hover:bg-ink/[0.05] dark:hover:bg-white/[0.06]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Card ──────────────────────────────────────────────────────────────── */
export function MacCard({ children, className, glass }: {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div className={clsx(
      "rounded-[10px] border",
      glass
        ? "glass border-white/30 dark:border-white/[0.06]"
        : "bg-page dark:bg-white/[0.04] border-ink/[0.07] dark:border-white/[0.07]",
      "shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

/* ── Badge ─────────────────────────────────────────────────────────────── */
export function MacBadge({ children, color = "gray" }: {
  children: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
}) {
  return (
    <span className={clsx(
      "inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-semibold tracking-wide uppercase",
      color === "blue"   && "bg-blue-50   text-blue-700   dark:bg-blue-900/25  dark:text-blue-300",
      color === "green"  && "bg-green-50  text-green-700  dark:bg-green-900/25 dark:text-green-300",
      color === "yellow" && "bg-amber-50  text-amber-700  dark:bg-amber-900/25 dark:text-amber-300",
      color === "red"    && "bg-red-50    text-red-700    dark:bg-red-900/25   dark:text-red-300",
      color === "gray"   && "bg-parchment-3 text-ink-3 dark:bg-white/[0.08] dark:text-white/40",
    )}>
      {children}
    </span>
  );
}

/* ── Progress Bar ──────────────────────────────────────────────────────── */
export function MacProgressBar({ value, color = "bg-accent", className }: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={clsx("h-[3px] rounded-full bg-ink/[0.08] dark:bg-white/[0.08] overflow-hidden", className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-300 ease-out", color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
