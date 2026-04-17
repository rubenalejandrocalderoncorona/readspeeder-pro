"use client";

import React, { useEffect, useState } from "react";

export function TitleBar() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri("__TAURI__" in window);
  }, []);

  if (!isTauri) return null;

  return (
    <div
      data-tauri-drag-region
      className="h-[28px] shrink-0 w-full flex items-center justify-center
                 bg-bg-elevated dark:bg-[#1c1c1e]
                 border-b border-border dark:border-border-dark
                 select-none z-50"
    >
      <span
        data-tauri-drag-region
        className="text-[12px] font-medium text-text-3 dark:text-text-3-dark tracking-wide"
      >
        ReadSpeeder Pro
      </span>
    </div>
  );
}
