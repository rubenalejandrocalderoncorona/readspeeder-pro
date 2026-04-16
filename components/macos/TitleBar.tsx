"use client";

import React from "react";
import { clsx } from "clsx";

export function TitleBar({ title = "ReadSpeeder Pro" }: { title?: string }) {
  return (
    <div className={clsx(
      "h-11 flex items-center justify-between px-4 shrink-0 relative",
      "mac-vibrancy border-b border-black/[0.07] dark:border-white/[0.07]",
      "drag-region select-none"
    )}>
      {/* Traffic lights */}
      <div className="flex items-center gap-2 no-drag">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:brightness-90 transition-all" />
        <div className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-90 transition-all" />
      </div>

      <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold text-gray-600 dark:text-gray-400 tracking-tight">
        {title}
      </span>

      <div className="w-14" />
    </div>
  );
}
