"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Square, Play } from "lucide-react";
import { MacButton, MacProgressBar } from "@/components/macos/MacUI";
import { clsx } from "clsx";

interface ReaderControllerProps {
  isRunning: boolean;
  isComplete: boolean;
  isAutoPhase: boolean;
  countdown: number | null;
  progress: number;
  currentWpm: number;
  concentrationScore?: number;
  onStart: () => void;
  onStop: () => void;
  onAdvance: () => void;
  onRetreat: () => void;
  showConcentration: boolean;
}

export function ReaderController(p: ReaderControllerProps) {
  if (p.countdown !== null) {
    return (
      <div className="border-t border-ink/[0.06] dark:border-white/[0.06] bg-page/50 dark:bg-white/[0.02] px-6 py-6 flex flex-col items-center gap-2">
        <span className="text-5xl font-bold tabular-nums text-accent animate-[phraseAppear_0.08s_ease-out]">
          {p.countdown}
        </span>
        <span className="text-[12px] text-gray-400">Get ready…</span>
      </div>
    );
  }

  if (p.isComplete) {
    return (
      <div className="border-t border-ink/[0.06] dark:border-white/[0.06] bg-page/50 dark:bg-white/[0.02] px-6 py-5 flex flex-col items-center gap-3">
        <p className="text-[15px] font-semibold text-ok">Exercise complete!</p>
        <div className="flex gap-2">
          <MacButton variant="primary" onClick={p.onStart}>
            <Play size={13} /> Read Again
          </MacButton>
          <MacButton variant="secondary" onClick={p.onStop}>Back</MacButton>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-ink/[0.06] dark:border-white/[0.06] bg-page/50 dark:bg-white/[0.02] backdrop-blur-sm px-5 py-3 flex flex-col gap-2.5 shrink-0">
      <MacProgressBar
        value={p.progress * 100}
        color={p.isAutoPhase ? "bg-warn" : "bg-accent"}
      />

      <div className="flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-semibold tabular-nums text-ink-2 dark:text-white/70">
            {p.currentWpm > 0 ? `${p.currentWpm} WPM` : "—"}
          </span>
          {p.showConcentration && p.concentrationScore !== undefined && (
            <span className={clsx(
              "text-[12px] font-medium tabular-nums",
              p.concentrationScore >= 75 ? "text-ok" :
              p.concentrationScore >= 50 ? "text-warn" : "text-danger"
            )}>
              {p.concentrationScore}% focus
            </span>
          )}
          {p.isAutoPhase && (
            <span className="text-[11px] font-semibold text-warn uppercase tracking-wide">Auto</span>
          )}
        </div>

        {/* Buttons */}
        {p.isRunning ? (
          <div className="flex items-center gap-1.5">
            <MacButton size="sm" variant="ghost" onClick={p.onRetreat} disabled={p.isAutoPhase}>
              <ChevronLeft size={15} />
            </MacButton>
            <MacButton size="sm" variant="primary" onClick={p.onAdvance} disabled={p.isAutoPhase}>
              Next <ChevronRight size={13} />
            </MacButton>
            <MacButton size="sm" variant="ghost" onClick={p.onStop}>
              <Square size={11} />
            </MacButton>
          </div>
        ) : (
          <MacButton variant="primary" onClick={p.onStart}>
            <Play size={13} /> Start
          </MacButton>
        )}
      </div>

      {!p.isRunning && (
        <p className="text-[11px] text-ink-5 dark:text-white/20 text-center">
          Space or → to advance · ← to go back
        </p>
      )}
    </div>
  );
}
