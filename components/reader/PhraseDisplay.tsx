"use client";

import React from "react";
import { clsx } from "clsx";
import type { LessonConfig } from "@/lib/lessons";

interface PhraseDisplayProps {
  lesson: LessonConfig;
  phrases: string[];
  currentIndex: number;
  isAutoPhase: boolean;
  useSerif: boolean;
}

export function PhraseDisplay({ lesson, phrases, currentIndex, isAutoPhase, useSerif }: PhraseDisplayProps) {
  if (lesson.style === "stationary") return <Stationary lesson={lesson} phrases={phrases} currentIndex={currentIndex} isAutoPhase={isAutoPhase} useSerif={useSerif} />;
  if (lesson.style === "horizontal") return <Horizontal lesson={lesson} phrases={phrases} currentIndex={currentIndex} isAutoPhase={isAutoPhase} useSerif={useSerif} />;
  return <BlackGray lesson={lesson} phrases={phrases} currentIndex={currentIndex} isAutoPhase={isAutoPhase} useSerif={useSerif} />;
}

/* ── Stationary ──────────────────────────────────────────────────────────── */
function Stationary({ lesson, phrases, currentIndex, isAutoPhase, useSerif }: PhraseDisplayProps) {
  const font   = useSerif ? "font-serif" : "font-sans";
  const size   = lesson.reducedFontSize ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl";
  const phrase = phrases[currentIndex] ?? "";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-10">
      {lesson.showSurrounding && currentIndex > 0 && (
        <p className={clsx("text-[15px] text-text-5 dark:text-text-5-dark text-center max-w-xl", font)}>
          {phrases[currentIndex - 1]}
        </p>
      )}

      <div
        key={currentIndex}
        className={clsx(
          "px-8 py-5 rounded-[var(--radius-lg)] text-center leading-snug reader-text transition-all",
          "animate-[phraseAppear_0.08s_ease-out]",
          size, font,
          lesson.showBackground
            ? "bg-accent dark:bg-accent-dark text-white dark:text-[#111] shadow-[0_4px_20px_rgba(176,115,64,0.25)]"
            : "text-text dark:text-text-dark"
        )}
      >
        {phrase}
      </div>

      {lesson.showSurrounding && currentIndex < phrases.length - 1 && (
        <p className={clsx("text-[15px] text-text-5 dark:text-text-5-dark text-center max-w-xl", font)}>
          {phrases[currentIndex + 1]}
        </p>
      )}

      {isAutoPhase && <AutoBadge />}
    </div>
  );
}

/* ── Horizontal ──────────────────────────────────────────────────────────── */
function Horizontal({ lesson, phrases, currentIndex, isAutoPhase, useSerif }: PhraseDisplayProps) {
  const font    = useSerif ? "font-serif" : "font-sans";
  const size    = lesson.reducedFontSize ? "text-[14px]" : "text-[15px]";
  const window  = 9;
  const start   = Math.max(0, currentIndex - Math.floor(window / 2));
  const visible = phrases.slice(start, start + window);

  return (
    <div className={clsx("flex flex-col px-8 py-6 gap-1 h-full overflow-hidden", font, size)}>
      {visible.map((phrase, i) => {
        const abs     = start + i;
        const active  = abs === currentIndex;
        return (
          <div key={abs} className={clsx(
            "px-3 py-1.5 rounded-[var(--radius-sm)] whitespace-nowrap overflow-hidden transition-all duration-100",
            active
              ? lesson.showBackground
                ? "bg-accent dark:bg-accent-dark text-white dark:text-[#111] font-semibold"
                : "text-text dark:text-text-dark font-semibold"
              : "text-text-5 dark:text-text-5-dark"
          )}>
            {active && lesson.focusDots && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent dark:bg-accent-dark mr-2 mb-0.5 animate-[pulseDot_1.5s_ease-in-out_infinite]" />
            )}
            {phrase}
          </div>
        );
      })}
      {isAutoPhase && <AutoBadge />}
    </div>
  );
}

/* ── Black & Gray ────────────────────────────────────────────────────────── */
function BlackGray({ lesson, phrases, currentIndex, isAutoPhase, useSerif }: PhraseDisplayProps) {
  const font      = useSerif ? "font-serif" : "font-sans";
  const chunkSize = lesson.allowWrap ? 4 : 3;
  const pageStart = Math.floor(currentIndex / (chunkSize * 6)) * chunkSize * 6;
  const pageEnd   = Math.min(phrases.length, pageStart + chunkSize * 6);
  const page      = phrases.slice(pageStart, pageEnd);

  return (
    <div className={clsx("px-8 py-6 text-[15px] leading-relaxed", font)}>
      {lesson.allowWrap ? (
        <p className="reader-text">
          {page.map((phrase, i) => {
            const abs    = pageStart + i;
            const active = abs === currentIndex;
            return (
              <span key={abs} className={clsx(
                "transition-colors duration-75",
                active  ? "text-text dark:text-text-dark font-medium" :
                abs % 2 === 0 ? "text-text-2 dark:text-text-2-dark" : "text-text-5 dark:text-text-5-dark"
              )}>
                {phrase}{" "}
              </span>
            );
          })}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5 reader-text">
          {page.map((phrase, i) => {
            const abs    = pageStart + i;
            const active = abs === currentIndex;
            return (
              <span key={abs} className={clsx(
                "block transition-colors duration-75",
                active  ? "text-text dark:text-text-dark font-semibold" :
                abs % 2 === 0 ? "text-text-2 dark:text-text-2-dark" : "text-text-5 dark:text-text-5-dark"
              )}>
                {active && lesson.focusDots && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent dark:bg-accent-dark mr-2 mb-0.5 align-middle animate-[pulseDot_1.5s_ease-in-out_infinite]" />
                )}
                {phrase}
              </span>
            );
          })}
        </div>
      )}
      {isAutoPhase && <AutoBadge />}
    </div>
  );
}

function AutoBadge() {
  return (
    <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-full bg-warn-bg text-warn dark:text-warn-dark text-[11px] font-semibold uppercase tracking-wide">
      Auto Speed
    </div>
  );
}
