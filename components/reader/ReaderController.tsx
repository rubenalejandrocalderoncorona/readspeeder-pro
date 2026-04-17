"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Square, Play, Maximize, Minimize } from "lucide-react";
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
  onQuit: () => void;
  showConcentration: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function ReaderController(p: ReaderControllerProps) {
  if (p.countdown !== null) {
    return (
      <div className="border-t border-border dark:border-border-dark bg-bg dark:bg-bg-dark px-6 py-6 flex flex-col items-center gap-2">
        <span className="text-5xl font-bold tabular-nums text-accent dark:text-accent-dark animate-[phraseAppear_0.08s_ease-out]">
          {p.countdown}
        </span>
        <span className="text-[12px] text-text-4 dark:text-text-4-dark">Get ready…</span>
      </div>
    );
  }

  if (p.isComplete) {
    return (
      <div className="border-t border-border dark:border-border-dark bg-bg dark:bg-bg-dark px-6 py-5 flex flex-col items-center gap-3">
        <p className="text-[15px] font-semibold text-ok dark:text-ok-dark">Exercise complete!</p>
        <div className="flex gap-2">
          <MacButton variant="primary" onClick={p.onStart}>
            <Play size={13} /> Read Again
          </MacButton>
          <MacButton variant="secondary" onClick={p.onStop}>Back</MacButton>
          <MacButton variant="ghost" onClick={p.onQuit}>← Books</MacButton>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border dark:border-border-dark bg-bg dark:bg-bg-dark px-5 py-3 flex flex-col gap-2.5 shrink-0">
      <MacProgressBar
        value={p.progress * 100}
        color={p.isAutoPhase ? "bg-warn dark:bg-warn-dark" : "bg-accent dark:bg-accent-dark"}
      />

      <div className="flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-semibold tabular-nums text-text-2 dark:text-text-2-dark">
            {p.currentWpm > 0 ? `${p.currentWpm} WPM` : "—"}
          </span>
          {p.showConcentration && p.concentrationScore !== undefined && (
            <span className={clsx(
              "text-[12px] font-medium tabular-nums",
              p.concentrationScore >= 75 ? "text-ok dark:text-ok-dark" :
              p.concentrationScore >= 50 ? "text-warn dark:text-warn-dark" : "text-danger dark:text-danger-dark"
            )}>
              {p.concentrationScore}% focus
            </span>
          )}
          {p.isAutoPhase && (
            <span className="text-[11px] font-semibold text-warn dark:text-warn-dark uppercase tracking-wide">Auto</span>
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
            <MacButton size="sm" variant="ghost" onClick={p.onToggleFullscreen} title={p.isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {p.isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            </MacButton>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MacButton variant="primary" onClick={p.onStart}>
              <Play size={13} /> Start
            </MacButton>
            <MacButton size="sm" variant="ghost" onClick={p.onToggleFullscreen} title={p.isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {p.isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            </MacButton>
          </div>
        )}
      </div>

      {!p.isRunning && (
        <p className="text-[11px] text-text-5 dark:text-text-5-dark text-center">
          Space or → to advance · ← to go back
        </p>
      )}
    </div>
  );
}
