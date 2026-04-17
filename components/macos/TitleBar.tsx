"use client";

import React, { useEffect, useState } from "react";

export function TitleBar({ title = "ReadSpeeder Pro" }: { title?: string }) {
  const [isTauri, setIsTauri] = useState(false);
  useEffect(() => { setIsTauri("__TAURI__" in window); }, []);
  if (!isTauri) return null;

  return (
    <div className="h-10 flex items-center justify-center shrink-0 relative drag-region select-none border-b border-black/[0.06] dark:border-white/[0.05] sidebar-blur">
      <div className="flex items-center gap-1.5 absolute left-3 no-drag">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>
      <span className="text-[12px] font-medium text-text-3 dark:text-text-3-dark tracking-wide">{title}</span>
    </div>
  );
}
