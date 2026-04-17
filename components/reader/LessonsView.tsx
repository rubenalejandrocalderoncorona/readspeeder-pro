"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Lock, CheckCircle2, Circle, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { MacButton, MacBadge } from "@/components/macos/MacUI";
import { PhraseDisplay } from "@/components/reader/PhraseDisplay";
import { ReaderController } from "@/components/reader/ReaderController";
import { FileUploader } from "@/components/reader/FileUploader";
import { useSpeedReader } from "@/hooks/useSpeedReader";
import { useAppStore } from "@/store/useAppStore";
import { LESSONS, LESSON_GROUPS } from "@/lib/lessons";
import { calculateAutoSpeed, calculateConcentrationScore } from "@/lib/concentration";
import { segmentIntoPhrases, divideIntoExercises } from "@/lib/parser";

export default function LessonsView() {
  const activeLessonId    = useAppStore((s) => s.activeLessonId);
  const setActiveLesson   = useAppStore((s) => s.setActiveLesson);
  const lessonProgress    = useAppStore((s) => s.lessonProgress);
  const exerciseHistory   = useAppStore((s) => s.exerciseHistory);
  const phrases           = useAppStore((s) => s.phrases);
  const setPhrases        = useAppStore((s) => s.setPhrases);
  const maxPhrase         = useAppStore((s) => s.settings.maxPhrase);
  const useSerif          = useAppStore((s) => s.settings.useSerif);
  const recentSpeed       = useAppStore((s) => s.settings.recentSpeed);
  const library           = useAppStore((s) => s.library);
  const selectedTextId    = useAppStore((s) => s.selectedTextId);
  const setSelectedTextId = useAppStore((s) => s.setSelectedTextId);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const quitReading = useCallback(() => {
    setPhrases([]);
    setSelectedTextId(null);
  }, [setPhrases, setSelectedTextId]);

  const lessonConfig = LESSONS.find((l) => l.id === activeLessonId)!;
  const progress     = lessonProgress.find((lp) => lp.lessonId === activeLessonId);

  const recentWpms = useMemo(() =>
    exerciseHistory.filter((e) => e.lessonId === activeLessonId).slice(-3).map((e) => e.wpm),
    [exerciseHistory, activeLessonId]
  );

  const autoSpeedWpm = lessonConfig.doublePass
    ? calculateAutoSpeed(recentWpms.length ? recentWpms : [recentSpeed || 200])
    : undefined;

  const reader = useSpeedReader({ lessonId: activeLessonId, phrases, autoSpeedWpm });

  const liveConcentration = useMemo(() => {
    if (reader.timings.length < 3) return undefined;
    return calculateConcentrationScore(reader.timings);
  }, [reader.timings]);

  const loadText = useCallback((textId: string) => {
    const text = library.find((l) => l.id === textId);
    if (!text) return;
    const ps = segmentIntoPhrases(text.content, { maxWords: maxPhrase });
    setPhrases(divideIntoExercises(ps)[0] ?? ps);
    setSelectedTextId(textId);
  }, [library, maxPhrase, setPhrases, setSelectedTextId]);

  return (
    <div className="flex h-full">
      {/* ── Lesson list ─────────────────────────────────────────────── */}
      <div className="w-52 shrink-0 border-r border-border dark:border-border-dark overflow-y-auto bg-bg-elevated dark:bg-bg-elevated-dark">
        <div className="py-3 px-2">
          {LESSON_GROUPS.map((group) => (
            <div key={group.name} className="mb-4">
              <p className="px-2 mb-1 label-mono text-text-5 dark:text-text-5-dark">
                {group.name}
              </p>
              {group.ids.map((id) => {
                const lp      = lessonProgress.find((p) => p.lessonId === id);
                const lesson  = LESSONS.find((l) => l.id === id)!;
                const isActive = activeLessonId === id;
                const isLocked = !lp?.unlocked;
                const done     = (lp?.completedExercises ?? 0) >= 15;
                return (
                  <button
                    key={id}
                    onClick={() => !isLocked && setActiveLesson(id as any)}
                    className={clsx(
                      "flex items-center gap-2 w-full px-2.5 py-[7px] text-[13px] text-left transition-all duration-100",
                      "rounded-[var(--radius-sm)] border-l-2",
                      isActive  && "text-accent dark:text-accent-dark border-accent dark:border-accent-dark bg-accent-subtle dark:bg-accent-dim font-medium pl-[8px]",
                      !isActive && !isLocked && "text-text-2 dark:text-text-2-dark border-transparent pl-[8px] hover:bg-surface dark:hover:bg-surface-dark",
                      isLocked  && "text-text-5 dark:text-text-5-dark border-transparent pl-[8px] cursor-not-allowed"
                    )}
                  >
                    <span className="shrink-0">
                      {isLocked  ? <Lock size={11} className="text-text-5 dark:text-text-5-dark" /> :
                       done      ? <CheckCircle2 size={11} className={isActive ? "text-accent dark:text-accent-dark" : "text-ok dark:text-ok-dark"} /> :
                                   <Circle size={11} className={isActive ? "text-accent dark:text-accent-dark" : "text-text-5 dark:text-text-5-dark"} />}
                    </span>
                    <span className="flex-1">{lesson.name}</span>
                    {lp && lp.completedExercises > 0 && !isLocked && (
                      <span className={clsx("text-[10px]", isActive ? "text-accent dark:text-accent-dark" : "text-text-4 dark:text-text-4-dark")}>
                        {lp.completedExercises}/15
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className={clsx(
        "flex-1 flex flex-col min-w-0",
        isFullscreen && "fixed inset-0 z-50 bg-bg dark:bg-bg-dark"
      )}>
        {/* Header */}
        <div className="px-6 py-3 bg-bg dark:bg-bg-dark border-b border-border dark:border-border-dark flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {phrases.length > 0 && (
              <button
                onClick={quitReading}
                className="flex items-center gap-1 text-[12px] text-text-3 dark:text-text-3-dark hover:text-text-2 dark:hover:text-text-2-dark transition-colors shrink-0"
                title="Back to book selection"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-semibold text-text dark:text-text-dark">{lessonConfig.name}</h2>
                <MacBadge color="blue">{lessonConfig.group}</MacBadge>
                {lessonConfig.doublePass && <MacBadge color="yellow">Double Pass</MacBadge>}
                {lessonConfig.measureConcentration && <MacBadge color="green">Concentration</MacBadge>}
              </div>
              <p className="text-[12px] text-text-4 dark:text-text-4-dark mt-0.5">{lessonConfig.description}</p>
            </div>
          </div>
          <p className="text-[12px] text-text-4 dark:text-text-4-dark shrink-0 ml-4">
            {progress?.completedExercises ?? 0}/15
          </p>
        </div>

        {/* Body */}
        {phrases.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
            <div className="text-center">
              <p className="text-[15px] font-semibold text-text-2 dark:text-text-2-dark mb-1">No text loaded</p>
              <p className="text-[13px] text-text-4 dark:text-text-4-dark">Upload a file or pick one from your library.</p>
            </div>
            <div className="w-full max-w-md">
              <FileUploader onLoaded={() => {}} />
            </div>
            {library.length > 0 && (
              <div className="w-full max-w-md">
                <p className="label-mono text-text-5 dark:text-text-5-dark mb-2">Library</p>
                <div className="flex flex-col gap-1">
                  {library.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadText(item.id)}
                      className={clsx(
                        "flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] transition-all",
                        selectedTextId === item.id
                          ? "bg-accent dark:bg-accent-dark text-white dark:text-[#111]"
                          : "bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-2 dark:text-text-2-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
                      )}
                    >
                      <span className="truncate font-medium">{item.title}</span>
                      <span className={clsx("text-[11px] ml-2 shrink-0", selectedTextId === item.id ? "opacity-70" : "text-text-4 dark:text-text-4-dark")}>
                        {item.wordCount.toLocaleString()} w
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              {reader.isRunning || reader.isComplete ? (
                <PhraseDisplay
                  lesson={lessonConfig}
                  phrases={phrases}
                  currentIndex={reader.currentIndex}
                  isAutoPhase={reader.isAutoPhase}
                  useSerif={useSerif}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-[15px] font-medium text-text-4 dark:text-text-4-dark">Ready</p>
                  <p className="text-[12px] text-text-5 dark:text-text-5-dark">{phrases.length} phrases loaded</p>
                  {autoSpeedWpm && lessonConfig.doublePass && (
                    <p className="text-[12px] text-accent dark:text-accent-dark mt-1">Auto speed: {autoSpeedWpm} WPM</p>
                  )}
                </div>
              )}
            </div>
            <ReaderController
              isRunning={reader.isRunning}
              isComplete={reader.isComplete}
              isAutoPhase={reader.isAutoPhase}
              countdown={reader.countdown}
              progress={reader.progress}
              currentWpm={reader.lastWpm()}
              concentrationScore={liveConcentration}
              onStart={reader.start}
              onStop={reader.stop}
              onAdvance={reader.advance}
              onRetreat={reader.retreat}
              onQuit={quitReading}
              showConcentration={lessonConfig.measureConcentration}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </>
        )}
      </div>
    </div>
  );
}
