"use client";

import React, { useMemo, useCallback } from "react";
import { Lock, CheckCircle2, Circle } from "lucide-react";
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
      <div className="w-52 shrink-0 border-r border-black/[0.07] dark:border-white/[0.06] overflow-y-auto bg-mac-sidebar dark:bg-mac-sidebar-dark">
        <div className="py-3 px-2">
          {LESSON_GROUPS.map((group) => (
            <div key={group.name} className="mb-4">
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
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
                      "flex items-center gap-2 w-full px-2.5 py-[7px] rounded-[8px] text-[13px] text-left transition-all duration-100",
                      isActive  && "bg-mac-blue text-white font-medium",
                      !isActive && !isLocked && "text-gray-700 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]",
                      isLocked  && "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    )}
                  >
                    <span className="shrink-0">
                      {isLocked  ? <Lock size={11} className="text-gray-300 dark:text-gray-600" /> :
                       done      ? <CheckCircle2 size={11} className={isActive ? "text-white/80" : "text-mac-green"} /> :
                                   <Circle size={11} className={isActive ? "text-white/70" : "text-gray-300 dark:text-gray-600"} />}
                    </span>
                    <span className="flex-1">{lesson.name}</span>
                    {lp && lp.completedExercises > 0 && !isLocked && (
                      <span className={clsx("text-[10px]", isActive ? "text-white/60" : "text-gray-400")}>
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-3 bg-white/60 dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between shrink-0 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{lessonConfig.name}</h2>
              <MacBadge color="blue">{lessonConfig.group}</MacBadge>
              {lessonConfig.doublePass && <MacBadge color="yellow">Double Pass</MacBadge>}
              {lessonConfig.measureConcentration && <MacBadge color="green">Concentration</MacBadge>}
            </div>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{lessonConfig.description}</p>
          </div>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 shrink-0 ml-4">
            {progress?.completedExercises ?? 0}/15
          </p>
        </div>

        {/* Body */}
        {phrases.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
            <div className="text-center">
              <p className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 mb-1">No text loaded</p>
              <p className="text-[13px] text-gray-400 dark:text-gray-500">Upload a file or pick one from your library.</p>
            </div>
            <div className="w-full max-w-md">
              <FileUploader onLoaded={() => {}} />
            </div>
            {library.length > 0 && (
              <div className="w-full max-w-md">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Library</p>
                <div className="flex flex-col gap-1">
                  {library.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadText(item.id)}
                      className={clsx(
                        "flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] transition-all",
                        selectedTextId === item.id
                          ? "bg-mac-blue text-white"
                          : "bg-white dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <span className="truncate font-medium">{item.title}</span>
                      <span className={clsx("text-[11px] ml-2 shrink-0", selectedTextId === item.id ? "text-white/60" : "text-gray-400")}>
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
                  <p className="text-[15px] font-medium text-gray-400 dark:text-gray-500">Ready</p>
                  <p className="text-[12px] text-gray-300 dark:text-gray-600">{phrases.length} phrases loaded</p>
                  {autoSpeedWpm && lessonConfig.doublePass && (
                    <p className="text-[12px] text-mac-yellow mt-1">Auto speed: {autoSpeedWpm} WPM</p>
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
              showConcentration={lessonConfig.measureConcentration}
            />
          </>
        )}
      </div>
    </div>
  );
}
