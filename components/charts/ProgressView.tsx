"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, RotateCcw } from "lucide-react";
import { MacButton, MacCard } from "@/components/macos/MacUI";
import { useAppStore } from "@/store/useAppStore";

export default function ProgressView() {
  const exerciseHistory = useAppStore((s) => s.exerciseHistory);
  const resetProgress   = useAppStore((s) => s.resetProgress);

  const [confirmReset, setConfirmReset] = useState(false);

  // Segment speeds chart data
  const segmentData = useMemo(() => {
    return exerciseHistory.map((e, i) => ({
      index: i + 1,
      wpm: e.wpm,
      netWpm: e.netWpm,
      concentration: e.concentrationScore,
      lesson: e.lessonId,
      date: new Date(e.date).toLocaleDateString(),
    }));
  }, [exerciseHistory]);

  // Compute color thirds
  const allWpms = segmentData.map((d) => d.wpm).sort((a, b) => a - b);
  const third = Math.floor(allWpms.length / 3);
  const low = allWpms[third] ?? 0;
  const high = allWpms[2 * third] ?? 0;
  const barColor = (wpm: number) =>
    wpm >= high ? "#2d7d4f" : wpm >= low ? "#b45309" : "#b91c1c";

  // Daily words
  const dailyWords = useMemo(() => {
    const map: Record<string, number> = {};
    exerciseHistory.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      map[day] = (map[day] ?? 0) + e.wordCount;
    });
    return Object.entries(map).map(([date, words]) => ({ date, words })).slice(-30);
  }, [exerciseHistory]);

  // Daily speeds
  const dailySpeeds = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    exerciseHistory.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      if (!map[day]) map[day] = { total: 0, count: 0 };
      map[day].total += e.wpm;
      map[day].count += 1;
    });
    return Object.entries(map)
      .map(([date, d]) => ({ date, avgWpm: Math.round(d.total / d.count) }))
      .slice(-30);
  }, [exerciseHistory]);

  const csvData = useMemo(() => {
    const header = "Date,Lesson,WPM,NetWPM,Concentration,Words,Duration(s)";
    const rows = exerciseHistory.map((e) =>
      [new Date(e.date).toLocaleString(), e.lessonId, e.wpm, e.netWpm, e.concentrationScore, e.wordCount, Math.round(e.durationMs / 1000)].join(",")
    );
    return [header, ...rows].join("\n");
  }, [exerciseHistory]);

  const [showCsv, setShowCsv] = useState(false);

  if (exerciseHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-ink-4 dark:text-white/20">
        <div className="text-center">
          <p className="text-base font-medium">No progress yet</p>
          <p className="text-sm mt-1">Complete exercises in Lessons to see your progress here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-4 gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink dark:text-white/90">Progress</h2>
        <div className="flex gap-2">
          <MacButton size="sm" variant="ghost" onClick={() => setShowCsv((v) => !v)}>
            <Download size={13} className="mr-1.5" /> CSV
          </MacButton>
          {confirmReset ? (
            <>
              <MacButton size="sm" variant="destructive" onClick={() => { resetProgress(); setConfirmReset(false); }}>
                Confirm Reset
              </MacButton>
              <MacButton size="sm" variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </MacButton>
            </>
          ) : (
            <MacButton size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={13} className="mr-1.5" /> Reset
            </MacButton>
          )}
        </div>
      </div>

      {showCsv && (
        <MacCard>
          <div className="p-3">
            <textarea
              readOnly
              value={csvData}
              className="w-full h-32 text-xs font-mono bg-transparent resize-none outline-none text-ink-3 dark:text-white/40"
            />
          </div>
        </MacCard>
      )}

      {/* Segment Speeds */}
      <MacCard>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-ink-2 dark:text-white/60 mb-3">Segment Speeds</h3>
          <div className="text-xs text-ink-4 dark:text-white/30 mb-3">
            Green = top third · Yellow = middle · Red = bottom third. Shaded top = concentration deficit.
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segmentData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="index" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="glass border border-ink/[0.08] rounded-[8px] p-2 text-xs shadow-md">
                      <div className="font-semibold mb-1">Segment {d.index} · Lesson {d.lesson}</div>
                      <div>{d.wpm} WPM · Net: {d.netWpm}</div>
                      <div>Concentration: {d.concentration}%</div>
                      <div className="text-ink-4">{d.date}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="wpm" radius={[3, 3, 0, 0]}>
                {segmentData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.wpm)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MacCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Daily Words */}
        <MacCard>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-ink-2 dark:text-white/60 mb-3">Daily Words</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyWords} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} words`]} />
                <Bar dataKey="words" fill="#c17d2e" radius={[3, 3, 0, 0]} fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MacCard>

        {/* Daily Speeds */}
        <MacCard>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-ink-2 dark:text-white/60 mb-3">Daily Speeds</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={dailySpeeds} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${Number(v)} WPM`]} />
                <Line
                  type="monotone"
                  dataKey="avgWpm"
                  stroke="#2d7d4f"
                  strokeWidth={2}
                  dot={{ fill: "#2d7d4f", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MacCard>
      </div>
    </div>
  );
}
