"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateConcentrationScore, calculateWpm, wpmToMsPerPhrase } from "@/lib/concentration";
import { useAppStore } from "@/store/useAppStore";

interface PhraseTimingEntry {
  phrase: string;
  durationMs: number;
}

interface UseSpeedReaderOptions {
  lessonId: number;
  phrases: string[];
  autoSpeedWpm?: number; // set for lessons 4, 8, 12
}

export function useSpeedReader({ lessonId, phrases, autoSpeedWpm }: UseSpeedReaderOptions) {
  const recordExercise = useAppStore((s) => s.recordExercise);
  const activeLessonId = useAppStore((s) => s.activeLessonId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isAutoPhase, setIsAutoPhase] = useState(false); // for double-pass lessons
  const [autoPassDone, setAutoPassDone] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const phraseStartRef = useRef<number>(0);
  const timingsRef = useRef<PhraseTimingEntry[]>([]);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);

  const isDoublePass = [4, 8, 12].includes(lessonId);
  const totalPhrases = phrases.length;

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  // Begin countdown then start
  const start = useCallback(() => {
    setCountdown(3);
    let count = 3;
    const tick = () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        setTimeout(tick, 1000);
      } else {
        setCountdown(null);
        setCurrentIndex(0);
        setIsRunning(true);
        setIsComplete(false);
        setIsAutoPhase(isDoublePass && !!autoSpeedWpm);
        setAutoPassDone(false);
        timingsRef.current = [];
        startTimeRef.current = performance.now();
        phraseStartRef.current = performance.now();
      }
    };
    setTimeout(tick, 1000);
  }, [isDoublePass, autoSpeedWpm]);

  const recordCurrentPhraseTime = useCallback((idx: number) => {
    const now = performance.now();
    const duration = now - phraseStartRef.current;
    if (phrases[idx]) {
      timingsRef.current.push({ phrase: phrases[idx], durationMs: duration });
    }
    phraseStartRef.current = now;
  }, [phrases]);

  const finishSession = useCallback(() => {
    clearAutoTimer();
    const durationMs = performance.now() - startTimeRef.current;
    const totalWords = phrases.reduce((sum, p) => sum + p.split(" ").length, 0);
    const wpm = calculateWpm(totalWords, durationMs);
    const concentrationScore = calculateConcentrationScore(timingsRef.current);
    const netWpm = Math.round(wpm * (concentrationScore / 100));

    recordExercise({
      lessonId: activeLessonId as any,
      exerciseIndex: 0,
      wpm,
      concentrationScore,
      netWpm,
      wordCount: totalWords,
      durationMs,
      phraseTimes: timingsRef.current.map((t) => t.durationMs),
    });

    setIsRunning(false);
    setIsComplete(true);
  }, [phrases, recordExercise, activeLessonId, clearAutoTimer]);

  // Manual advance (Space, Arrow, button)
  const advance = useCallback(() => {
    if (!isRunning || isAutoPhase) return;

    recordCurrentPhraseTime(currentIndex);
    const next = currentIndex + 1;

    if (next >= totalPhrases) {
      if (isDoublePass && !autoPassDone) {
        // Switch to auto phase
        setAutoPassDone(true);
        setIsAutoPhase(true);
        setCurrentIndex(0);
        phraseStartRef.current = performance.now();
      } else {
        finishSession();
      }
    } else {
      setCurrentIndex(next);
    }
  }, [isRunning, isAutoPhase, currentIndex, totalPhrases, isDoublePass, autoPassDone, recordCurrentPhraseTime, finishSession]);

  const retreat = useCallback(() => {
    if (!isRunning || isAutoPhase || currentIndex <= 0) return;
    recordCurrentPhraseTime(currentIndex);
    setCurrentIndex((i) => i - 1);
  }, [isRunning, isAutoPhase, currentIndex, recordCurrentPhraseTime]);

  // Auto-advance logic for auto phases
  useEffect(() => {
    if (!isRunning || !isAutoPhase || !autoSpeedWpm) return;

    const scheduleNext = (idx: number) => {
      const phrase = phrases[idx];
      if (!phrase) return;
      const delay = wpmToMsPerPhrase(autoSpeedWpm, phrase);

      const startAt = performance.now();
      const tick = () => {
        const elapsed = performance.now() - startAt;
        if (elapsed >= delay) {
          recordCurrentPhraseTime(idx);
          const next = idx + 1;
          if (next >= totalPhrases) {
            // Auto phase done — switch to manual re-read
            setIsAutoPhase(false);
            setCurrentIndex(0);
            phraseStartRef.current = performance.now();
          } else {
            setCurrentIndex(next);
            scheduleNext(next);
          }
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    scheduleNext(currentIndex);
    return clearAutoTimer;
  }, [isRunning, isAutoPhase, currentIndex, phrases, autoSpeedWpm, totalPhrases, recordCurrentPhraseTime, clearAutoTimer]);

  // Keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowRight") { e.preventDefault(); advance(); }
      if (e.code === "ArrowLeft") { e.preventDefault(); retreat(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, retreat]);

  const stop = useCallback(() => {
    clearAutoTimer();
    setIsRunning(false);
    setIsComplete(false);
    setCurrentIndex(0);
    timingsRef.current = [];
  }, [clearAutoTimer]);

  const lastWpm = (): number => {
    if (timingsRef.current.length < 2) return 0;
    const elapsed = performance.now() - startTimeRef.current;
    const words = phrases.slice(0, currentIndex + 1).reduce((s, p) => s + p.split(" ").length, 0);
    return calculateWpm(words, elapsed);
  };

  return {
    currentIndex,
    isRunning,
    isComplete,
    isAutoPhase,
    countdown,
    currentPhrase: phrases[currentIndex] ?? "",
    progress: totalPhrases > 0 ? (currentIndex + 1) / totalPhrases : 0,
    start,
    stop,
    advance,
    retreat,
    lastWpm,
    timings: timingsRef.current,
  };
}
