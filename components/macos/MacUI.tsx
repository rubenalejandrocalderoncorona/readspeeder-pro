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
        "inline-flex items-center justify-center transition-all duration-[140ms]",
        "select-none cursor-default whitespace-nowrap font-[family-name:var(--font-mono)]",
        "active:scale-[0.97] disabled:opacity-35 disabled:pointer-events-none",
        "rounded-[var(--radius-sm)]",
        size === "sm" && "px-3 py-1 text-[10px] gap-1 tracking-[0.06em] uppercase",
        size === "md" && "px-4 py-[7px] text-[11px] gap-1.5 tracking-[0.06em] uppercase",
        size === "lg" && "px-5 py-2 text-[12px] gap-2 tracking-[0.06em] uppercase",
        variant === "primary" && [
          "bg-accent text-white dark:bg-accent-dark dark:text-[#111]",
          "border border-accent dark:border-accent-dark hover:brightness-110",
        ],
        variant === "secondary" && [
          "bg-transparent text-text-2 dark:text-text-2-dark",
          "border border-border dark:border-border-dark",
          "hover:border-border-strong dark:hover:border-border-strong-dark hover:text-text dark:hover:text-text-dark",
        ],
        variant === "destructive" && [
          "bg-danger text-white border border-danger hover:brightness-110",
        ],
        variant === "ghost" && [
          "text-text-3 dark:text-text-3-dark border border-transparent",
          "hover:bg-accent-subtle dark:hover:bg-white/[0.05] hover:text-text dark:hover:text-text-dark",
        ],
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
      "rounded-[var(--radius-md)] border",
      glass
        ? "glass border-white/20 dark:border-white/[0.05]"
        : "bg-surface dark:bg-surface-dark border-border dark:border-border-dark",
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
      "inline-flex items-center px-[6px] py-[2px] text-[9px] font-[family-name:var(--font-mono)]",
      "font-medium tracking-[0.10em] uppercase border rounded-[var(--radius-xs)]",
      color === "blue"   && "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-900/20   dark:text-blue-300   dark:border-blue-800/40",
      color === "green"  && "bg-green-50  text-green-700  border-green-200  dark:bg-green-900/20  dark:text-green-300  dark:border-green-800/40",
      color === "yellow" && "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-900/20  dark:text-amber-300  dark:border-amber-800/40",
      color === "red"    && "bg-red-50    text-red-700    border-red-200    dark:bg-red-900/20    dark:text-red-300    dark:border-red-800/40",
      color === "gray"   && "bg-bg-elevated text-text-3 border-border dark:bg-bg-elevated-dark dark:text-text-3-dark dark:border-border-dark",
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
    <div className={clsx("h-[3px] bg-border dark:bg-border-dark overflow-hidden relative", className)}>
      <div
        className={clsx("h-full transition-all duration-300 ease-out", color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
      {/* studytrack tick marks */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent calc(10% - 1px), rgba(0,0,0,0.06) calc(10% - 1px), rgba(0,0,0,0.06) 10%)" }} />
    </div>
  );
}
