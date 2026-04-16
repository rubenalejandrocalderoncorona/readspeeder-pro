"use client";

import React from "react";
import { clsx } from "clsx";

/* ── MacButton ─────────────────────────────────────────────────────────── */
interface MacButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function MacButton({ variant = "secondary", size = "md", className, children, ...props }: MacButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-all duration-100",
        "select-none cursor-default rounded-[8px] whitespace-nowrap",
        "active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
        size === "sm" && "px-3 py-[5px] text-[12px] gap-1",
        size === "md" && "px-4 py-[7px] text-[13px] gap-1.5",
        size === "lg" && "px-5 py-2 text-[15px] gap-2",
        variant === "primary" && [
          "bg-mac-blue text-white",
          "shadow-[0_1px_3px_rgba(0,0,0,0.15)]",
          "hover:brightness-110",
        ],
        variant === "secondary" && [
          "bg-white dark:bg-white/[0.08] text-gray-800 dark:text-gray-200",
          "border border-black/[0.10] dark:border-white/[0.10]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.07)]",
          "hover:bg-gray-50 dark:hover:bg-white/[0.12]",
        ],
        variant === "destructive" && [
          "bg-mac-red text-white",
          "shadow-[0_1px_3px_rgba(0,0,0,0.15)]",
          "hover:brightness-110",
        ],
        variant === "ghost" && "text-gray-600 dark:text-gray-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── MacCard ───────────────────────────────────────────────────────────── */
export function MacCard({ children, className, glass }: {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div className={clsx(
      "rounded-[12px] border",
      glass
        ? "glass border-white/40 dark:border-white/[0.07]"
        : "bg-white dark:bg-white/[0.04] border-black/[0.07] dark:border-white/[0.07]",
      "shadow-[0_1px_4px_rgba(0,0,0,0.07)]",
      className
    )}>
      {children}
    </div>
  );
}

/* ── MacBadge ──────────────────────────────────────────────────────────── */
export function MacBadge({ children, color = "gray" }: {
  children: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
}) {
  return (
    <span className={clsx(
      "inline-flex items-center px-2 py-[3px] rounded-full text-[11px] font-semibold tracking-wide",
      color === "blue"   && "bg-blue-100   text-blue-700   dark:bg-blue-900/30  dark:text-blue-300",
      color === "green"  && "bg-green-100  text-green-700  dark:bg-green-900/30 dark:text-green-300",
      color === "yellow" && "bg-amber-100  text-amber-700  dark:bg-amber-900/30 dark:text-amber-300",
      color === "red"    && "bg-red-100    text-red-700    dark:bg-red-900/30   dark:text-red-300",
      color === "gray"   && "bg-gray-100   text-gray-500   dark:bg-gray-800     dark:text-gray-400",
    )}>
      {children}
    </span>
  );
}

/* ── MacProgressBar ────────────────────────────────────────────────────── */
export function MacProgressBar({ value, color = "bg-mac-blue", className }: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={clsx("h-[3px] rounded-full bg-black/[0.07] dark:bg-white/[0.08] overflow-hidden", className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-300 ease-out", color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
